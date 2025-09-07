import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Utility to convert file to a base64 string for the Gemini API
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64Data = reader.result.split(',')[1];
        if (base64Data) {
            resolve(base64Data);
        } else {
            reject(new Error("Failed to extract base64 data from file."));
        }
      } else {
        reject(new Error("Failed to read file as data URL."));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

// Per coding guidelines, initialize GoogleGenAI with API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Updated systemInstruction to explicitly request all fields defined in the responseSchema for more reliable JSON output.
const systemInstruction = `You are an AI assistant for military strategic identification. Your task is to identify military vehicles and aircraft from images. Based on the provided image, provide a detailed analysis.

- Identify the asset's specific model (e.g., 'T-90 Main Battle Tank', 'F-35 Lightning II'), its likely country of origin, and its general type (e.g., 'Main Battle Tank', 'Fighter Aircraft', 'UAV').
- Provide a brief summary of details about the identified asset.
- Provide a confidence score from 0.0 to 1.0 for your identification.
- Classify it as 'FRIENDLY', 'HOSTILE', or 'UNKNOWN'. Classify assets commonly used by NATO or allied forces as 'FRIENDLY' and by opposing forces as 'HOSTILE'.
- Assess the threat level as 'NONE', 'LOW', 'MEDIUM', 'HIGH', or 'EXTREME' based on its potential danger in a combat scenario.
- Summarize its key technical and tactical capabilities, including primary armament, role, and notable features.
- Provide a list of 2-3 visually similar assets to the one you identified. If none are applicable, provide an empty list.

Provide your analysis in a structured JSON format.`;


export const identifyAsset = async (image: File): Promise<AnalysisResult> => {
  const model = 'gemini-2.5-flash';
  
  const imagePart = await fileToGenerativePart(image);

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            model: { type: Type.STRING, description: "The identified model of the asset (e.g., 'T-90 Main Battle Tank')." },
            origin: { type: Type.STRING, description: "The likely country of origin for the asset." },
            classification: { type: Type.STRING, description: "Classification of the asset: 'FRIENDLY', 'HOSTILE', or 'UNKNOWN'." },
            confidence: { type: Type.NUMBER, description: "Confidence score in the identification from 0.0 to 1.0." },
            details: { type: Type.STRING, description: "Brief details about the identified asset." },
            assetType: { type: Type.STRING, description: "The general type of the asset (e.g., 'Main Battle Tank', 'Fighter Aircraft', 'UAV')." },
            similarAssets: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 visually similar military assets." },
            threatLevel: { type: Type.STRING, description: "Assessed threat level: 'NONE', 'LOW', 'MEDIUM', 'HIGH', or 'EXTREME'." },
            capabilities: { type: Type.STRING, description: "A summary of the asset's tactical and technical capabilities (e.g., armament, range, primary role)." }
          },
          required: ["model", "origin", "classification", "confidence", "details", "assetType", "similarAssets", "threatLevel", "capabilities"],
        },
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("API returned an empty response.");
    }
    
    return JSON.parse(jsonText) as AnalysisResult;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to analyze asset: ${error.message}`);
    }
    throw new Error("An unknown error occurred during analysis.");
  }
};