import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { PlayIcon, PauseIcon, RefreshIcon } from "./icons";

interface AudioPlayerProps {
    audioUrl: string | null;
    onPlay?: () => void;
    onPause?: () => void;
    onEnded?: () => void;
    className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
    audioUrl,
    onPlay,
    onPause,
    onEnded,
    className = "",
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleDurationChange = () => setDuration(audio.duration);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            onEnded?.();
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("durationchange", handleDurationChange);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("durationchange", handleDurationChange);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [onEnded]);

    useEffect(() => {
        // Reset player when audio URL changes
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
            setIsPlaying(false);
        }
    }, [audioUrl]);

    const handlePlayPause = () => {
        const audio = audioRef.current;
        if (!audio || !audioUrl) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
            onPause?.();
        } else {
            audio.play();
            setIsPlaying(true);
            onPlay?.();
        }
    };

    const handleRestart = () => {
        const audio = audioRef.current;
        if (!audio || !audioUrl) return;

        audio.currentTime = 0;
        setCurrentTime(0);
        if (isPlaying) {
            audio.play();
        }
    };

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (!audioUrl) return null;

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

            <Button
                onClick={handlePlayPause}
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-full bg-amber-400/20 border border-amber-400/40 text-white hover:text-amber-300 hover:bg-amber-400/30"
            >
                {isPlaying ? (
                    <PauseIcon className="h-3 w-3" />
                ) : (
                    <PlayIcon className="h-3 w-3" />
                )}
            </Button>

            <Button
                onClick={handleRestart}
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-full bg-amber-400/20 border border-amber-400/40 text-white hover:text-amber-300 hover:bg-amber-400/30"
            >
                <RefreshIcon className="h-3 w-3" />
            </Button>

            <div className="flex-1 min-w-0">
                <div className="relative h-2 bg-black/40 rounded-full overflow-hidden">
                    <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-100"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-white/70 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
};
