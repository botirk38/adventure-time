export const GEMINI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';
export const IMAGEN_MODEL_NAME = 'imagen-3.0-generate-002';
export const VEO_MODEL_NAME = 'veo-2.0-generate-001';

export const STORY_SYSTEM_INSTRUCTION = `You are a friendly, imaginative storyteller for children aged 5-10.
Create positive, engaging, age-appropriate stories.
Stories should be fun, inspire creativity, and have a kind or adventurous spirit.
Avoid scary, violent, or complex themes. Keep the tone lighthearted and magical.
Use simple language. Format into a few short paragraphs.`;

export const WORLD_GENERATION_SYSTEM_INSTRUCTION = `You are an imaginative world builder for children aged 5-10.
Describe a vibrant, positive, kid-friendly world in 1-2 concise paragraphs.
Focus on visual details, sounds, and a sense of wonder for a video scene.
Avoid anything scary or complex. Keep it concrete and magical. This description will be used as a prompt for video generation.`;

export const STORY_CONTINUATION_SYSTEM_INSTRUCTION = `You are a friendly storyteller for children aged 5-10, continuing a story.
The user provides context (world, story so far) and their action.
Describe what happens next in 1 concise paragraph, focusing on visually rich details suitable for a child's story. This description will be used to generate a video scene.
Maintain a positive, whimsical, and adventurous tone. Use simple language.`;

export const VIDEO_SCENE_PROMPT_ENHANCER = "A whimsical and magical animated scene for a children's story. Vibrant colors, storybook illustration style, highly detailed, like a frame from a high-quality animated short film. Depict the following: ";

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
  "a pirate ship crewed by friendly otters searching for the legendary lost island of giant bubbles"
];