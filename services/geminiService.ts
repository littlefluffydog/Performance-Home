
import { GoogleGenAI, Modality } from "@google/genai";
import { EditedImageResult } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            // Handle ArrayBuffer case if necessary, though for data URLs it's usually a string
            // For simplicity, we assume string result here.
            resolve('');
        }
    };
    reader.readAsDataURL(file);
  });
  const base64EncodedData = await base64EncodedDataPromise;
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

export const editImageWithGemini = async (imageFile: File, prompt: string): Promise<EditedImageResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = await fileToGenerativePart(imageFile);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [
        imagePart,
        { text: prompt },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });
  
  const result: EditedImageResult = {
      imageUrl: null,
      text: null
  };

  if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
          if (part.text) {
              result.text = part.text;
          } else if (part.inlineData) {
              const base64ImageBytes: string = part.inlineData.data;
              const mimeType = part.inlineData.mimeType;
              result.imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
          }
      }
  }
  
  if (!result.imageUrl) {
      throw new Error("The model did not return an image. Please try a different prompt.");
  }

  return result;
};
