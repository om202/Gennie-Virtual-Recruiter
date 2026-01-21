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

    return (
        <div className="lg:border-l lg:border-primary/20 lg:pl-4 space-y-2">
            <h3 className="text-lg font-semibold text-primary">Transcript</h3>
            <div
                ref={containerRef}
                className={cn(
                    "text-left text-sm h-32 overflow-y-auto font-mono text-muted-foreground",
                    className
                )}
            >
                {transcript.map((msg, index) => (
                    <p key={index} className="mb-1">
                        <span className={cn(
                            "font-semibold",
                            msg.role === 'user' && "text-primary",
                            msg.role === 'agent' && "text-muted-foreground",
                            msg.role === 'system' && "text-muted-foreground/70"
                        )}>
                            {msg.role}:
                        </span>{' '}
                        {msg.content}
                    </p>
                ))}
            </div>
        </div>
    )
}
