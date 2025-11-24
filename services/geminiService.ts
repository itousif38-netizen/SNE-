import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EstimateItem } from "../types";

// Safe API Key retrieval that works for Vite (import.meta.env) and Create React App (process.env)
const getApiKey = () => {
  try {
    // Check for Vite env
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_KEY) {
      return (import.meta as any).env.VITE_API_KEY;
    }
    // Check for standard process.env (Create React App or Node)
    if (typeof process !== 'undefined' && process.env) {
      return process.env.REACT_APP_API_KEY || process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Could not retrieve API Key from environment.");
  }
  return "";
};

const apiKey = getApiKey();

// Initialize the Gemini client only if key exists, otherwise we'll handle errors gracefully later
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const estimateSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "Name of the material or labor task" },
          quantity: { type: Type.NUMBER, description: "Estimated quantity needed" },
          unit: { type: Type.STRING, description: "Unit of measurement (e.g., hours, sqft, pcs)" },
          unitPrice: { type: Type.NUMBER, description: "Estimated price per unit in Indian Rupees (INR)" },
          total: { type: Type.NUMBER, description: "Total cost for this item (quantity * unitPrice)" }
        },
        required: ["description", "quantity", "unit", "unitPrice", "total"]
      }
    },
    currency: { type: Type.STRING }
  },
  required: ["items"]
};

export const generateConstructionEstimate = async (projectDescription: string): Promise<EstimateItem[]> => {
  if (!ai) {
    console.error("API Key is missing. Please set VITE_API_KEY or REACT_APP_API_KEY in your environment variables.");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a detailed construction cost estimate for the following project: "${projectDescription}". 
      Break it down into materials and labor. Be realistic with current market prices in India (INR).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: estimateSchema,
        systemInstruction: "You are an expert construction estimator. Provide detailed, itemized lists of materials and labor required for construction projects. Be precise with units and conservative with pricing in Indian Rupees."
      }
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text);
    return data.items || [];
  } catch (error) {
    console.error("Error generating estimate:", error);
    throw error;
  }
};

export const chatWithSuperintendent = async (history: { role: string; parts: { text: string }[] }[], newMessage: string) => {
  if (!ai) {
    return "I can't connect right now. Please check your API Key configuration.";
  }

  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
      config: {
        systemInstruction: "You are a seasoned Construction Site Superintendent with 30 years of experience in India. You are knowledgeable about IS codes, safety regulations, project scheduling, concrete, framing, electrical, and plumbing basics. You are tough but helpful, prioritizing safety and quality above all else. Keep answers concise and actionable."
      }
    });

    const response = await chat.sendMessage({ message: newMessage });
    return response.text;
  } catch (error) {
    console.error("Error in chat:", error);
    throw error;
  }
};