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
                    className="rounded-md border bg-muted/30 px-4 py-3 prose prose-sm dark:prose-invert max-w-none"
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
                    className="font-mono text-sm"
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
        <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    )
}

// Default candidate instructions template
export const DEFAULT_CANDIDATE_INSTRUCTIONS = `## Welcome to Your Interview

Thank you for taking the time to complete this interview. Here's what to expect:

### What You'll Need
- A quiet environment with minimal background noise
- Stable internet connection
- A working microphone

### Tips for Success
- **Speak naturally** - Take your time and answer thoughtfully
- **Be specific** - Use concrete examples from your experience
- **Ask for clarification** - It's okay to ask if you need a question repeated

### Technical Notes
- The interview will automatically end after the allotted time
- If you experience technical issues, try refreshing the page

Good luck! We look forward to learning more about you.`
