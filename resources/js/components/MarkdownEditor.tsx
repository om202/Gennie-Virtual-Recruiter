import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Eye, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarkdownEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    minHeight?: string
}

export function MarkdownEditor({
    value,
    onChange,
    placeholder,
    className,
    minHeight = '250px',
}: MarkdownEditorProps) {
    const [isPreview, setIsPreview] = useState(false)

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex justify-end gap-1">
                <Button
                    type="button"
                    variant={isPreview ? 'ghost' : 'secondary'}
                    size="sm"
                    onClick={() => setIsPreview(false)}
                    className="h-7 px-2 text-xs"
                >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                </Button>
                <Button
                    type="button"
                    variant={isPreview ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setIsPreview(true)}
                    className="h-7 px-2 text-xs"
                >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                </Button>
            </div>

            {isPreview ? (
                <div
                    className="rounded-md border bg-muted/30 px-4 py-3 prose dark:prose-invert max-w-none"
                    style={{ minHeight }}
                >
                    {value ? (
                        <ReactMarkdown>{value}</ReactMarkdown>
                    ) : (
                        <p className="text-muted-foreground italic">No content to preview</p>
                    )}
                </div>
            ) : (
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{ minHeight }}
                    className="font-mono"
                />
            )}
        </div>
    )
}

interface MarkdownViewerProps {
    content: string
    className?: string
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
    if (!content) return null

    return (
        <div className={cn('prose dark:prose-invert max-w-none', className)}>
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    )
}

// Default candidate instructions template
export const DEFAULT_CANDIDATE_INSTRUCTIONS = `## Welcome to Your AI Interview

You are about to have a conversation with an AI Recruiter. This is a real-time voice interview designed to understand your experience and qualifications just like a human recruiter would.

### Tips for a Smooth Conversation
- **Wait for the turn**: The AI may have a brief pause before responding. Please wait until it has completely finished speaking before you start your answer.
- **Speak Clearly**: Ensure you speak at a moderate pace and clarity. This helps the AI transcribe and understand your answers accurately.
- **No need to rush**: It is perfectly okay to take a few seconds to gather your thoughts before answering.
- **Interruption Handling**: If the AI interrupts you by mistake, simply continue your thought or say "Let me finish..." and proceed.

### How to Stand Out
- **Be Specific**: Use the **STAR Method** (Situation, Task, Action, Result) to structure your behavioral answers.
- **Focus on 'I'**: When describing team projects, clearly articulate **your** specific role and contributions.
- **Context Matters**: Provide brief context for technical terms or acronyms specific to your past organizations.
- **Ask Questions**: You can ask the AI clarifying questions if a prompt is ambiguous.

### Technical Setup
- **Quiet Environment**: Background noise can confuse the AI. Please find a quiet room.
- **Stable Internet**: A strong connection ensures the conversation flows naturally without lag.
- **Microphone Check**: Ensure your microphone is not muted and is picking up your voice clearly.

The interview will conclude automatically when the time is up. Relax, be yourself, and good luck!`
