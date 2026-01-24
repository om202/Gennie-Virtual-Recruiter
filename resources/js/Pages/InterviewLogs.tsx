import { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Clock, CheckCircle, MessageSquare, AlertCircle, Loader2, ChevronDown, ChevronRight, TrendingUp, Phone, Globe, RefreshCw, Trash2 } from 'lucide-react'
import { Scorecard } from '@/components/Analysis/Scorecard'
import { AssessmentReportDialog } from '@/components/Analysis/AssessmentReportDialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

interface TwilioData {
    status?: string
    duration?: number
    from?: string
    to?: string
    direction?: string
    start_time?: string
    end_time?: string
    recording_sid?: string
    recording_url?: string
    recording_duration?: number
    recording_status?: string
}

interface Session {
    id: string
    status: string
    created_at: string
    metadata: any
    progress_state: any
    analysis_result: any
    analysis_status?: string
    channel?: 'web' | 'phone'
    twilio_data?: TwilioData
    interview_id?: string
    candidate_id?: string
    candidate?: {
        id: string
        name: string
        email: string
    }
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
    candidateFilter?: string | null
    candidateName?: string | null
}

export default function InterviewLogs({ auth: _auth, interviews, interview, candidateFilter, candidateName }: InterviewLogsProps) {
    const isFiltered = interview !== null
    const [expandedInterview, setExpandedInterview] = useState<string | null>(
        isFiltered ? interview.id : null
    )
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
    const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false)
    const [deleteSessionDialogOpen, setDeleteSessionDialogOpen] = useState(false)
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
    const [logs, setLogs] = useState<Record<string, Log[]>>({})
    // Store fresh session details fetched from API
    const [sessionDetails, setSessionDetails] = useState<Record<string, Session>>({})
    const [loadingLogs, setLoadingLogs] = useState<string | null>(null)
    const [analyzingSession, setAnalyzingSession] = useState<string | null>(null)
    const [sessionAnalysis, setSessionAnalysis] = useState<Record<string, { status: 'pending' | 'processing' | 'completed' | 'failed'; result: any }>>({})

    // Auto-select first session on initial load
    useEffect(() => {
        if (isFiltered && interview.sessions && interview.sessions.length > 0) {
            // Filtered view: select first session of this interview
            setSelectedSessionId(interview.sessions[0].id)
            setExpandedInterview(interview.id)
        } else if (!isFiltered && allSessions.length > 0) {
            // All interviews view: select the first available session
            const firstSession = allSessions[0]
            setSelectedSessionId(firstSession.id)
            setExpandedInterview(firstSession.interview_id)
        }
    }, [])

    useEffect(() => {
        if (selectedSessionId) {
            // Always fetch fresh data when selecting a session to ensure recording URL is present
            // preventing the need to refresh the page after a call
            fetchSessionData(selectedSessionId)
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
                        // Also update session details
                        setSessionDetails(prev => ({ ...prev, [analyzingSession]: data.session }))
                    }
                }
            } catch (e) {
                console.error('Polling error:', e);
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(pollInterval);
    }, [analyzingSession]);

    const fetchSessionData = async (sessionId: string) => {
        setLoadingLogs(sessionId)
        try {
            // Parallel fetch for logs and session details
            const [logsRes, sessionRes] = await Promise.all([
                fetch(`/api/sessions/${sessionId}/logs`),
                fetch(`/api/sessions/${sessionId}`)
            ]);

            const logsData = await logsRes.json();
            const sessionData = await sessionRes.json();

            if (logsData.success) {
                setLogs(prev => ({ ...prev, [sessionId]: logsData.logs }))
            }
            if (sessionData.success) {
                setSessionDetails(prev => ({ ...prev, [sessionId]: sessionData.session }))
            }
        } catch (err) {
            console.error("Failed to load session data", err)
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

    // Helper to get the most up-to-date session object
    const getActiveSession = () => {
        if (!selectedSessionId) return null;
        // Prefer fresh API data >> Prop data
        return sessionDetails[selectedSessionId] || allSessions.find(s => s.id === selectedSessionId);
    }

    const handleDeleteSession = async () => {
        if (!sessionToDelete) return;

        try {
            const response = await fetch(`/api/sessions/${sessionToDelete}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                // Redirect to logs page to refresh the list
                window.location.href = '/interviews/logs';
            } else {
                alert(data.error || 'Failed to delete session');
            }
        } catch (error) {
            console.error('Failed to delete session:', error);
            alert('Failed to delete session. Please try again.');
        } finally {
            setDeleteSessionDialogOpen(false);
            setSessionToDelete(null);
        }
    }

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title={isFiltered ? `Logs - ${interview.job_title}` : "Interview Logs"} />

            <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {candidateName
                                ? `Interviews for ${candidateName}`
                                : isFiltered
                                    ? 'Interview Logs'
                                    : 'All Interview Logs'}
                        </h1>
                        <p className="text-muted-foreground">
                            {candidateName
                                ? `Showing all interview sessions for this candidate`
                                : isFiltered
                                    ? `For ${interview.job_title} • ${interview.company_name}`
                                    : 'View session history across all your interviews'
                            }
                        </p>
                    </div>
                    {candidateFilter && (
                        <Link href="/interviews/logs">
                            <Button variant="outline" size="sm">
                                Clear Filter
                            </Button>
                        </Link>
                    )}
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
                                                        <div className="text-sm font-bold truncate">{int.job_title}</div>
                                                        <div className="text-xs text-muted-foreground">{int.sessions.length} sessions</div>
                                                    </div>
                                                </div>
                                            )}
                                            {(isFiltered || expandedInterview === int.id) && (
                                                <div className={cn(!isFiltered && "ml-6 space-y-2")}>
                                                    {int.sessions.map((session) => {
                                                        const isSelected = selectedSessionId === session.id;
                                                        const sessionDate = new Date(session.created_at);

                                                        return (
                                                            <div
                                                                key={session.id}
                                                                onClick={() => setSelectedSessionId(session.id)}
                                                                className={cn(
                                                                    "rounded-lg p-3 cursor-pointer transition-all border",
                                                                    isSelected
                                                                        ? "border-border"
                                                                        : "border-transparent hover:bg-accent/50"
                                                                )}
                                                            >
                                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <span className={cn("text-xs font-semibold", isSelected ? "text-primary" : "text-foreground")}>
                                                                            {session.candidate ? session.candidate.name : 'Unknown User'}
                                                                        </span>
                                                                        <time className={cn("text-xs", isSelected ? "text-muted-foreground/80" : "text-muted-foreground")}>
                                                                            {sessionDate.toLocaleDateString([], {
                                                                                month: 'short',
                                                                                day: 'numeric'
                                                                            })}
                                                                            {' '}
                                                                            {sessionDate.toLocaleTimeString([], {
                                                                                hour: '2-digit',
                                                                                minute: '2-digit'
                                                                            })}
                                                                        </time>
                                                                    </div>
                                                                    {/* Channel Badge */}
                                                                    <Badge variant="outline" className="text-xs gap-1">
                                                                        {session.channel === 'phone' ? (
                                                                            <><Phone className="h-3 w-3" /></>
                                                                        ) : (
                                                                            <><Globe className="h-3 w-3" /></>
                                                                        )}
                                                                    </Badge>
                                                                </div>

                                                                {session.progress_state?.completed_questions && (
                                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                        <CheckCircle className={cn("h-3.5 w-3.5", isSelected ? "text-primary" : "text-muted-foreground")} />
                                                                        <span className={cn(isSelected ? "text-primary" : "text-muted-foreground")}>
                                                                            {session.progress_state.completed_questions.length} questions answered
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
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
                                const session = getActiveSession();
                                const hasLogs = logs[selectedSessionId] && logs[selectedSessionId].length > 0;
                                const localAnalysis = sessionAnalysis[selectedSessionId];
                                const isAnalyzing = analyzingSession === selectedSessionId;

                                if (!session) return null;

                                // Case 1: Analysis Exists (from server or local state) -> Show Scorecard as Link
                                const analysisStatus = localAnalysis?.status || session.analysis_status;
                                const analysisResult = localAnalysis?.result || session.analysis_result;

                                if (analysisResult || analysisStatus === 'completed' || analysisStatus === 'failed') {
                                    // Check if this is an insufficient data case
                                    const errorResult = analysisResult as { error?: string } | null;
                                    const isInsufficientData = errorResult?.error && (errorResult.error.includes('Insufficient') || errorResult.error.includes('insufficient'));

                                    return (
                                        <div className="space-y-3">
                                            {/* TODO: TEMPORARY - Remove this button later */}
                                            <div className="flex items-center justify-between gap-2">
                                                <Badge
                                                    variant={session.status === 'completed' ? 'default' : 'secondary'}
                                                    className="text-sm"
                                                >
                                                    {session.status}
                                                </Badge>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSessionToDelete(session.id);
                                                            setDeleteSessionDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                                                        Delete
                                                    </Button>
                                                    {/* Hide Re-run Assessment for insufficient data cases */}
                                                    {!isInsufficientData && (
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
                                                    )}
                                                </div>
                                            </div>
                                            {/* Clickable Scorecard - Opens Full-Screen Dialog */}
                                            <div
                                                onClick={() => {
                                                    // Only open dialog if not insufficient data error
                                                    const errorResult = analysisResult as { error?: string } | null;
                                                    const isInsufficientData = errorResult?.error && (errorResult.error.includes('Insufficient') || errorResult.error.includes('insufficient'));
                                                    if (!isInsufficientData) {
                                                        setAssessmentDialogOpen(true);
                                                    }
                                                }}
                                            >
                                                <Scorecard
                                                    status={analysisStatus || 'pending'}
                                                    result={analysisResult}
                                                    mode="compact"
                                                />
                                            </div>
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

                            {/* Interview Statistics Cards */}
                            {selectedSessionId && logs[selectedSessionId] && logs[selectedSessionId].length > 0 && (() => {
                                const sessionLogs = logs[selectedSessionId];
                                const candidateLogs = sessionLogs.filter(l => l.speaker === 'candidate');
                                const agentLogs = sessionLogs.filter(l => l.speaker === 'agent');
                                const candidateWords = candidateLogs.reduce((sum, l) => sum + l.message.split(/\s+/).filter(Boolean).length, 0);
                                const agentWords = agentLogs.reduce((sum, l) => sum + l.message.split(/\s+/).filter(Boolean).length, 0);
                                const totalMessages = candidateLogs.length + agentLogs.length;
                                const candidatePercentage = Math.round(candidateWords / (candidateWords + agentWords || 1) * 100);
                                const agentPercentage = Math.round(agentWords / (candidateWords + agentWords || 1) * 100);

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
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        {/* Messages Card */}
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium">Messages</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-muted-foreground">{totalMessages}</div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Total exchanges
                                                </p>
                                            </CardContent>
                                        </Card>

                                        {/* Candidate Words Card */}
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium">Candidate Words</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-muted-foreground">{candidateWords}</div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {candidatePercentage}% of conversation
                                                </p>
                                            </CardContent>
                                        </Card>

                                        {/* Gennie Words Card */}
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium">Gennie Words</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-muted-foreground">{agentWords}</div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {agentPercentage}% of conversation
                                                </p>
                                            </CardContent>
                                        </Card>

                                        {/* Duration Card */}
                                        {durationText && (
                                            <Card>
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm font-medium">Duration</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold text-muted-foreground">{durationText}</div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Interview length
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Recording & Call Details Card */}
                            {selectedSessionId && (() => {
                                const session = getActiveSession();
                                if (!session || !session.twilio_data) return null;

                                const hasRecording = !!session.twilio_data.recording_url;
                                const isPhone = session.channel === 'phone';

                                // Only show if it's a phone call OR if it has a recording (for web)
                                if (!isPhone && !hasRecording) return null;

                                const formatDuration = (seconds?: number) => {
                                    if (!seconds) return 'N/A';
                                    const mins = Math.floor(seconds / 60);
                                    const secs = seconds % 60;
                                    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                                };

                                return (
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                {isPhone ? <Phone className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
                                                {isPhone ? 'Call Details' : 'Session Recording'}
                                            </CardTitle>
                                            <CardDescription>
                                                {isPhone
                                                    ? 'This interview was conducted via phone call'
                                                    : 'Audio recording captured from web interview'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {isPhone && (
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground block text-xs mb-1">Status</span>
                                                        <Badge variant={session.twilio_data.status === 'completed' ? 'default' : 'secondary'}>
                                                            {session.twilio_data.status || 'N/A'}
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block text-xs mb-1">Duration</span>
                                                        <p className="font-medium">{formatDuration(session.twilio_data.duration)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block text-xs mb-1">Called Number</span>
                                                        <p className="font-medium font-mono text-sm">{session.twilio_data.to || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block text-xs mb-1">From</span>
                                                        <p className="font-medium font-mono text-sm">{session.twilio_data.from || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Recording Player */}
                                            {session.twilio_data.recording_url && (
                                                <div className={cn("pt-2", isPhone && "border-t")}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium">
                                                            {isPhone ? 'Call Recording' : 'Session Audio'}
                                                        </span>
                                                        {session.twilio_data.recording_duration && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDuration(session.twilio_data.recording_duration)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <audio controls className="w-full h-10">
                                                        <source src={`/api/sessions/${session.id}/recording`} type="audio/webm" />
                                                        <source src={`/api/sessions/${session.id}/recording`} type="audio/mpeg" />
                                                        Your browser does not support the audio element.
                                                    </audio>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })()}

                            {/* Transcript Card */}
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
                                        <Button size="sm" variant="outline" onClick={() => fetchSessionData(selectedSessionId)}>
                                            <RefreshCw className="h-3 w-3 mr-2" />
                                            Re-sync Logs
                                        </Button>
                                    )}
                                </CardHeader>
                                <div className="p-6 bg-primary/5 min-h-[400px] max-h-[600px] overflow-y-auto" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
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
                                            {/* Transcript Messages */}
                                            {logs[selectedSessionId].map((log) => {
                                                const wordCount = log.message.split(/\s+/).filter(Boolean).length;

                                                return (
                                                    <div key={log.id} className={cn(
                                                        "flex gap-4 group",
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
                                                                "rounded-lg p-3 text-sm leading-relaxed shadow-sm relative",
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
                )
                }
            </div >

            {/* Assessment Report Dialog */}
            {
                selectedSessionId && (() => {
                    const session = allSessions.find(s => s.id === selectedSessionId);
                    const sessionInterview = interviews.find(i => i.id === session?.interview_id);

                    if (!session || !sessionInterview) return null;

                    return (
                        <AssessmentReportDialog
                            open={assessmentDialogOpen}
                            onClose={() => setAssessmentDialogOpen(false)}
                            interview={sessionInterview}
                            session={session}
                        />
                    );
                })()
            }


            {/* Delete Session Confirmation Dialog */}
            <AlertDialog open={deleteSessionDialogOpen} onOpenChange={setDeleteSessionDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Entire Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this entire interview session? This will permanently delete all logs, recordings, and analysis results. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteSession}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Session
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    )
}
