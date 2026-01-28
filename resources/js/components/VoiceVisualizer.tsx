import { cn } from "@/lib/utils"
import type { SpeakingState } from "@/types"

interface VoiceVisualizerProps {
  speakingState: SpeakingState
  type?: 'default' | 'hero'
}

export function VoiceVisualizer({ speakingState, type = 'default' }: VoiceVisualizerProps) {
  const isHero = type === 'hero'
  const isActive = speakingState !== 'idle'
  const isSpeaking = speakingState === 'agent_speaking'
  const isListening = speakingState === 'listening' || speakingState === 'user_speaking'

  return (
    <div className="relative h-48 w-48 mx-auto flex items-center justify-center">
      {/* Outer ring - pulses when active */}
      <div
        className={cn(
          "absolute w-40 h-40 rounded-full transition-all duration-500",
          isHero
            ? "bg-white/10"
            : "bg-primary/10",
          isActive && "animate-ping-slow"
        )}
      />

      {/* Middle ring - breathing effect when listening */}
      <div
        className={cn(
          "absolute w-36 h-36 rounded-full transition-all duration-300",
          isHero
            ? "bg-white/20"
            : "bg-primary/20",
          isListening && "animate-breathe"
        )}
      />

      {/* Main circle */}
      <div
        className={cn(
          "relative w-32 h-32 rounded-full transition-all duration-300",
          isHero
            ? "bg-gradient-to-br from-white to-white/80 shadow-[0_0_60px_rgba(255,255,255,0.5)]"
            : "bg-gradient-to-br from-primary to-primary/70 shadow-[0_0_40px_hsl(var(--primary)/0.5)]",
          isSpeaking && "scale-105 shadow-[0_0_60px_hsl(var(--primary)/0.7)]",
          isListening && "animate-pulse-gentle"
        )}
      />

      {/* Microphone Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "absolute w-12 h-12 transition-transform duration-300",
          isHero ? "text-primary" : "text-white/90",
          isSpeaking && "scale-90"
        )}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>

      <style>{`
        @keyframes pulse-gentle {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.03);
            opacity: 0.95;
          }
        }

        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.4;
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          75%, 100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        .animate-pulse-gentle {
          animation: pulse-gentle 2s ease-in-out infinite;
        }

        .animate-breathe {
          animation: breathe 1.5s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  )
}
