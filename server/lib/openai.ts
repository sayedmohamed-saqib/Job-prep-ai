import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
let openai: OpenAI | null = null;

export type LLMProvider = 'openai' | 'google';

export interface GenerateOptions {
  responseStyle: 'concise' | 'detailed';
  preparationMode: boolean;
  provider?: LLMProvider;
  maxTokens?: number;
  temperature?: number;
}

export async function generateResponse(
  question: string, 
  options: GenerateOptions = { 
    responseStyle: 'concise', 
    preparationMode: false,
    provider: 'openai'
  }
): Promise<{ text: string; confidence: number }[]> {
  try {
    if (options.provider === 'google') {
      const { generateResponseWithGoogle } = await import('./google-ai');
      return generateResponseWithGoogle(question, options);
    }

    // Lazy initialize OpenAI client only when needed
    if (!openai) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key is required for OpenAI provider');
      }
      openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an interview assistant helping candidates respond to interview questions.
            Generate ${options.responseStyle} responses that are professional and honest.
            Format: Generate 2 alternative responses as JSON array with fields:
            - text: the suggested response
            - confidence: number between 0-1 indicating how confident this response is`
        },
        {
          role: "user", 
          content: question
        }
      ],
      response_format: { type: "json_object" }
    });

    const suggestions = JSON.parse(response.choices[0].message.content || '{"responses": []}');
    return suggestions.responses;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate response suggestions');
  }
}