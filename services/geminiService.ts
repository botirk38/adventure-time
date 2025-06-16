import { GoogleGenAI } from "@google/genai";
import { GenerateContentResponse } from "@google/genai";
import {
  GEMINI_MODEL_NAME,
  VEO_MODEL_NAME,
  STORY_SYSTEM_INSTRUCTION,
  WORLD_GENERATION_SYSTEM_INSTRUCTION,
  STORY_CONTINUATION_SYSTEM_INSTRUCTION,
  RANDOM_WORLD_THEMES,
  VIDEO_SCENE_PROMPT_ENHANCER,
} from '../constants';

let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error(
        "API_KEY is not configured. Cannot initialize Story Spark's AI."
      );
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

async function streamToBlob(
  stream: ReadableStream<Uint8Array>,
  mimeType: string
): Promise<Blob> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (value) chunks.push(value);
    if (done) break;
  }
  return new Blob(chunks, { type: mimeType });
}

export const generateVideoSceneFromText = async (
  textPrompt: string
): Promise<{ videoUrl: string; videoMimeType: string }> => {
  const client = getAiClient();
  const enhancedPrompt = `${VIDEO_SCENE_PROMPT_ENHANCER}${textPrompt}`;

  console.log("Requesting Veo video for prompt:", enhancedPrompt);
  let operation: any = await client.models.generateVideos({
    model: VEO_MODEL_NAME,
    prompt: enhancedPrompt,
    config: {
      personGeneration: "dont_allow",
      aspectRatio: "16:9",
      durationSeconds: 5,
      numberOfVideos: 1,
    },
  });
  console.log("Veo operation started:", operation.name);

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await client.operations.getVideosOperation(operation.name);
  }

  if (operation.error) {
    throw operation.error;
  }

  console.log(
    "Veo operation finished:",
    operation.name,
    "Response:",
    operation.response
  );

  const generatedVideoData = operation.response?.generatedVideos?.[0];
  if (!generatedVideoData?.video?.uri) {
    console.error("Veo response missing video URI:", operation.response);
    throw new Error("Veo response missing video URI.");
  }

  const videoUri = generatedVideoData.video.uri;
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing for fetching video.");
  }
  const fetchUrl = `${videoUri}&key=${apiKey}`;

  console.log("Fetching video from URI:", videoUri);
  const videoFetchResponse = await fetch(fetchUrl);

  if (!videoFetchResponse.ok) {
    const errorText = await videoFetchResponse.text();
    throw new Error(`Status ${videoFetchResponse.status}: ${errorText}`);
  }

  if (!videoFetchResponse.body) {
    throw new Error("Video response from Veo contained no data stream.");
  }

  const videoMimeType = generatedVideoData.video.mimeType || 'video/mp4';
  const videoBlob = await streamToBlob(videoFetchResponse.body, videoMimeType);
  const objectUrl = URL.createObjectURL(videoBlob);

  console.log("Video processed into Object URL:", objectUrl);
  return { videoUrl: objectUrl, videoMimeType };
};

export const generateStoryFromUserPrompt = async (
  userPrompt: string
): Promise<string> => {
  const client = getAiClient();

  const response: GenerateContentResponse = await client.models.generateContent({
    model: GEMINI_MODEL_NAME,
    contents: userPrompt,
    config: {
      systemInstruction: STORY_SYSTEM_INSTRUCTION,
      temperature: 0.75,
      topP: 0.95,
      topK: 40,
    },
  });

  const storyText = response.text;
  if (!storyText || storyText.trim() === "") {
    console.warn("Gemini API returned an empty story for prompt:", userPrompt);
    throw new Error("Gemini API returned an empty story.");
  }
  return storyText.trim();
};

export const generateRandomWorldSetting = async (): Promise<{
  description: string;
  theme: string;
  videoUrl: string;
  videoMimeType: string;
}> => {
  const client = getAiClient();
  const randomTheme =
    RANDOM_WORLD_THEMES[Math.floor(Math.random() * RANDOM_WORLD_THEMES.length)];

  const descriptionResponse: GenerateContentResponse =
    await client.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: `Generate a rich, visual description of a world based on this theme: "${randomTheme}"`,
      config: {
        systemInstruction: WORLD_GENERATION_SYSTEM_INSTRUCTION,
        temperature: 0.8,
        topP: 0.95,
        topK: 50,
      },
    });

  const worldDescription = descriptionResponse.text;
  if (!worldDescription || worldDescription.trim() === "") {
    console.warn(
      "Gemini API returned an empty world description for theme:",
      randomTheme
    );
    throw new Error("Gemini API returned an empty world description.");
  }

  const { videoUrl, videoMimeType } = await generateVideoSceneFromText(
    worldDescription.trim()
  );

  return { description: worldDescription.trim(), theme: randomTheme, videoUrl, videoMimeType };
};

export const continueStoryInWorld = async (
  worldTheme: string,
  initialWorldDescription: string,
  storyHistory: string[],
  userAction: string
): Promise<{
  nextSceneTextDescription: string;
  nextSceneVideoUrl: string;
  nextSceneVideoMimeType: string;
}> => {
  const client = getAiClient();

  const fullStorySoFar = storyHistory.join("\n\n---\n\n");

  const promptContentForText = `
  The world is themed around: "${worldTheme}"
  The initial detailed description of this world was: "${initialWorldDescription}"

  So far, the story has unfolded like this:
  ---
  ${fullStorySoFar}
  ---

  Now, the character/user wants to: "${userAction}"

  Describe what happens next in 1 engaging paragraph. This description will be used to generate a video scene. Focus on visually rich details.
  `;

  const textResponse: GenerateContentResponse =
    await client.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: promptContentForText,
      config: {
        systemInstruction: STORY_CONTINUATION_SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

  const nextSceneTextDescription = textResponse.text;
  if (!nextSceneTextDescription || nextSceneTextDescription.trim() === "") {
    console.warn(
      "Gemini API returned an empty continuation for action:",
      userAction
    );
    throw new Error("Gemini API returned an empty continuation.");
  }

  const { videoUrl, videoMimeType } = await generateVideoSceneFromText(
    nextSceneTextDescription.trim()
  );

  return {
    nextSceneTextDescription: nextSceneTextDescription.trim(),
    nextSceneVideoUrl: videoUrl,
    nextSceneVideoMimeType: videoMimeType
  };
};