import React from "react";

interface StoryDisplayProps {
    story: string | null; // Can be a single block of text with newlines, or pre-joined story parts
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ story }) => {
    if (!story) {
        return null;
    }

    // Ensure story is a string, then split into paragraphs
    const paragraphs = String(story)
        .split(/\n\s*\n+/) // Split by one or more newlines, including those with spaces in between
        .map((p) => p.trim()) // Trim each paragraph
        .filter((paragraph) => paragraph !== ""); // Remove empty paragraphs

    return (
        <div
            className="prose prose-lg max-w-none prose-p:text-brand-text prose-headings:text-brand-secondary prose-strong:text-brand-text leading-relaxed bg-amber-50/50 p-4 sm:p-6 rounded-lg shadow-inner ring-1 ring-amber-200/50 max-h-[60vh] overflow-y-auto"
            aria-live="polite" // Announce changes to screen readers
        >
            {paragraphs.map((paragraph, index) => (
                <p
                    key={index}
                    className="mb-4 text-justify last:mb-0 animate-fadeIn"
                    style={{ animationDelay: `${Math.min(index * 0.1, 1)}s` }} // Cap animation delay
                >
                    {paragraph}
                </p>
            ))}
            {paragraphs.length === 0 && <p className="text-brand-soft-text">The story is waiting to be written...</p>}
        </div>
    );
};
