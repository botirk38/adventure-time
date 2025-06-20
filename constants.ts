// AI Model Configuration
export const AI_MODELS = {
    GEMINI: "gemini-2.5-flash-preview-04-17",
    IMAGEN: "imagen-3.0-generate-002",
    VEO: "veo-2.0-generate-001",
    TTS: "gemini-2.5-flash-preview-tts",
} as const;

// AI System Instructions
export const SYSTEM_INSTRUCTIONS = {
    WORLD_GENERATION: `You are an imaginative world builder for children aged 5-10.
Describe a vibrant, positive, kid-friendly world in 1-2 concise paragraphs.
Focus on visual details, sounds, and a sense of wonder for a video scene.
Avoid anything scary or complex. Keep it concrete and magical. This description will be used as a prompt for video generation.`,

    STORY_CONTINUATION: `You are a friendly storyteller for children aged 10-14, continuing a story.
The user provides context (world, story so far) and their action.
Describe what happens next in 1 concise paragraph, focusing on visually rich details suitable for a child's story. This description will be used to generate a video scene.
Maintain a positive, whimsical, and adventurous tone. Use simple language.`,
} as const;

// Video Generation Configuration
export const VIDEO_CONFIG = {
    PROMPT_ENHANCER:
        "A whimsical and magical animated scene for a children's story. Vibrant colors, storybook illustration style, highly detailed, like a frame from a high-quality animated short film. Depict the following: ",
    ASPECT_RATIO: "16:9" as const,
    DURATION_SECONDS: 5,
    NUMBER_OF_VIDEOS: 1,
} as const;

export const RANDOM_WORLD_THEMES = [
    "a secret garden hidden behind a sparkling waterfall where flowers sing",
    "a bustling treetop city where friendly animals wear tiny hats and run shops",
    "a magical kingdom made entirely of colorful candy, cookies, and ice cream",
    "a cozy spaceship exploring a galaxy filled with planets made of fluff and stars that giggle",
    "an ancient, dusty library where books whisper secrets and maps show paths to treasure",
    "a tiny, cheerful village built on the back of a giant, gentle, moss-covered turtle",
    "an enchanted forest where trees have kind faces, tell silly jokes, and leaves shimmer in rainbow colors",
    "a floating island marketplace with flying carpets, talking parrots, and stalls selling bottled starlight",
    "an underwater city of playful merfolk, with castles made of glowing coral and paths of pearls",
    "a snowy mountain peak where friendly Yetis have fluffy blue fur and host joyful snowball festivals",
    "a desert oasis where the sand dunes are made of cinnamon and the water tastes like fruit punch",
    "a school for young wizards and witches located in a floating cloud castle",
    "a land where all the toys come to life at night and have their own secret adventures",
    "a prehistoric valley where baby dinosaurs wear flower crowns and play hide-and-seek",
    "a pirate ship crewed by friendly otters searching for the legendary lost island of giant bubbles",
];
