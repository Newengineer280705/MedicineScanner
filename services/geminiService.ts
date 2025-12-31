import { GoogleGenerativeAI } from "@google/generative-ai";
import { MedicineData, Language } from "../types";

const getAIResult = async (base64Image: string, language: Language = 'en'): Promise<MedicineData> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please check your .env.local file.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const languageName = language === 'hi' ? 'Hindi' : 'English';

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image,
              },
            },
            {
              text: `You are a helpful and careful medical assistant for elderly patients. 
              Identify the medicine in the image (pill, blister pack, or bottle). 
              Provide the Name, a very Simple Usage explanation, common Side Effects, and a Safety Warning. 
              
              IMPORTANT: Provide all information in ${languageName} language.
              Keep language extremely simple and easy to understand for elderly people.
              If the image is not a medicine or is unclear, return 'Unknown Medicine' as the name and ask the user to try again in the usage field.
              
              Return the response as a JSON object with the following schema:
              {
                "name": "string",
                "usage": "string",
                "sideEffects": ["string"],
                "warning": "string"
              }`
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(text) as MedicineData;
    return data;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};

export const analyzeMedicineImage = getAIResult;

export const chatWithAI = async (message: string, history: { role: 'user' | 'assistant', content: string }[], language: Language = 'en'): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key not found.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const languageName = language === 'hi' ? 'Hindi' : 'English';

  const chat = model.startChat({
    history: history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
    generationConfig: {
      maxOutputTokens: 500,
    },
  });

  const prompt = `You are MediSahayak, a helpful health assistant for elderly people. 
  Answer the following user query in ${languageName} language. 
  Keep instructions simple, clear, and empathetic. 
  Always include a disclaimer that you are an AI and not a substitute for professional medical advice.
  
  User query: ${message}`;

  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  return response.text();
};
