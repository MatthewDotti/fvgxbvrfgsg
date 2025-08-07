import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play, Download, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AI_PROVIDERS, AIProvider, ScriptData } from "@/types/ai-providers";
import { APIKeyModal } from "@/components/ai/APIKeyModal";
import { ProviderSelector } from "@/components/ai/ProviderSelector";
import { ScriptGeneratorAPI } from "@/components/ai/ScriptGeneratorAPI";

export const ScriptGenerator = () => {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(AI_PROVIDERS[0]);
  const [scriptData, setScriptData] = useState<ScriptData>({
    topic: "",
    duration: "",
    style: "",
    styleKeywords: "",
    language: "",
    audience: "",
    additionalInfo: "",
  });
  const [generatedScript, setGeneratedScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAPIModal, setShowAPIModal] = useState(false);
  const { toast } = useToast();

  const generateScript = async () => {
    const apiKey = localStorage.getItem(selectedProvider.keyName);
    
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
      const script = await ScriptGeneratorAPI.generateScript(selectedProvider, scriptData, apiKey);
      setGeneratedScript(script);

      toast({
        title: "Roteiro gerado!",
        description: `Roteiro criado com sucesso usando ${selectedProvider.name}.`,
      });
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro ao gerar roteiro",
        description: `Verifique sua API key do ${selectedProvider.name} e tente novamente.`,
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
    a.download = `roteiro-${scriptData.topic.replace(/\s+/g, "-")}-${selectedProvider.id}.txt`;
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
            Crie roteiros profissionais para seus vídeos do YouTube usando múltiplas IAs. 
            Suporte para Gemini, ChatGPT, Claude, Grok e Mistral.
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
              <ProviderSelector 
                selectedProvider={selectedProvider}
                onProviderChange={setSelectedProvider}
              />

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
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="1-3">1-3 min</SelectItem>
                      <SelectItem value="3-5">3-5 min</SelectItem>
                      <SelectItem value="5-10">5-10 min</SelectItem>
                      <SelectItem value="10-15">10-15 min</SelectItem>
                      <SelectItem value="15-20">15-20 min</SelectItem>
                      <SelectItem value="20-25">20-25 min</SelectItem>
                      <SelectItem value="25-30">25-30 min</SelectItem>
                      <SelectItem value="30-35">30-35 min</SelectItem>
                      <SelectItem value="35-40">35-40 min</SelectItem>
                      <SelectItem value="40-45">40-45 min</SelectItem>
                      <SelectItem value="45-60">45-60 min</SelectItem>
                      <SelectItem value="60+">60+ min</SelectItem>
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
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="vlog-pessoal">Vlog Pessoal</SelectItem>
                      <SelectItem value="tutorial">Tutorial / How-To</SelectItem>
                      <SelectItem value="educacional">Educacional / Explicativo</SelectItem>
                      <SelectItem value="documentario">Documentário Curto</SelectItem>
                      <SelectItem value="top-10">Top 10 / Listas</SelectItem>
                      <SelectItem value="experimentos">Experimentos</SelectItem>
                      <SelectItem value="opiniao">Opinião / Comentário</SelectItem>
                      <SelectItem value="reacao">Reação (React)</SelectItem>
                      <SelectItem value="estudo-caso">Estudo de Caso</SelectItem>
                      <SelectItem value="desafio">Desafio</SelectItem>
                      <SelectItem value="analise-tecnica">Análise Técnica / Gráfica</SelectItem>
                      <SelectItem value="tecnologia">Tecnologia e Gadgets</SelectItem>
                      <SelectItem value="entrevistas">Entrevistas / Podcast</SelectItem>
                      <SelectItem value="curiosidades">Curiosidades / Fatos Rápidos</SelectItem>
                      <SelectItem value="motivacional">Motivacional / Mentalidade</SelectItem>
                      <SelectItem value="comparativo">Comparativo</SelectItem>
                      <SelectItem value="misterios">Mistérios e Teorias</SelectItem>
                      <SelectItem value="turismo">Turismo / Viagens</SelectItem>
                      <SelectItem value="ferramentas">Ferramentas / Dicas Práticas</SelectItem>
                      <SelectItem value="humor">Humor / Paródia / Satírico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="styleKeywords">Palavras-chave do Estilo</Label>
                <Input
                  id="styleKeywords"
                  placeholder="Ex: enérgico, dinâmico, casual, profissional"
                  value={scriptData.styleKeywords}
                  onChange={(e) =>
                    setScriptData({ ...scriptData, styleKeywords: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="language">Idioma do Roteiro</Label>
                <Select
                  value={scriptData.language}
                  onValueChange={(value) =>
                    setScriptData({ ...scriptData, language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                    <SelectItem value="en">Inglês</SelectItem>
                    <SelectItem value="es">Espanhol</SelectItem>
                    <SelectItem value="fr">Francês</SelectItem>
                    <SelectItem value="de">Alemão</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                    <SelectItem value="ja">Japonês</SelectItem>
                    <SelectItem value="ko">Coreano</SelectItem>
                    <SelectItem value="zh">Chinês (Mandarim)</SelectItem>
                    <SelectItem value="ru">Russo</SelectItem>
                    <SelectItem value="ar">Árabe</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
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
                    Gerando com {selectedProvider.name}...
                  </>
                ) : (
                  <>
                    <span className="mr-2">{selectedProvider.icon}</span>
                    <Play className="w-4 h-4 mr-2" />
                    Gerar com {selectedProvider.name}
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
                  <p className="text-xs mt-2">Provider selecionado: {selectedProvider.icon} {selectedProvider.name}</p>
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
        provider={selectedProvider}
      />
    </div>
  );
};