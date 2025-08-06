import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play, Download, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScriptData {
  topic: string;
  duration: string;
  style: string;
  audience: string;
  additionalInfo: string;
}

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}

const APIKeyModal = ({ isOpen, onClose, onSave }: APIKeyModalProps) => {
  const [apiKey, setApiKey] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("gemini_api_key", apiKey);
      onSave(apiKey);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurar API Key do Gemini
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="apiKey">API Key do Google Gemini</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Cole sua API key aqui..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Obtenha sua API key em: https://makersuite.google.com/app/apikey
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Salvar
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ScriptGenerator = () => {
  const [scriptData, setScriptData] = useState<ScriptData>({
    topic: "",
    duration: "",
    style: "",
    audience: "",
    additionalInfo: "",
  });
  const [generatedScript, setGeneratedScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAPIModal, setShowAPIModal] = useState(false);
  const { toast } = useToast();

  const generateScript = async () => {
    const apiKey = localStorage.getItem("gemini_api_key");
    
    if (!apiKey) {
      setShowAPIModal(true);
      return;
    }

    if (!scriptData.topic || !scriptData.duration || !scriptData.style) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos o tópico, duração e estilo do vídeo.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const prompt = `
Crie um roteiro detalhado para um vídeo do YouTube com as seguintes especificações:

**Tópico:** ${scriptData.topic}
**Duração:** ${scriptData.duration} minutos
**Estilo:** ${scriptData.style}
**Público-alvo:** ${scriptData.audience || "Geral"}
**Informações adicionais:** ${scriptData.additionalInfo || "Nenhuma"}

O roteiro deve incluir:
1. Hook inicial (primeiros 15 segundos)
2. Introdução e apresentação do problema/tópico
3. Desenvolvimento do conteúdo principal (dividido em seções)
4. Call-to-action para inscrição e likes
5. Conclusão e próximos passos
6. Outro (final do vídeo)

Formate o roteiro de forma clara, com indicações de tempo aproximado para cada seção.
Use uma linguagem envolvente e adequada para YouTube.
Inclua sugestões de elementos visuais quando relevante.
`;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao gerar roteiro");
      }

      const data = await response.json();
      const script = data.candidates[0].content.parts[0].text;
      setGeneratedScript(script);

      toast({
        title: "Roteiro gerado!",
        description: "Seu roteiro foi criado com sucesso.",
      });
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro ao gerar roteiro",
        description: "Verifique sua API key e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadScript = () => {
    if (!generatedScript) return;

    const blob = new Blob([generatedScript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roteiro-${scriptData.topic.replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-card rounded-full border">
            <Play className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-youtube bg-clip-text text-transparent">
              Gerador de Roteiros YouTube
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Crie roteiros profissionais para seus vídeos do YouTube usando IA. 
            Personalize o conteúdo para seu público e estilo.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <Card className="shadow-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações do Roteiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topic">Tópico do Vídeo *</Label>
                <Input
                  id="topic"
                  placeholder="Ex: Como criar thumbnails que chamam atenção"
                  value={scriptData.topic}
                  onChange={(e) =>
                    setScriptData({ ...scriptData, topic: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duração (min) *</Label>
                  <Select
                    value={scriptData.duration}
                    onValueChange={(value) =>
                      setScriptData({ ...scriptData, duration: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Duração" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3">1-3 min</SelectItem>
                      <SelectItem value="3-5">3-5 min</SelectItem>
                      <SelectItem value="5-10">5-10 min</SelectItem>
                      <SelectItem value="10-15">10-15 min</SelectItem>
                      <SelectItem value="15-20">15-20 min</SelectItem>
                      <SelectItem value="20-25">20-25 min</SelectItem>
                      <SelectItem value="25-30">25-30 min</SelectItem>
                      <SelectItem value="30+">30+ min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="style">Estilo *</Label>
                  <Select
                    value={scriptData.style}
                    onValueChange={(value) =>
                      setScriptData({ ...scriptData, style: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="educativo">Educativo</SelectItem>
                      <SelectItem value="entretenimento">Entretenimento</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="vlog">Vlog</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="audience">Público-alvo</Label>
                <Input
                  id="audience"
                  placeholder="Ex: Criadores de conteúdo iniciantes"
                  value={scriptData.audience}
                  onChange={(e) =>
                    setScriptData({ ...scriptData, audience: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="additionalInfo">Informações Adicionais</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Pontos específicos que quer abordar, tom de voz, etc."
                  value={scriptData.additionalInfo}
                  onChange={(e) =>
                    setScriptData({ ...scriptData, additionalInfo: e.target.value })
                  }
                />
              </div>

              <Button
                onClick={generateScript}
                disabled={isLoading}
                className="w-full bg-gradient-youtube hover:bg-youtube-hover transition-all duration-300 animate-glow"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando Roteiro...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Gerar Roteiro
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultado */}
          <Card className="shadow-dark">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Roteiro Gerado</CardTitle>
                {generatedScript && (
                  <Button onClick={downloadScript} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedScript ? (
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {generatedScript}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Seu roteiro aparecerá aqui após a geração</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <APIKeyModal
        isOpen={showAPIModal}
        onClose={() => setShowAPIModal(false)}
        onSave={() => {}}
      />
    </div>
  );
};