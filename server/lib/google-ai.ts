import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_CLOUD_API_KEY || '');

interface GenerateOptions {
  responseStyle: 'concise' | 'detailed';
  preparationMode: boolean;
  maxTokens?: number;
  temperature?: number;
}

export async function generateResponseWithGoogle(
  question: string, 
  options: GenerateOptions
): Promise<{ text: string; confidence: number }[]> {
  try {
    // Use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `As an interview assistant, analyze the following question and provide ${options.responseStyle} responses.
    Question: ${question}
    Format the response as a JSON array with these fields for each suggestion:
    - text: the suggested response
    - confidence: number between 0-1 indicating confidence level`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const suggestions = JSON.parse(text);
      return Array.isArray(suggestions) ? suggestions : suggestions.responses;
    } catch (error) {
      // If JSON parsing fails, format the response ourselves
      return [{
        text: text,
        confidence: 0.7 // default confidence when parsing fails
      }];
    }
  } catch (error) {
    console.error('Google AI API error:', error);
    throw new Error('Failed to generate response suggestions with Google AI');
  }
}
