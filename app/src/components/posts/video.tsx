"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Slider } from "../ui/slider";
import { formatTime } from "@/utils/time/helpers";

interface Props {
  url: string;
  className?: string;
}
export default function Video({ url, className }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // video controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayPause, setShowPlayPause] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);

      setShowPlayPause(true);
      // after one second, hide play/pause icon
      setTimeout(() => setShowPlayPause(false), 1000);
    }
  };

  // restart the video when it ends + if still playing
  const handleEnded = () => {
    if (isPlaying && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleTimeUpdateOnSlider = (value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  // pause video when the entire video is not visible anymore
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && !video.paused) {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [videoRef]);

  // set duration at the start
  useEffect(() => {
    const video = videoRef.current;
    if (video && video.duration) {
      setDuration(video.duration);
    }
  }, []);

  // update the time frequently
  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;

      if (video && !video.paused) {
        setCurrentTime(video.currentTime);
      }
    }, 100); // every 0.01 seconds

    return () => clearInterval(interval);
  }, []);

  // sizing is external
  return (
    <div
      className={clsx(
        "relative overflow-hidden bg-black rounded-md object-cover",
        className
      )}
    >
      <div
        className="absolute inset-0 flex justify-center items-center cursor-pointer"
        onClick={togglePlay}
      >
        <AnimatePresence>
          {showPlayPause && !isPlaying && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "20%" }}
              exit={{ opacity: 0 }}
            >
              <Play
                size={100}
                className="h-full"
                fill="#fff"
                color="transparent"
              />
            </motion.div>
          )}
          {showPlayPause && isPlaying && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "20%" }}
              exit={{ opacity: 0 }}
            >
              <Pause
                size={100}
                className="h-full"
                fill="#fff"
                color="transparent"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar and duration*/}
      <div className="absolute bottom-0 w-full p-4 flex gap-4">
        {duration !== 0 && (
          <Slider
            className="w-full"
            max={duration}
            value={[currentTime]}
            onValueChange={([val]) => {
              handleTimeUpdateOnSlider(val);
            }}
            step={0.01}
          />
        )}
        <div className="flex flex-col text-white text-sm">
          <span>{formatTime(currentTime)}</span>
          <hr />
          <span>{formatTime(duration)}</span>
        </div>
        {/* <div className="flex flex-col text-white text-sm">
          <span>{currentTime}</span>
          <hr />
          <span>{duration}</span>
        </div> */}
      </div>

      <video
        key={url}
        src={url}
        ref={videoRef}
        onEnded={handleEnded}
        preload="metadata"
      />
    </div>
  );
}
