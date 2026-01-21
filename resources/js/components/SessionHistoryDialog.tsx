import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, ChevronDown, Clock, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Session {
    id: string
    status: string
    created_at: string
    metadata: any
    progress_state: any
}

interface Log {
    id: number
    speaker: string
    message: string
    created_at: string
}

interface SessionHistoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    interview: { id: string, job_title: string } | null
}

export function SessionHistoryDialog({ open, onOpenChange, interview }: SessionHistoryDialogProps) {
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(false)
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)
    const [logs, setLogs] = useState<Record<string, Log[]>>({})
    const [loadingLogs, setLoadingLogs] = useState<string | null>(null)

    useEffect(() => {
        if (open && interview) {
            setLoading(true)
            fetch(`/interviews/${interview.id}/sessions`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setSessions(data.sessions)
                    }
                })
                .catch(err => console.error("Failed to load sessions", err))
                .finally(() => setLoading(false))
        } else {
            setSessions([])
            setExpandedSessionId(null)
        }
    }, [open, interview])

    const toggleSession = async (sessionId: string) => {
        if (expandedSessionId === sessionId) {
            setExpandedSessionId(null)
            return
        }

        setExpandedSessionId(sessionId)

        // Fetch logs if not already cached
        if (!logs[sessionId]) {
            setLoadingLogs(sessionId)
            try {
                const res = await fetch(`/api/sessions/${sessionId}/logs`)
                const data = await res.json()
                if (data.success) {
                    setLogs(prev => ({ ...prev, [sessionId]: data.logs }))
                }
            } catch (err) {
                console.error("Failed to load logs", err)
            } finally {
                setLoadingLogs(null)
            }
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Interview History</DialogTitle>
                    <DialogDescription>
                        Past sessions for {interview?.job_title}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden mt-4">
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading sessions...</div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No sessions found.</div>
                    ) : (
                        <div className="h-[60vh] overflow-y-auto pr-4">
                            <div className="space-y-4">
                                {sessions.map((session) => (
                                    <div key={session.id} className="border rounded-lg bg-card">
                                        <div
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => toggleSession(session.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                {expandedSessionId === session.id ? (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <div>
                                                    <div className="font-medium flex items-center gap-2">
                                                        Session {formatDate(session.created_at)}
                                                        <Badge variant={session.status === 'completed' ? 'default' : 'outline'}>
                                                            {session.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(session.created_at).toLocaleTimeString()}
                                                        </span>
                                                        {session.progress_state?.completed_questions && (
                                                            <span className="flex items-center gap-1 text-green-600">
                                                                <CheckCircle className="h-3 w-3" />
                                                                {session.progress_state.completed_questions.length} questions answered
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {expandedSessionId === session.id && (
                                            <div className="border-t bg-muted/20 p-4">
                                                {loadingLogs === session.id ? (
                                                    <div className="text-sm text-muted-foreground text-center">Loading logs...</div>
                                                ) : logs[session.id] && logs[session.id].length > 0 ? (
                                                    <div className="space-y-3 font-mono text-sm">
                                                        {logs[session.id].map((log) => (
                                                            <div key={log.id} className={cn(
                                                                "flex gap-3",
                                                                log.speaker === 'candidate' ? "justify-end" : "justify-start"
                                                            )}>
                                                                <div className={cn(
                                                                    "max-w-[85%] rounded-lg p-3",
                                                                    log.speaker === 'candidate'
                                                                        ? "bg-primary text-primary-foreground"
                                                                        : log.speaker === 'system'
                                                                            ? "text-muted-foreground italic text-xs w-full text-center p-1"
                                                                            : "bg-background border shadow-sm"
                                                                )}>
                                                                    {log.speaker !== 'system' && (
                                                                        <div className="text-[10px] opacity-70 mb-1 uppercase tracking-wider font-semibold">
                                                                            {log.speaker === 'agent' ? 'Gennie' : 'Candidate'}
                                                                        </div>
                                                                    )}
                                                                    <div className="whitespace-pre-wrap">{log.message}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-muted-foreground text-center">No logs available for this session.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
