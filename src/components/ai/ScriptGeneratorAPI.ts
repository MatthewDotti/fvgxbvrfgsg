import { AIProvider, ScriptData } from "@/types/ai-providers";

export class ScriptGeneratorAPI {
  static async generateScript(provider: AIProvider, scriptData: ScriptData, apiKey: string): Promise<string> {
    const prompt = this.buildPrompt(scriptData);

    switch (provider.id) {
      case 'gemini':
        return this.callGemini(apiKey, prompt);
      case 'openai':
        return this.callOpenAI(apiKey, prompt);
      case 'claude':
        return this.callClaude(apiKey, prompt);
      case 'grok':
        return this.callGrok(apiKey, prompt);
      case 'mistral':
        return this.callMistral(apiKey, prompt);
      default:
        throw new Error(`Provider ${provider.id} não suportado`);
    }
  }

  private static buildPrompt(scriptData: ScriptData): string {
    return `
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
  }

  private static async callGemini(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) throw new Error("Erro ao gerar roteiro com Gemini");
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private static async callOpenAI(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error("Erro ao gerar roteiro com OpenAI");
    
    const data = await response.json();
    return data.choices[0].message.content;
  }

  private static async callClaude(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error("Erro ao gerar roteiro com Claude");
    
    const data = await response.json();
    return data.content[0].text;
  }

  private static async callGrok(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        model: "grok-beta",
        stream: false,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error("Erro ao gerar roteiro com Grok");
    
    const data = await response.json();
    return data.choices[0].message.content;
  }

  private static async callMistral(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error("Erro ao gerar roteiro com Mistral");
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
}