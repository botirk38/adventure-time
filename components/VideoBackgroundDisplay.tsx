import React from "react";
import { cn } from "@/lib/utils";

interface VideoBackgroundDisplayProps {
    videoSrc: string | null;
    type?: string; // e.g., 'video/mp4'
    className?: string;
}

export const VideoBackgroundDisplay: React.FC<VideoBackgroundDisplayProps> = ({
    videoSrc,
    type = "video/mp4",
    className,
}) => {
    if (!videoSrc) {
        return (
            <div
                className={cn(
                    "absolute inset-0 w-full h-full z-0 overflow-hidden",
                    "bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900",
                    "flex items-center justify-center",
                    className,
                )}
            >
                <p className="text-white/50 text-lg text-shadow">No video scene available.</p>
            </div>
        );
    }

    const isVideo = type.startsWith("video/");

    return (
        <div
            className={cn(
                "absolute inset-0 w-full h-full z-0 overflow-hidden bg-black",
                "pointer-events-none", // Prevent video from interfering with UI
                className,
            )}
        >
            {isVideo ? (
                <video
                    key={videoSrc} // Ensures re-render and re-load on src change
                    className="w-full h-full object-cover transition-opacity duration-500"
                    autoPlay
                    loop
                    muted
                    playsInline // Important for iOS and autoPlay
                    onError={(e) => {
                        console.error("Video playback error:", e);
                    }}
                    onLoadStart={() => console.log("Video loading started")}
                    onCanPlay={() => console.log("Video can play")}
                >
                    <source src={videoSrc} type={type} />
                    Your browser does not support the video tag. An enchanting scene was imagined here!
                </video>
            ) : (
                // Fallback for non-video types
                <img
                    key={videoSrc}
                    src={videoSrc}
                    alt="Generated scene background"
                    className="w-full h-full object-cover transition-opacity duration-500"
                    onError={(e) => console.error("Image loading error:", e)}
                />
            )}
        </div>
    );
};
