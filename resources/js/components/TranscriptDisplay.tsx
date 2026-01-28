import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { TranscriptMessage } from '@/types'

interface TranscriptDisplayProps {
    transcript: TranscriptMessage[]
    className?: string
}

export function TranscriptDisplay({ transcript, className }: TranscriptDisplayProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
    }, [transcript])

    if (transcript.length === 0) {
        return null
    }

    const getSpeakerLabel = (role: string) => {
        switch (role) {
            case 'user': return 'Candidate'
            case 'agent': return 'Gennie'
            case 'system': return 'System'
            default: return role
        }
    }

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Transcript
            </h3>
            <div
                ref={containerRef}
                className={cn(
                    "text-left text-sm h-48 overflow-y-auto space-y-6 pr-2",
                    className
                )}
            >
                {transcript.map((msg, index) => {
                    const isUser = msg.role === 'user'
                    const isSystem = msg.role === 'system'

                    if (isSystem) {
                        return (
                            <div key={index} className="flex justify-center">
                                <span className="bg-muted/50 italic text-muted-foreground text-center px-3 py-1 rounded-full text-xs">
                                    {msg.content}
                                </span>
                            </div>
                        )
                    }

                    return (
                        <div
                            key={index}
                            className={cn(
                                "flex gap-4 group",
                                isUser ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            {/* Avatar */}
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                                isUser
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted border text-muted-foreground"
                            )}>
                                {isUser ? 'C' : 'G'}
                            </div>

                            {/* Message bubble */}
                            <div className={cn(
                                "flex flex-col max-w-[80%]",
                                isUser ? "items-end" : "items-start"
                            )}>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-xs font-semibold text-foreground">
                                        {getSpeakerLabel(msg.role)}
                                    </span>
                                </div>
                                <div className={cn(
                                    "rounded-lg p-3 text-sm leading-relaxed shadow-sm",
                                    isUser
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-card border rounded-tl-none"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
