"use client"

import { useState, useEffect, useRef } from "react"
import { Volume2, VolumeX, Music } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BackgroundMusic() {
  const [musicUrl, setMusicUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.3) // Default volume 30%
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Fetch music URL and enabled status from database
  useEffect(() => {
    Promise.all([
      fetch("/api/content?key=background.music").then((res) => res.json()),
      fetch("/api/content?key=background.music.enabled").then((res) => res.json()),
    ])
      .then(([musicData, enabledData]) => {
        // Check if music is enabled
        const isEnabled = enabledData && enabledData.value === "true"
        
        if (isEnabled && musicData && musicData.value && musicData.value.trim() !== "") {
          setMusicUrl(musicData.value)
        }
      })
      .catch((err) => console.error("Error fetching background music:", err))
  }, [])

  // Initialize audio when URL is available
  useEffect(() => {
    if (musicUrl && !audioRef.current) {
      const audio = new Audio(musicUrl)
      audio.loop = true
      audio.volume = volume
      audioRef.current = audio

      // Try to play automatically (may fail due to browser autoplay policy)
      audio
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch((err) => {
          console.log("Autoplay prevented:", err)
          // User interaction required - will play on first click
        })
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [musicUrl, volume])

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch((err) => {
        console.error("Error playing audio:", err)
      })
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    setIsMuted(!isMuted)
    audioRef.current.volume = !isMuted ? 0 : volume
  }

  // Don't render if no music URL
  if (!musicUrl) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg p-2 flex items-center gap-2 border border-gray-200">
        {/* Play/Pause Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          className="rounded-full h-10 w-10"
          aria-label={isPlaying ? "Pause music" : "Play music"}
        >
          {isPlaying ? (
            <Music className="h-5 w-5 text-orange-500" />
          ) : (
            <Music className="h-5 w-5 text-gray-400" />
          )}
        </Button>

        {/* Volume Control */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="rounded-full h-8 w-8"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-gray-500" />
            ) : (
              <Volume2 className="h-4 w-4 text-orange-500" />
            )}
          </Button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value)
              setVolume(newVolume)
              setIsMuted(false)
            }}
            className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  )
}

