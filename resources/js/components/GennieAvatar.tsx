
import { cn } from '@/lib/utils';

interface GennieAvatarProps {
    className?: string;
}

export function GennieAvatar({ className }: GennieAvatarProps) {
    return (
        <div className={cn("relative flex items-center justify-center w-40 h-40 mx-auto mb-10 group", className)}>

            {/* Ambient Outer Glow */}
            <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full transform group-hover:bg-indigo-500/30 transition-all duration-1000" />

            {/* Rotating Subtle Gradient Border */}
            <div className="absolute inset-0 rounded-full p-[1px] bg-gradient-to-tr from-white/20 via-transparent to-white/20" />

            {/* Main Glass Sphere */}
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-700 ease-out">

                {/* Inner Highlight */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50" />

                {/* The CSS Audio Wave (Single Element) */}
                <div className="voice-loader" />
            </div>

            <style>{`
                .voice-loader {
                    width: 60px; /* Increased width for 5 bars */
                    aspect-ratio: 1;
                    --c: linear-gradient(to bottom, #818cf8, #c084fc); 
                    background: 
                        var(--c) 0%   50%,
                        var(--c) 25%  50%,
                        var(--c) 50%  50%,
                        var(--c) 75%  50%,
                        var(--c) 100% 50%;
                    background-repeat: no-repeat;
                    animation: l1 3s infinite ease-in-out; /* Slower & smoother */
                }
                @keyframes l1 {
                    0%, 100% { 
                        background-size: 15% 15%, 15% 95%, 15% 15%, 15% 70%, 15% 30% 
                    }
                    25% { 
                        background-size: 15% 80%, 15% 20%, 15% 90%, 15% 20%, 15% 80% 
                    }
                    50% { 
                        background-size: 15% 20%, 15% 95%, 15% 30%, 15% 95%, 15% 20% 
                    }
                    75% { 
                        background-size: 15% 90%, 15% 30%, 15% 20%, 15% 30%, 15% 90% 
                    }
                }
            `}</style>
        </div>
    );
}
