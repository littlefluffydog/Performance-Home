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

const systemInstruction = `You are an AI assistant for military strategic identification. Your task is to identify military vehicles and aircraft from images. Based on the provided image, identify the asset's specific model (e.g., 'T-90 Main Battle Tank', 'F-35 Lightning II'), its likely country of origin, its general type (e.g., 'Main Battle Tank', 'Fighter Aircraft', 'UAV'), and classify it as 'FRIENDLY', 'HOSTILE', or 'UNKNOWN'.

- Classify assets commonly used by NATO or allied forces as 'FRIENDLY'.
- Classify assets commonly used by opposing or potentially adversarial forces as 'HOSTILE'.
- If the object is not a military asset or cannot be identified, classify as 'UNKNOWN'.

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
            details: { type: Type.STRING, description: "Brief details about the identified asset, including weapon systems if visible." },
            assetType: { type: Type.STRING, description: "The general type of the asset (e.g., 'Main Battle Tank', 'Fighter Aircraft', 'UAV')." },
          },
          required: ["model", "origin", "classification", "confidence", "details", "assetType"],
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
