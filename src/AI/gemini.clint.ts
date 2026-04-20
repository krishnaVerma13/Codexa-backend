import { GoogleGenerativeAI, GenerativeModel, SchemaType } from "@google/generative-ai";


if (!process.env.GEMINI_API_KEY) {
    
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const getGeminiModel = (): GenerativeModel => {
    return genAI.getGenerativeModel({
        model: "gemini-2.5-flash-preview-05-20",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    cleanCode: {
                        type: SchemaType.OBJECT,
                        properties: {
                            score: { type: SchemaType.NUMBER },
                            reason: { type: SchemaType.STRING },
                        },
                        required: ["score", "reason"],
                    },
                    security: {
                        type: SchemaType.OBJECT,
                        properties: {
                            score: { type: SchemaType.NUMBER },
                            reason: { type: SchemaType.STRING },
                        },
                        required: ["score", "reason"],
                    },
                    performance: {
                        type: SchemaType.OBJECT,
                        properties: {
                            score: { type: SchemaType.NUMBER },
                            reason: { type: SchemaType.STRING },
                        },
                        required: ["score", "reason"],
                    },
                    maintainability: {
                        type: SchemaType.OBJECT,
                        properties: {
                            score: { type: SchemaType.NUMBER },
                            reason: { type: SchemaType.STRING },
                        },
                        required: ["score", "reason"],
                    },
                    testing: {
                        type: SchemaType.OBJECT,
                        properties: {
                            score: { type: SchemaType.NUMBER },
                            reason: { type: SchemaType.STRING },
                        },
                        required: ["score", "reason"],
                    },
                },
                required: [
                    "cleanCode",
                    "security",
                    "performance",
                    "maintainability",
                    "testing",
                ],
            },
        },
    });
};