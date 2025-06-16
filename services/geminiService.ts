import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AI_MODELS, SYSTEM_INSTRUCTIONS, VIDEO_CONFIG, RANDOM_WORLD_THEMES } from "../constants";

// Types
interface WorldSetting {
    description: string;
    theme: string;
    videoUrl: string;
    videoMimeType: string;
}

interface StoryScene {
    nextSceneTextDescription: string;
    nextSceneVideoUrl: string;
    nextSceneVideoMimeType: string;
}

interface VideoResult {
    videoUrl: string;
    videoMimeType: string;
}

interface AudioResult {
    audioUrl: string;
    audioMimeType: string;
}

// Singleton AI client
class AIClient {
    private static instance: GoogleGenAI | null = null;

    static getInstance(): GoogleGenAI {
        if (!AIClient.instance) {
            const apiKey = process.env.API_KEY;
            if (!apiKey) {
                throw new Error("API_KEY is not configured. Cannot initialize Story Spark's AI.");
            }
            AIClient.instance = new GoogleGenAI({ apiKey });
        }
        return AIClient.instance;
    }
}

// Utility Functions
const streamToBlob = async (stream: ReadableStream<Uint8Array>, mimeType: string): Promise<Blob> => {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (value) chunks.push(value);
            if (done) break;
        }
        return new Blob(chunks, { type: mimeType });
    } finally {
        reader.releaseLock();
    }
};

const base64ToBlob = (base64Data: string, mimeType: string): Blob => {
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
};

const createWavBlob = (
    pcmData: Uint8Array,
    sampleRate: number = 24000,
    channels: number = 1,
    bitsPerSample: number = 16,
): Blob => {
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = channels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = pcmData.length;
    const fileSize = 36 + dataSize;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // Helper to write strings
    const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    // RIFF header
    writeString(0, "RIFF");
    view.setUint32(4, fileSize, true);
    writeString(8, "WAVE");

    // fmt chunk
    writeString(12, "fmt ");
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // audio format (PCM)
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // data chunk
    writeString(36, "data");
    view.setUint32(40, dataSize, true);

    // Copy PCM data
    const audioData = new Uint8Array(buffer, 44);
    audioData.set(pcmData);

    return new Blob([buffer], { type: "audio/wav" });
};

const getRandomTheme = (): string => {
    return RANDOM_WORLD_THEMES[Math.floor(Math.random() * RANDOM_WORLD_THEMES.length)];
};

const validateApiKey = (): string => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key is missing for video generation.");
    }
    return apiKey;
};

// Video Generation
export const generateVideoSceneFromText = async (textPrompt: string): Promise<VideoResult> => {
    try {
        const client = AIClient.getInstance();
        const enhancedPrompt = `${VIDEO_CONFIG.PROMPT_ENHANCER}${textPrompt}`;

        console.log("Requesting Veo video for prompt:", enhancedPrompt);

        let operation = await client.models.generateVideos({
            model: AI_MODELS.VEO,
            prompt: enhancedPrompt,
            config: {
                personGeneration: "dont_allow" as const,
                aspectRatio: VIDEO_CONFIG.ASPECT_RATIO,
                durationSeconds: VIDEO_CONFIG.DURATION_SECONDS,
                numberOfVideos: VIDEO_CONFIG.NUMBER_OF_VIDEOS,
            },
        });

        console.log("Veo operation started:", operation.name);

        // Poll for completion
        while (!operation.done) {
            await new Promise((resolve) => setTimeout(resolve, 10000));
            operation = await client.operations.getVideosOperation({ operation });
        }

        if (operation.error) {
            console.error("Veo operation error:", operation.error);
            throw new Error(`Video generation failed: ${operation.error.message || "Unknown error"}`);
        }

        console.log("Veo operation completed:", operation.name);

        const generatedVideoData = operation.response?.generatedVideos?.[0];
        if (!generatedVideoData?.video?.uri) {
            console.error("Veo response missing video URI:", operation.response);
            throw new Error("Video generation completed but no video URI was provided.");
        }

        // Fetch the generated video
        const videoUri = generatedVideoData.video.uri;
        const apiKey = validateApiKey();
        const fetchUrl = `${videoUri}&key=${apiKey}`;

        console.log("Fetching generated video...");
        const videoFetchResponse = await fetch(fetchUrl);

        if (!videoFetchResponse.ok) {
            const errorText = await videoFetchResponse.text();
            throw new Error(`Failed to fetch video (${videoFetchResponse.status}): ${errorText}`);
        }

        const responseBody = videoFetchResponse.body;
        if (!responseBody) {
            throw new Error("Video response body is empty.");
        }

        const videoMimeType = generatedVideoData.video.mimeType || "video/mp4";
        const videoBlob = await streamToBlob(responseBody, videoMimeType);
        const objectUrl = URL.createObjectURL(videoBlob);

        console.log("Video successfully processed and ready for playback");
        return { videoUrl: objectUrl, videoMimeType };
    } catch (error) {
        console.error("Video generation error:", error);
        throw error instanceof Error ? error : new Error("Unknown video generation error");
    }
};

// World Generation
export const generateWorldSettingFromPrompt = async (userPrompt: string): Promise<WorldSetting> => {
    try {
        if (!userPrompt?.trim()) {
            throw new Error("User prompt is required for world generation.");
        }

        const client = AIClient.getInstance();

        const descriptionResponse: GenerateContentResponse = await client.models.generateContent({
            model: AI_MODELS.GEMINI,
            contents: `Create a rich, immersive world based on this story idea: "${userPrompt.trim()}". Focus on the visual environment, atmosphere, and setting where this story would take place.`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTIONS.WORLD_GENERATION,
                temperature: 0.8,
                topP: 0.95,
                topK: 50,
            },
        });

        const worldDescription = descriptionResponse.text?.trim();
        if (!worldDescription) {
            console.warn("Gemini API returned empty world description for prompt:", userPrompt);
            throw new Error("Failed to generate world description. Please try again.");
        }

        const { videoUrl, videoMimeType } = await generateVideoSceneFromText(worldDescription);

        return {
            description: worldDescription,
            theme: userPrompt.trim(),
            videoUrl,
            videoMimeType,
        };
    } catch (error) {
        console.error("World generation error:", error);
        throw error instanceof Error ? error : new Error("Failed to generate world setting");
    }
};

export const generateRandomWorldSetting = async (): Promise<WorldSetting> => {
    try {
        const client = AIClient.getInstance();
        const randomTheme = getRandomTheme();

        const descriptionResponse: GenerateContentResponse = await client.models.generateContent({
            model: AI_MODELS.GEMINI,
            contents: `Generate a rich, visual description of a world based on this theme: "${randomTheme}"`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTIONS.WORLD_GENERATION,
                temperature: 0.8,
                topP: 0.95,
                topK: 50,
            },
        });

        const worldDescription = descriptionResponse.text?.trim();
        if (!worldDescription) {
            console.warn("Gemini API returned empty world description for theme:", randomTheme);
            throw new Error("Failed to generate random world description. Please try again.");
        }

        const { videoUrl, videoMimeType } = await generateVideoSceneFromText(worldDescription);

        return {
            description: worldDescription,
            theme: randomTheme,
            videoUrl,
            videoMimeType,
        };
    } catch (error) {
        console.error("Random world generation error:", error);
        throw error instanceof Error ? error : new Error("Failed to generate random world setting");
    }
};

// Text-to-Speech Generation
export const generateSceneNarration = async (sceneText: string): Promise<AudioResult> => {
    try {
        if (!sceneText?.trim()) {
            throw new Error("Scene text is required for narration generation.");
        }

        const client = AIClient.getInstance();

        // Create a more engaging narration prompt
        const narratorPrompt = `Narrate this story scene in an engaging, immersive way with a warm, storytelling voice: "${sceneText.trim()}"`;

        console.log("Requesting TTS for scene text (length:", sceneText.length, "characters)");

        const response = await client.models.generateContent({
            model: AI_MODELS.TTS,
            contents: [{ parts: [{ text: narratorPrompt }] }],
            config: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: "Aoede" }, // Breezy, good for storytelling
                    },
                },
            },
        });

        console.log("TTS response received:", {
            candidatesLength: response.candidates?.length,
            hasContent: !!response.candidates?.[0]?.content,
            partsLength: response.candidates?.[0]?.content?.parts?.length,
        });

        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!audioData) {
            console.error("TTS response structure:", JSON.stringify(response, null, 2));
            throw new Error("No audio data received from TTS generation.");
        }

        console.log("Audio data received (base64 length:", audioData.length, "characters)");

        // Convert base64 to PCM data (Gemini TTS returns 16-bit PCM at 24kHz)
        const binaryString = atob(audioData);
        const pcmData = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            pcmData[i] = binaryString.charCodeAt(i);
        }

        console.log("PCM data converted (length:", pcmData.length, "bytes)");

        // Create proper WAV file with headers (24kHz, 16-bit, mono)
        const audioBlob = createWavBlob(pcmData, 24000, 1, 16);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioMimeType = "audio/wav";

        console.log("Scene narration successfully generated:", {
            blobSize: audioBlob.size,
            blobType: audioBlob.type,
            audioUrl: audioUrl.substring(0, 50) + "...",
        });

        return { audioUrl, audioMimeType };
    } catch (error) {
        console.error("Scene narration error:", error);
        throw error instanceof Error ? error : new Error("Failed to generate scene narration");
    }
};

// Story Continuation
export const continueStoryInWorld = async (
    worldTheme: string,
    initialWorldDescription: string,
    storyHistory: string[],
    userAction: string,
): Promise<StoryScene> => {
    try {
        // Validate inputs
        if (!worldTheme?.trim() || !initialWorldDescription?.trim() || !userAction?.trim()) {
            throw new Error("World theme, description, and user action are required for story continuation.");
        }

        if (!Array.isArray(storyHistory)) {
            throw new Error("Story history must be an array.");
        }

        const client = AIClient.getInstance();
        const fullStorySoFar = storyHistory.join("\n\n---\n\n");

        const promptContent = `
The world is themed around: "${worldTheme.trim()}"
The initial detailed description of this world was: "${initialWorldDescription.trim()}"

So far, the story has unfolded like this:
---
${fullStorySoFar}
---

Now, the character/user wants to: "${userAction.trim()}"

Describe what happens next in 1 engaging paragraph. This description will be used to generate a video scene. Focus on visually rich details.`;

        const textResponse: GenerateContentResponse = await client.models.generateContent({
            model: AI_MODELS.GEMINI,
            contents: promptContent,
            config: {
                systemInstruction: SYSTEM_INSTRUCTIONS.STORY_CONTINUATION,
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
            },
        });

        const nextSceneTextDescription = textResponse.text?.trim();
        if (!nextSceneTextDescription) {
            console.warn("Gemini API returned empty continuation for action:", userAction);
            throw new Error("Failed to generate story continuation. Please try again.");
        }

        const { videoUrl, videoMimeType } = await generateVideoSceneFromText(nextSceneTextDescription);

        return {
            nextSceneTextDescription,
            nextSceneVideoUrl: videoUrl,
            nextSceneVideoMimeType: videoMimeType,
        };
    } catch (error) {
        console.error("Story continuation error:", error);
        throw error instanceof Error ? error : new Error("Failed to continue story");
    }
};
