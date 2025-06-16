import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface VideoBackgroundDisplayProps {
    videoSrc: string | null;
    type?: string;
    className?: string;
    onVideoError?: (error: Error) => void;
    onVideoLoad?: () => void;
}

const FALLBACK_GRADIENT = "bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900";

export const VideoBackgroundDisplay: React.FC<VideoBackgroundDisplayProps> = ({
    videoSrc,
    type = "video/mp4",
    className,
    onVideoError,
    onVideoLoad,
}) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleVideoError = useCallback(
        (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
            console.error("Video playback error:", event);
            setHasError(true);
            setIsLoading(false);
            onVideoError?.(new Error("Video playback failed"));
        },
        [onVideoError],
    );

    const handleVideoLoad = useCallback(() => {
        console.log("Video loaded successfully");
        setIsLoading(false);
        setHasError(false);
        onVideoLoad?.();
    }, [onVideoLoad]);

    const handleImageError = useCallback(
        (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
            console.error("Image loading error:", event);
            setHasError(true);
            setIsLoading(false);
            onVideoError?.(new Error("Image loading failed"));
        },
        [onVideoError],
    );

    const handleImageLoad = useCallback(() => {
        setIsLoading(false);
        setHasError(false);
        onVideoLoad?.();
    }, [onVideoLoad]);

    // No video source provided
    if (!videoSrc) {
        return (
            <div
                className={cn(
                    "absolute inset-0 w-full h-full z-0 overflow-hidden",
                    FALLBACK_GRADIENT,
                    "flex items-center justify-center",
                    className,
                )}
            >
                <p className="text-white/50 text-lg text-shadow">No video scene available.</p>
            </div>
        );
    }

    // Error state - show fallback gradient
    if (hasError) {
        return (
            <div
                className={cn(
                    "absolute inset-0 w-full h-full z-0 overflow-hidden",
                    FALLBACK_GRADIENT,
                    "flex items-center justify-center",
                    className,
                )}
            >
                <p className="text-white/50 text-lg text-shadow">
                    Scene temporarily unavailable. The adventure continues...
                </p>
            </div>
        );
    }

    const isVideo = type.startsWith("video/");

    return (
        <div
            className={cn(
                "absolute inset-0 w-full h-full z-0 overflow-hidden bg-black",
                "pointer-events-none",
                className,
            )}
        >
            {/* Loading backdrop */}
            {isLoading && (
                <div className={cn("absolute inset-0", FALLBACK_GRADIENT, "flex items-center justify-center")}>
                    <div className="animate-pulse text-white/70 text-lg text-shadow">Loading magical scene...</div>
                </div>
            )}

            {isVideo ? (
                <video
                    key={videoSrc}
                    className={cn(
                        "w-full h-full object-cover transition-opacity duration-700",
                        isLoading && "opacity-0",
                    )}
                    autoPlay
                    loop
                    muted
                    playsInline
                    onError={handleVideoError}
                    onLoadStart={() => setIsLoading(true)}
                    onCanPlayThrough={handleVideoLoad}
                    onLoadedData={handleVideoLoad}
                >
                    <source src={videoSrc} type={type} />
                    Your browser does not support the video tag. An enchanting scene was imagined here!
                </video>
            ) : (
                <img
                    key={videoSrc}
                    src={videoSrc}
                    alt="Generated scene background"
                    className={cn(
                        "w-full h-full object-cover transition-opacity duration-700",
                        isLoading && "opacity-0",
                    )}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                />
            )}
        </div>
    );
};
