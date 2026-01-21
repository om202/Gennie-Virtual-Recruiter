import { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Clock, CheckCircle, ArrowLeft, MessageSquare, AlertCircle, Loader2, ChevronDown, ChevronRight } from 'lucide-react'
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

interface Interview {
    id: string
    job_title: string
    company_name: string
    sessions?: Session[]
}

interface InterviewLogsProps {
    auth: {
        user: {
            name: string
            company_name: string
        }
    }
    interviews: Interview[]
    interview: Interview | null // null means show all interviews
}

export default function InterviewLogs({ auth, interviews, interview }: InterviewLogsProps) {
    const isFiltered = interview !== null
    const [expandedInterview, setExpandedInterview] = useState<string | null>(
        isFiltered ? interview.id : null
    )
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
    const [logs, setLogs] = useState<Record<string, Log[]>>({})
    const [loadingLogs, setLoadingLogs] = useState<string | null>(null)

    // Auto-select first session when viewing filtered interview
    useEffect(() => {
        if (isFiltered && interview.sessions && interview.sessions.length > 0) {
            setSelectedSessionId(interview.sessions[0].id)
        }
    }, [])

    useEffect(() => {
        if (selectedSessionId && !logs[selectedSessionId]) {
            fetchLogs(selectedSessionId)
        }
    }, [selectedSessionId])

    const fetchLogs = async (sessionId: string) => {
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

    const toggleInterview = (interviewId: string) => {
        if (expandedInterview === interviewId) {
            setExpandedInterview(null)
            setSelectedSessionId(null)
        } else {
            setExpandedInterview(interviewId)
            const targetInterview = interviews.find(i => i.id === interviewId)
            if (targetInterview && targetInterview.sessions && targetInterview.sessions.length > 0) {
                setSelectedSessionId(targetInterview.sessions[0].id)
            }
        }
    }

    const allSessions = interviews.flatMap(int =>
        (int.sessions || []).map(session => ({
            ...session,
            interview_title: int.job_title,
            interview_company: int.company_name,
            interview_id: int.id
        }))
    )

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title={isFiltered ? `Logs - ${interview.job_title}` : "Interview Logs"} />

            <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
                {/* Navigation Tabs */}
                <div className="border-b">
                    <div className="flex gap-6">
                        <Link href="/dashboard" className="pb-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-border transition-colors">
                            Your Interviews
                        </Link>
                        <div className="pb-3 text-sm font-medium text-primary border-b-2 border-primary">
                            Interview Logs
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {isFiltered ? 'Interview Logs' : 'All Interview Logs'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isFiltered
                                ? `For ${interview.job_title} • ${interview.company_name}`
                                : 'View session history across all your interviews'
                            }
                        </p>
                    </div>
                </div>

                {allSessions.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">No Sessions Found</h3>
                            <p>No interviews have been conducted {isFiltered ? 'for this role' : ''} yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-250px)]">
                        {/* Sidebar: Session List */}
                        <Card className="col-span-1 h-full overflow-hidden flex flex-col md:border-r-0 md:rounded-r-none">
                            <CardHeader className="py-4 px-4 border-b">
                                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Sessions</CardTitle>
                            </CardHeader>
                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                {interviews.map((int) => (
                                    (int.sessions && int.sessions.length > 0) && (
                                        <div key={int.id} className="space-y-1">
                                            {/* Only show interview header if not filtered */}
                                            {!isFiltered && (
                                                <div
                                                    onClick={() => toggleInterview(int.id)}
                                                    className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted transition-colors"
                                                >
                                                    {expandedInterview === int.id ? (
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium truncate">{int.job_title}</div>
                                                        <div className="text-xs text-muted-foreground">{int.sessions.length} sessions</div>
                                                    </div>
                                                </div>
                                            )}
                                            {(isFiltered || expandedInterview === int.id) && (
                                                <div className={cn(!isFiltered && "ml-6 space-y-1")}>
                                                    {int.sessions.map((session) => (
                                                        <div
                                                            key={session.id}
                                                            onClick={() => setSelectedSessionId(session.id)}
                                                            className={cn(
                                                                "p-3 rounded-lg cursor-pointer transition-colors border",
                                                                selectedSessionId === session.id
                                                                    ? "bg-primary/5 border-primary shadow-sm"
                                                                    : "hover:bg-muted border-transparent"
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-between mb-1">
                                                                <Badge variant={session.status === 'completed' ? 'default' : 'secondary'} className="text-[10px] h-5">
                                                                    {session.status}
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(session.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                                                <Clock className="h-3 w-3" />
                                                                {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            {session.progress_state?.completed_questions && (
                                                                <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    {session.progress_state.completed_questions.length} Qs Answered
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                ))}
                            </div>
                        </Card>

                        {/* Main Content: Transcript */}
                        <Card className="col-span-3 h-full overflow-hidden flex flex-col md:rounded-l-none border-l-0">
                            <CardHeader className="py-4 px-6 border-b flex flex-row items-center justify-between bg-muted/20">
                                <div>
                                    <CardTitle className="text-base">
                                        Transcript
                                    </CardTitle>
                                    <CardDescription>
                                        {selectedSessionId ? (
                                            <>Session ID: <span className="font-mono text-xs">{selectedSessionId}</span></>
                                        ) : (
                                            'Select a session to view transcript'
                                        )}
                                    </CardDescription>
                                </div>
                                {selectedSessionId && (
                                    <Button size="sm" variant="outline" onClick={() => fetchLogs(selectedSessionId)}>Re-sync Logs</Button>
                                )}
                            </CardHeader>
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                                {!selectedSessionId ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                        <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                                        <p>Select a session from the left to view its transcript</p>
                                    </div>
                                ) : selectedSessionId && loadingLogs === selectedSessionId ? (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                        Loading transcript...
                                    </div>
                                ) : selectedSessionId && logs[selectedSessionId] && logs[selectedSessionId].length > 0 ? (
                                    <div className="space-y-6 max-w-3xl mx-auto">
                                        {logs[selectedSessionId].map((log) => (
                                            <div key={log.id} className={cn(
                                                "flex gap-4",
                                                log.speaker === 'candidate' ? "flex-row-reverse" : "flex-row"
                                            )}>
                                                <div className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                                                    log.speaker === 'candidate' ? "bg-primary text-primary-foreground" : "bg-muted border text-muted-foreground"
                                                )}>
                                                    {log.speaker === 'candidate' ? 'C' : 'G'}
                                                </div>

                                                <div className={cn(
                                                    "flex flex-col max-w-[80%]",
                                                    log.speaker === 'candidate' ? "items-end" : "items-start"
                                                )}>
                                                    <div className="flex items-baseline gap-2 mb-1">
                                                        <span className="text-xs font-semibold text-foreground">
                                                            {log.speaker === 'agent' ? 'Gennie' : log.speaker === 'candidate' ? 'Candidate' : 'System'}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className={cn(
                                                        "rounded-lg p-3 text-sm leading-relaxed shadow-sm",
                                                        log.speaker === 'candidate'
                                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                                            : log.speaker === 'system'
                                                                ? "bg-muted/50 italic text-muted-foreground w-full text-center border-none shadow-none"
                                                                : "bg-white border rounded-tl-none"
                                                    )}>
                                                        {log.message}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                        <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                                        <p>No transcript available for this session.</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
