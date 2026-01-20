import { cn } from "@/lib/utils"
import type { SpeakingState } from "@/types"

interface VoiceVisualizerProps {
    speakingState: SpeakingState
}

export function VoiceVisualizer({ speakingState }: VoiceVisualizerProps) {
    const getRingColor = () => {
        switch (speakingState) {
            case 'user_speaking':
                return 'border-blue-500/80'
            case 'agent_speaking':
                return 'border-emerald-500/80'
            case 'listening':
                return 'border-blue-500/20'
            default:
                return 'border-blue-500/20'
        }
    }

    const getOrbAnimation = () => {
        if (speakingState === 'agent_speaking') {
            return 'speaking'
        }
        return ''
    }

    return (
        <div className="relative h-48 w-48 mx-auto flex items-center justify-center">
            <div
                className={cn(
                    "absolute inset-0 rounded-full border-4 transition-colors duration-300",
                    getRingColor(),
                    speakingState === 'listening' && 'animate-pulse'
                )}
            />
            <div
                className={cn(
                    "w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all duration-300",
                    getOrbAnimation()
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
        .speaking {
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            transform: scale(1.1);
            box-shadow: 0 0 0 20px rgba(59, 130, 246, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
      `}</style>
        </div>
    )
}
