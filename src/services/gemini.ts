import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAIInstance() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function getTravelAdvice(prompt: string, context?: string) {
  try {
    const ai = getAIInstance();
    const systemInstruction = `You are ItaliaGo Concierge, a luxury travel assistant for Italy. You are sophisticated, knowledgeable about Italian culture, history, and cuisine. You help users plan their trips, book hotels, find the best pasta, and navigate Italian cities. Keep your tone elegant and helpful.
    
    ${context ? `Here is the current context of available options in the app:\n${context}` : ''}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I apologize, but I am having trouble connecting to my knowledge base. How else can I assist your Italian journey?";
  }
}

const translationCache: Record<string, string> = {};
const requestQueue: (() => Promise<void>)[] = [];
let isProcessingQueue = false;

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const task = requestQueue.shift();
    if (task) {
      await task();
      // Wait a bit between requests to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  isProcessingQueue = false;
}

export async function translateContent(text: string, targetLang: string) {
  if (!text || text.trim() === '') return text;
  
  const cacheKey = `${targetLang}:${text}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  return new Promise<string>((resolve) => {
    const task = async () => {
      try {
        const ai = getAIInstance();
        const langMap: Record<string, string> = {
          en: 'English',
          it: 'Italian',
          ru: 'Russian',
          hy: 'Armenian'
        };

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Translate the following travel-related text into ${langMap[targetLang] || targetLang}. Maintain the luxury and sophisticated tone. Only return the translated text, nothing else.\n\nText: ${text}`,
        });
        
        const translated = response.text || text;
        translationCache[cacheKey] = translated;
        resolve(translated);
      } catch (error: any) {
        console.error("Translation Error:", error);
        // If it's a 429, we don't cache it so we can try again later, but we resolve with original text for now
        resolve(text);
      }
    };

    requestQueue.push(task);
    processQueue();
  });
}
