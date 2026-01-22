import { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Clock, CheckCircle, ArrowLeft, MessageSquare, AlertCircle, Loader2, ChevronDown, ChevronRight, TrendingUp } from 'lucide-react'
import { Scorecard } from '@/components/Analysis/Scorecard'
import { cn } from '@/lib/utils'

interface Session {
    id: string
    status: string
    created_at: string
    metadata: any
    progress_state: any
    analysis_status: 'pending' | 'processing' | 'completed' | 'failed'
    analysis_result: any
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
    const [analyzingSession, setAnalyzingSession] = useState<string | null>(null)
    const [sessionAnalysis, setSessionAnalysis] = useState<Record<string, { status: 'pending' | 'processing' | 'completed' | 'failed'; result: any }>>({})

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

    // Poll for analysis completion
    useEffect(() => {
        if (!analyzingSession) return;

        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/sessions/${analyzingSession}`);
                const data = await res.json();
                if (data.success && data.session) {
                    const { analysis_status, analysis_result } = data.session;

                    if (analysis_status === 'completed' || analysis_status === 'failed') {
                        setSessionAnalysis(prev => ({
                            ...prev,
                            [analyzingSession]: { status: analysis_status, result: analysis_result }
                        }));
                        setAnalyzingSession(null);
                    }
                }
            } catch (e) {
                console.error('Polling error:', e);
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(pollInterval);
    }, [analyzingSession]);

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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Sidebar: Session List */}
                        <Card className="col-span-1 md:sticky md:top-6 md:self-start overflow-hidden flex flex-col md:max-h-[calc(100vh-8rem)]">
                            <CardHeader className="py-4 px-4 border-b bg-muted/30">
                                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Sessions</CardTitle>
                            </CardHeader>
                            <div className="overflow-y-auto p-2 space-y-2">
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

                        {/* Main Content: Scorecard & Transcript */}
                        <div className="col-span-3 flex flex-col space-y-6">
                            {/* Scorecard or Generate Analysis Button */}
                            {selectedSessionId && (() => {
                                const session = interviews.flatMap(i => i.sessions || []).find(s => s.id === selectedSessionId);
                                const hasLogs = logs[selectedSessionId] && logs[selectedSessionId].length > 0;
                                const localAnalysis = sessionAnalysis[selectedSessionId];
                                const isAnalyzing = analyzingSession === selectedSessionId;

                                if (!session) return null;

                                // Case 1: Analysis Exists (from server or local state) -> Show Scorecard
                                const analysisStatus = localAnalysis?.status || session.analysis_status;
                                const analysisResult = localAnalysis?.result || session.analysis_result;

                                if (analysisResult || analysisStatus === 'completed' || analysisStatus === 'failed') {
                                    return (
                                        <div className="space-y-3">
                                            {/* TODO: TEMPORARY - Remove this button later */}
                                            <div className="flex justify-end">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={isAnalyzing}
                                                    onClick={async () => {
                                                        setAnalyzingSession(session.id);
                                                        // Clear local state first
                                                        setSessionAnalysis(prev => {
                                                            const newState = { ...prev };
                                                            delete newState[session.id];
                                                            return newState;
                                                        });
                                                        try {
                                                            // Force re-analysis by resetting status first
                                                            await fetch(`/api/sessions/${session.id}/reset-analysis`, { method: 'POST' });
                                                            const res = await fetch(`/api/sessions/${session.id}/analyze`, { method: 'POST' });
                                                            const data = await res.json();
                                                            if (!data.success) {
                                                                setAnalyzingSession(null);
                                                                alert(data.message || 'Failed to start analysis');
                                                            }
                                                        } catch (e) {
                                                            setAnalyzingSession(null);
                                                            console.error(e);
                                                        }
                                                    }}
                                                >
                                                    {isAnalyzing ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Re-running...
                                                        </>
                                                    ) : (
                                                        'Re-run Assessment'
                                                    )}
                                                </Button>
                                            </div>
                                            <Scorecard
                                                status={analysisStatus || 'pending'}
                                                result={analysisResult}
                                            />
                                        </div>
                                    );
                                }

                                // Case 2: Currently Analyzing -> Show Processing State
                                if (isAnalyzing || analysisStatus === 'processing') {
                                    return (
                                        <div>
                                            <Card>
                                                <CardContent className="flex items-center justify-center p-6">
                                                    <Loader2 className="h-5 w-5 animate-spin mr-3" />
                                                    <span className="text-muted-foreground">Analyzing interview...</span>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    );
                                }

                                // Case 3: No Analysis, has logs -> Show Generate Button
                                if (hasLogs) {
                                    return (
                                        <div>
                                            <Card>
                                                <CardContent className="flex items-center justify-between p-6">
                                                    <div className="space-y-1">
                                                        <h3 className="font-semibold">Interview Analysis</h3>
                                                        <p className="text-sm text-muted-foreground">Generate a scorecard and summary for this session.</p>
                                                    </div>
                                                    <Button
                                                        onClick={async () => {
                                                            setAnalyzingSession(session.id);
                                                            try {
                                                                const res = await fetch(`/api/sessions/${session.id}/analyze`, { method: 'POST' });
                                                                const data = await res.json();
                                                                if (!data.success) {
                                                                    setAnalyzingSession(null);
                                                                    alert(data.message || 'Failed to start analysis');
                                                                }
                                                            } catch (e) {
                                                                setAnalyzingSession(null);
                                                                console.error(e);
                                                            }
                                                        }}
                                                    >
                                                        <TrendingUp className="h-4 w-4 mr-2" />
                                                        Generate Analysis
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    );
                                }

                                return null;
                            })()}

                            <Card className="min-h-[500px]">
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
                                <div className="p-6 bg-slate-50/50 min-h-[400px]">
                                    {!selectedSessionId ? (
                                        <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
                                            <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                                            <p>Select a session from the left to view its transcript</p>
                                        </div>
                                    ) : selectedSessionId && loadingLogs === selectedSessionId ? (
                                        <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                            Loading transcript...
                                        </div>
                                    ) : selectedSessionId && logs[selectedSessionId] && logs[selectedSessionId].length > 0 ? (
                                        <div className="space-y-6 max-w-3xl mx-auto pb-8">
                                            {/* Interview Statistics Summary */}
                                            {(() => {
                                                const sessionLogs = logs[selectedSessionId];
                                                const candidateLogs = sessionLogs.filter(l => l.speaker === 'candidate');
                                                const agentLogs = sessionLogs.filter(l => l.speaker === 'agent');
                                                const candidateWords = candidateLogs.reduce((sum, l) => sum + l.message.split(/\s+/).filter(Boolean).length, 0);
                                                const agentWords = agentLogs.reduce((sum, l) => sum + l.message.split(/\s+/).filter(Boolean).length, 0);
                                                const totalMessages = candidateLogs.length + agentLogs.length;

                                                // Calculate duration if we have timestamps
                                                let durationText = '';
                                                if (sessionLogs.length >= 2) {
                                                    const startTime = new Date(sessionLogs[0].created_at).getTime();
                                                    const endTime = new Date(sessionLogs[sessionLogs.length - 1].created_at).getTime();
                                                    const durationMs = endTime - startTime;
                                                    const minutes = Math.floor(durationMs / 60000);
                                                    const seconds = Math.floor((durationMs % 60000) / 1000);
                                                    durationText = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
                                                }

                                                return (
                                                    <div className="bg-white border rounded-lg p-4 mb-6">
                                                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Interview Statistics</h4>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                                            <div>
                                                                <div className="text-2xl font-bold text-foreground">{totalMessages}</div>
                                                                <div className="text-xs text-muted-foreground">Messages</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-2xl font-bold text-primary">{candidateWords}</div>
                                                                <div className="text-xs text-muted-foreground">Candidate Words</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-2xl font-bold text-muted-foreground">{agentWords}</div>
                                                                <div className="text-xs text-muted-foreground">Gennie Words</div>
                                                            </div>
                                                            {durationText && (
                                                                <div>
                                                                    <div className="text-2xl font-bold text-foreground">{durationText}</div>
                                                                    <div className="text-xs text-muted-foreground">Duration</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Speaking ratio bar */}
                                                        <div className="mt-4">
                                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                                <span>Candidate ({Math.round(candidateWords / (candidateWords + agentWords || 1) * 100)}%)</span>
                                                                <span>Gennie ({Math.round(agentWords / (candidateWords + agentWords || 1) * 100)}%)</span>
                                                            </div>
                                                            <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                                                                <div
                                                                    className="bg-primary transition-all"
                                                                    style={{ width: `${candidateWords / (candidateWords + agentWords || 1) * 100}%` }}
                                                                />
                                                                <div
                                                                    className="bg-muted-foreground/40 transition-all"
                                                                    style={{ width: `${agentWords / (candidateWords + agentWords || 1) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* Transcript Messages */}
                                            {logs[selectedSessionId].map((log) => {
                                                const wordCount = log.message.split(/\s+/).filter(Boolean).length;

                                                return (
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
                                                                {log.speaker !== 'system' && (
                                                                    <span className="text-[10px] text-muted-foreground/60">
                                                                        {wordCount} words
                                                                    </span>
                                                                )}
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
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
                                            <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                                            <p>No transcript available for this session.</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
