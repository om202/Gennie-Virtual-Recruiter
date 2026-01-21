import { cn } from "@/lib/utils"
import type { SpeakingState } from "@/types"

interface VoiceVisualizerProps {
    speakingState: SpeakingState
}

export function VoiceVisualizer({ speakingState }: VoiceVisualizerProps) {
    return (
        <div className="relative h-48 w-48 mx-auto flex items-center justify-center">
            <div
                className={cn(
                    "w-32 h-32 bg-gradient-to-br from-primary to-primary/70 rounded-full shadow-[0_0_40px_hsl(var(--primary)/0.5)]",
                    speakingState !== 'idle' && 'animate-pulse-gentle'
                )}
            />

            {/* Microphone Icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute w-12 h-12 text-white/90"
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
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        .animate-pulse-gentle {
          animation: pulse-gentle 2s ease-in-out infinite;
        }
      `}</style>
        </div>
    )
}
