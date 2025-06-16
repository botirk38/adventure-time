import React from 'react';

interface VideoBackgroundDisplayProps {
  videoSrc: string | null;
  type?: string; // e.g., 'video/mp4'
}

export const VideoBackgroundDisplay: React.FC<VideoBackgroundDisplayProps> = ({ videoSrc, type = 'video/mp4' }) => {
  if (!videoSrc) {
    return (
      <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden bg-brand-soft-text flex items-center justify-center">
        <p className="text-white/50 text-lg">No video scene available.</p>
      </div>
    );
  }

  const isVideo = type.startsWith('video/');

  return (
    <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden bg-black">
      {isVideo ? (
        <video
          key={videoSrc} // Ensures re-render and re-load on src change
          className="w-full h-full object-cover"
          // src={videoSrc} // src is now on the source element
          autoPlay
          loop
          muted
          playsInline // Important for iOS and autoPlay
          onError={(e) => {
            console.error("Video playback error:", e);
          }}
        >
          <source src={videoSrc} type={type} /> 
          Your browser does not support the video tag. An enchanting scene was imagined here!
        </video>
      ) : (
        // Fallback for non-video types, though with Veo this path should be rare.
        // Now, this path might be used if a static image URL is passed.
        <img
          key={videoSrc}
          src={videoSrc}
          alt="Generated scene background"
          className="w-full h-full object-cover"
          onError={(e) => console.error("Image loading error:", e)}
        />
      )}
    </div>
  );
};