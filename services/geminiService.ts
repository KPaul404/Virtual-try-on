
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Part } from "@google/genai";

const getAiClient = (apiKey?: string | null) => {
  const key = apiKey || process.env.API_KEY;
  if (!key) {
    throw new Error("API_KEY environment variable is not set and no session key was provided.");
  }
  return new GoogleGenAI({ apiKey: key });
};

const fileToGenerativePart = (base64: string): Part => {
  // e.g., "data:image/jpeg;base64,...." -> ["data:image/jpeg", "...."]
  const [header, data] = base64.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1];
  
  if (!mimeType || !data) {
    throw new Error('Invalid base64 image string');
  }

  return {
    inlineData: {
      mimeType,
      data,
    },
  };
};

/**
 * Analyzes a fashion item image to generate a detailed color and texture description.
 * @param imageBase64 The base64 encoded image of the fashion item.
 * @param apiKey An optional session-based API key.
 * @returns A string containing the detailed description.
 */
export const analyzeImageForColor = async (imageBase64: string, apiKey?: string | null): Promise<string> => {
  const ai = getAiClient(apiKey);
  const imagePart = fileToGenerativePart(imageBase64);
  const prompt = "Analyze this image of a clothing item. Provide a highly detailed description of its color(s), hue(s), texture, and any patterns. Be very specific, e.g., 'deep cerulean blue with a slight teal undertone' instead of just 'blue'.";

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, { text: prompt }] },
  });

  return response.text;
};

/**
 * Generates a new image by dressing a model with a fashion item using Nano Banana.
 * @param collageBase64 The base64 encoded collage of the model and the fashion item.
 * @param colorDescription The detailed description of the fashion item.
 * @param refinementInstruction Optional instructions from the judge for a retry.
 * @param apiKey An optional session-based API key.
 * @returns An array of Parts from the Gemini response, expected to contain the new image.
 */
export const generateStyledImage = async (
  collageBase64: string,
  colorDescription: string,
  refinementInstruction: string = '',
  apiKey?: string | null
): Promise<Part[]> => {
  const ai = getAiClient(apiKey);
  const collagePart = fileToGenerativePart( collageBase64);

  let prompt = '';
    
  if (refinementInstruction) {
    // This is a retry
    prompt = `You are an expert virtual stylist. Your task is to correct a failed attempt at dressing a model.
The provided collage contains:
1. The model who needs to be styled.
2. The target fashion item she should wear.
3. A previous, incorrect image you generated.

**Your Goal:** Generate a NEW, single, photorealistic image of the model wearing the fashion item, fixing the previous errors.

**Feedback to address:** You MUST incorporate this feedback: "${refinementInstruction}"

**Crucial Rules:**
- **Strict Preservation (Most Important Rule):** You MUST preserve the model's exact pose, facial expression, hair, body shape, and skin tone from the original photo. The background must also remain completely unchanged. The ONLY thing you are allowed to change is the clothing.
- **Exact Clothing Match:** The clothing on the model must be an exact replica of the target fashion item. Use this detailed description for accuracy: "${colorDescription}". Pay close attention to the item's length, fit, color, and pattern.
- **Final Output:** Your output must be a single, clean image of the newly styled model. Do not include elements from the collage.`;

  } else {
    // This is the first attempt
    prompt = `You are an expert virtual stylist. Your task is to dress a model with a fashion item.
The provided collage contains a person (the model) and a piece of clothing (the fashion item).

**Your Goal:** Generate a new, single, photorealistic image of the model wearing the fashion item.

**Crucial Rules:**
- **Strict Preservation (Most Important Rule):** You MUST preserve the model's exact pose, facial expression, hair, body shape, and skin tone from the original photo. The background must also remain completely unchanged. The ONLY thing you are allowed to change is the clothing.
- **Exact Clothing Match:** The clothing on the model must be an exact replica of the fashion item from the collage. Use this detailed description for accuracy: "${colorDescription}". Pay close attention to the item's length, fit, color, and pattern.
- **Natural Fit:** The clothing must look natural on the model, fitting their body and pose correctly.
- **Final Output:** Your output must be a single, clean image of the newly styled model. Do not include the separate fashion item in your final image.`;
  }


  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: { parts: [collagePart, { text: prompt }] },
    config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  if (response.promptFeedback?.blockReason) {
      throw new Error(`Image generation was blocked. Reason: ${response.promptFeedback.blockReason}`);
  }

  if (!response.candidates || response.candidates.length === 0) {
      throw new Error("Image generation failed: The model did not return any content.");
  }

  const parts = response.candidates[0].content?.parts;
  if (!parts || parts.length === 0) {
      throw new Error("Image generation failed: The model returned a candidate with no content parts.");
  }
  
  return parts;
};

/**
 * Acts as a judge to evaluate the generated image against the original.
 * @param originalItemBase64 The base64 image of the original fashion item.
 * @param generatedImageBase64 The base64 image of the AI-generated result.
 * @param originalDescription The description that guided the generation.
 * @param apiKey An optional session-based API key.
 * @returns An object with a decision ('accept' or 'refine') and feedback.
 */
export const judgeGeneratedImage = async (
  originalItemBase64: string,
  generatedImageBase64: string,
  originalDescription: string,
  apiKey?: string | null
): Promise<{ decision: string; feedback: string }> => {
  const ai = getAiClient(apiKey);
  const originalPart = fileToGenerativePart(originalItemBase64);
  const generatedPart = fileToGenerativePart(generatedImageBase64);

  const prompt = `You are an expert fashion quality control judge.
    You will be given the original clothing item, the AI-generated image of a model wearing it, and the original description.
    Your task is to determine if the generated image is a high-quality, accurate match.
    
    CRITERIA:
    1.  **Color Accuracy:** Does the item in the generated image perfectly match the original description: "${originalDescription}"? Check hues, saturation, and tones.
    2.  **Design Fidelity:** Are the patterns, cut, and details of the item faithfully reproduced?
    3.  **Length Accuracy:** Does the length of the clothing in the generated image (e.g., knee-length, floor-length) match the original item?
    4.  **Integration Quality:** Does the clothing look natural on the model? Are there any weird artifacts?
    
    Respond with a JSON object.
    - If it's a perfect or very close match, set "decision" to "accept" and provide brief positive "feedback".
    - If it's not a good match, set "decision" to "refine" and provide specific, actionable "feedback" for the AI to fix the image on the next try (e.g., "The dress color is too bright, it needs to be a deeper mustard yellow.").`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [
      { text: "Original Item:" }, originalPart,
      { text: "Generated Image:" }, generatedPart,
      { text: prompt }
    ] },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            decision: { type: Type.STRING, description: 'Either "accept" or "refine".' },
            feedback: { type: Type.STRING, description: 'Your detailed feedback.' },
        },
        required: ["decision", "feedback"]
      }
    }
  });
  
  try {
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch(e) {
    console.error("Failed to parse judge's JSON response:", response.text);
    // Fallback in case of parsing error
    return {
        decision: 'refine',
        feedback: 'The judge returned an invalid response. Assuming a refinement is needed. Raw response: ' + response.text
    }
  }
};

/**
 * Filters a list of generated images, returning only those that are different from the original model image.
 * @param originalModelBase64 The base64 image of the original model.
 * @param generatedImages An array of base64 images generated by the AI.
 * @param apiKey An optional session-based API key.
 * @returns A promise that resolves to an array of base64 images that show the model in different clothing.
 */
export const filterUnchangedImages = async (
  originalModelBase64: string,
  generatedImages: string[],
  apiKey?: string | null
): Promise<string[]> => {
  if (generatedImages.length === 0) {
    return [];
  }

  const ai = getAiClient(apiKey);
  const originalPart = fileToGenerativePart(originalModelBase64);
  const generatedParts = generatedImages.map(fileToGenerativePart);

  const prompt = `You are a strict image comparison expert. You will receive one "Original Image" and a list of "Candidate Images".
Your goal is to identify which candidates show the person in DIFFERENT clothing.

**Critical Instructions:**
1.  For each Candidate Image, compare it to the Original Image.
2.  Your ONLY criterion is the clothing. Ignore minor changes in lighting, pose, or background.
3.  If a candidate's clothing is identical, nearly identical, or the same type and color as the original, it is a MATCH and must be excluded.
4.  Only include a candidate's index if the clothing is UNDENIABLY and SIGNIFICANTLY different (e.g., a dress changed to a sweatsuit).

**Output Format:**
Respond ONLY with a JSON object. It must have one key: "changed_indices".
The value must be an array of numbers representing the 0-based indices of the candidates with different clothing.
If NO candidates have different clothing, you MUST return an empty array: \`[]\`. Do not guess.`;

  const contents: { parts: Part[] } = {
    parts: [
      { text: "Original Image:" },
      originalPart,
      { text: "\n\nCandidate Images:" },
    ]
  };

  generatedParts.forEach((part, index) => {
    contents.parts.push({ text: `\nCandidate ${index}:` });
    contents.parts.push(part);
  });
  
  contents.parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            changed_indices: { 
              type: Type.ARRAY,
              items: {
                type: Type.NUMBER
              },
              description: 'An array of 0-based indices for candidate images with changed clothing.'
            },
        },
        required: ["changed_indices"]
      }
    }
  });

  try {
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText) as { changed_indices: number[] };
    const changedIndices = new Set(result.changed_indices);
    
    return generatedImages.filter((_, index) => changedIndices.has(index));
  } catch (e) {
    console.error("Failed to parse filter JSON response:", response.text, e);
    // If parsing fails, assume no images were changed to be safe.
    return [];
  }
};
