// Application State Types
export type AppMode = "initial" | "world_exploration";

export interface AppState {
    appMode: AppMode;
    worldTheme: string | null;
    initialWorldDescription: string | null;
    currentSceneVideoUrl: string | null;
    currentSceneVideoMimeType: string | undefined;
    storyParts: string[];
    currentUserAction: string;
    isLoading: boolean;
    loadingMessage: string;
    error: string | null;
}

// API Response Types
export interface WorldSetting {
    description: string;
    theme: string;
    videoUrl: string;
    videoMimeType: string;
}

export interface StoryScene {
    nextSceneTextDescription: string;
    nextSceneVideoUrl: string;
    nextSceneVideoMimeType: string;
}

export interface VideoResult {
    videoUrl: string;
    videoMimeType: string;
}

// Component Props Types
export interface StoryInputProps {
    onSubmit: (prompt: string) => void;
    isLoading: boolean;
}

export interface VideoBackgroundDisplayProps {
    videoSrc: string | null;
    type?: string;
    className?: string;
    onVideoError?: (error: Error) => void;
    onVideoLoad?: () => void;
}

// AI Configuration Types
export interface AIModelConfig {
    readonly GEMINI: string;
    readonly IMAGEN: string;
    readonly VEO: string;
}

export interface SystemInstructions {
    readonly WORLD_GENERATION: string;
    readonly STORY_CONTINUATION: string;
}

export interface VideoConfig {
    readonly PROMPT_ENHANCER: string;
    readonly ASPECT_RATIO: "16:9";
    readonly DURATION_SECONDS: number;
    readonly NUMBER_OF_VIDEOS: number;
}

// Error Types
export class AIServiceError extends Error {
    constructor(message: string, public readonly service: string) {
        super(message);
        this.name = "AIServiceError";
    }
}

export class VideoGenerationError extends AIServiceError {
    constructor(message: string) {
        super(message, "video");
        this.name = "VideoGenerationError";
    }
}

export class WorldGenerationError extends AIServiceError {
    constructor(message: string) {
        super(message, "world");
        this.name = "WorldGenerationError";
    }
}

export class StoryContinuationError extends AIServiceError {
    constructor(message: string) {
        super(message, "story");
        this.name = "StoryContinuationError";
    }
}

// Utility Types
export type LoadingMessage =
    | "Conjuring your story world and its sights (this may take a few minutes)..."
    | "Conjuring a random world and its sights (this may take a few minutes)..."
    | "Weaving the next part of your adventure and its video (this may take a few minutes)...";

export type ErrorMessage =
    | "An unexpected error occurred while creating your story world."
    | "An unexpected error occurred while creating a new world."
    | "An unexpected error occurred while continuing the adventure."
    | "Cannot continue: missing world details or your action.";

// Form Validation Types
export interface ValidationResult {
    isValid: boolean;
    message?: string;
}

export interface PromptValidation {
    minLength: number;
    maxLength: number;
    validate: (text: string) => ValidationResult;
}
