import { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Clock, CheckCircle, MessageSquare, TrendingUp, Globe, Loader2, ArrowLeft, RefreshCw } from 'lucide-react'
import { Scorecard } from '@/components/Analysis/Scorecard'
import { AssessmentReportDialog } from '@/components/Analysis/AssessmentReportDialog'
import { cn } from '@/lib/utils'

interface TwilioData {
    recording_url?: string
    recording_duration?: number
}

interface Session {
    id: string
    status: string
    created_at: string
    metadata: any
    progress_state: any
    analysis_status: 'pending' | 'processing' | 'completed' | 'failed'
    analysis_result: any
    channel?: 'web' | 'phone'
    twilio_data?: TwilioData
}

interface Log {
    id: number
    speaker: string
    message: string
    created_at: string
}

interface TryGennieResultProps {
    sessionId: string
}

export default function TryGennieResult({ sessionId }: TryGennieResultProps) {
    const [session, setSession] = useState<Session | null>(null)
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)
    const [analyzing, setAnalyzing] = useState(false)
    const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false)

    // Fetch session data
    const fetchData = async () => {
        try {
            const [sessionRes, logsRes] = await Promise.all([
                fetch(`/api/sessions/${sessionId}`),
                fetch(`/api/sessions/${sessionId}/logs`)
            ])

            const sessionData = await sessionRes.json()
            const logsData = await logsRes.json()

            if (sessionData.success) {
                setSession(sessionData.session)
            }
            if (logsData.success) {
                setLogs(logsData.logs)
            }
        } catch (error) {
            console.error('Failed to fetch session data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [sessionId])

    // Poll for analysis completion
    useEffect(() => {
        if (!analyzing && session?.analysis_status !== 'processing') return

        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/sessions/${sessionId}`)
                const data = await res.json()
                if (data.success && data.session) {
                    setSession(data.session)
                    if (data.session.analysis_status === 'completed' || data.session.analysis_status === 'failed') {
                        setAnalyzing(false)
                    }
                }
            } catch (e) {
                console.error('Polling error:', e)
            }
        }, 2000)

        return () => clearInterval(pollInterval)
    }, [analyzing, session?.analysis_status, sessionId])

    const handleGenerateAnalysis = async () => {
        setAnalyzing(true)
        try {
            const res = await fetch(`/api/sessions/${sessionId}/analyze`, { method: 'POST' })
            const data = await res.json()
            if (!data.success) {
                setAnalyzing(false)
                alert(data.message || 'Failed to start analysis')
            }
        } catch (e) {
            setAnalyzing(false)
            console.error(e)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-muted/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-muted/50 flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Session Not Found</h1>
                <p className="text-muted-foreground">This interview session doesn't exist or has expired.</p>
                <Link href="/try-gennie">
                    <Button>Try Another Interview</Button>
                </Link>
            </div>
        )
    }

    // Calculate stats
    const candidateLogs = logs.filter(l => l.speaker === 'candidate')
    const agentLogs = logs.filter(l => l.speaker === 'agent')
    const candidateWords = candidateLogs.reduce((sum, l) => sum + l.message.split(/\s+/).filter(Boolean).length, 0)
    const agentWords = agentLogs.reduce((sum, l) => sum + l.message.split(/\s+/).filter(Boolean).length, 0)
    const totalMessages = candidateLogs.length + agentLogs.length
    const candidatePercentage = Math.round(candidateWords / (candidateWords + agentWords || 1) * 100)

    let durationText = ''
    if (logs.length >= 2) {
        const startTime = new Date(logs[0].created_at).getTime()
        const endTime = new Date(logs[logs.length - 1].created_at).getTime()
        const durationMs = endTime - startTime
        const minutes = Math.floor(durationMs / 60000)
        const seconds = Math.floor((durationMs % 60000) / 1000)
        durationText = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
    }

    const hasRecording = !!session.twilio_data?.recording_url
    const hasLogs = logs.length > 0
    const analysisStatus = session.analysis_status
    const analysisResult = session.analysis_result

    // Create mock interview object for AssessmentReportDialog
    const interview = {
        id: sessionId,
        job_title: session.metadata?.job_title || 'Software Engineer',
        company_name: session.metadata?.company_name || 'TechCorp Inc.',
    }

    return (
        <>
            <Head>
                <title>Interview Results | Gennie</title>
                <meta name="description" content="View your AI interview assessment results including transcript, recording, and detailed analysis." />
            </Head>

            <div className="min-h-screen bg-muted/50">
                <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <Link href="/try-gennie">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                New Interview
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={fetchData}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>

                    {/* Sign Up Banner */}
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left">
                            <p className="font-semibold text-primary">Want more interviews?</p>
                            <p className="text-sm text-muted-foreground">Sign in to save interviews, customize job descriptions, and track candidates.</p>
                        </div>
                        <a href="/dashboard">
                            <Button>Sign in with Google</Button>
                        </a>
                    </div>

                    {/* Title */}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Interview Results</h1>
                        <p className="text-muted-foreground">
                            {interview.job_title} • {interview.company_name}
                        </p>
                    </div>

                    {/* Assessment Section */}
                    {(() => {
                        // Analysis exists
                        if (analysisResult || analysisStatus === 'completed' || analysisStatus === 'failed') {
                            const errorResult = analysisResult as { error?: string } | null
                            const isInsufficientData = errorResult?.error?.includes('Insufficient')

                            return (
                                <div
                                    onClick={() => !isInsufficientData && setAssessmentDialogOpen(true)}
                                >
                                    <Scorecard
                                        status={analysisStatus || 'pending'}
                                        result={analysisResult}
                                        mode="compact"
                                    />
                                </div>
                            )
                        }

                        // Currently analyzing
                        if (analyzing || analysisStatus === 'processing') {
                            return (
                                <Card>
                                    <CardContent className="flex items-center justify-center p-6">
                                        <Loader2 className="h-5 w-5 animate-spin mr-3" />
                                        <span className="text-muted-foreground">Analyzing interview...</span>
                                    </CardContent>
                                </Card>
                            )
                        }

                        // No analysis, has logs
                        if (hasLogs) {
                            return (
                                <Card>
                                    <CardContent className="flex items-center justify-between p-6">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold">Interview Analysis</h3>
                                            <p className="text-sm text-muted-foreground">Generate a scorecard and summary for this interview.</p>
                                        </div>
                                        <Button onClick={handleGenerateAnalysis}>
                                            <TrendingUp className="h-4 w-4 mr-2" />
                                            Generate Analysis
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        }

                        return null
                    })()}

                    {/* Stats Cards */}
                    {hasLogs && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Messages</CardTitle>
                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalMessages}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Total exchanges</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Your Words</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary">{candidateWords}</div>
                                    <p className="text-xs text-muted-foreground mt-1">{candidatePercentage}% of conversation</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Gennie Words</CardTitle>
                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{agentWords}</div>
                                    <p className="text-xs text-muted-foreground mt-1">{100 - candidatePercentage}% of conversation</p>
                                </CardContent>
                            </Card>

                            {durationText && (
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Duration</CardTitle>
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{durationText}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Interview length</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Recording Card */}
                    {hasRecording && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Globe className="h-5 w-5" />
                                    Session Recording
                                </CardTitle>
                                <CardDescription>Audio recording of your interview</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <audio controls className="w-full h-10">
                                    <source src={`/api/sessions/${sessionId}/recording`} type="audio/webm" />
                                    <source src={`/api/sessions/${sessionId}/recording`} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            </CardContent>
                        </Card>
                    )}

                    {/* Transcript Card */}
                    <Card className="min-h-[400px]">
                        <CardHeader className="py-4 px-6 border-b bg-muted/20">
                            <CardTitle className="text-base">Transcript</CardTitle>
                            <CardDescription>
                                Full conversation from your interview
                            </CardDescription>
                        </CardHeader>
                        <div className="p-6 bg-slate-50/50 min-h-[300px]">
                            {hasLogs ? (
                                <div className="space-y-6 max-w-3xl mx-auto pb-8">
                                    {logs.map((log) => {
                                        const wordCount = log.message.split(/\s+/).filter(Boolean).length

                                        return (
                                            <div key={log.id} className={cn(
                                                "flex gap-4 group",
                                                log.speaker === 'candidate' ? "flex-row-reverse" : "flex-row"
                                            )}>
                                                <div className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                                                    log.speaker === 'candidate' ? "bg-primary text-primary-foreground" : "bg-muted border text-muted-foreground"
                                                )}>
                                                    {log.speaker === 'candidate' ? 'You' : 'G'}
                                                </div>

                                                <div className={cn(
                                                    "flex flex-col max-w-[80%]",
                                                    log.speaker === 'candidate' ? "items-end" : "items-start"
                                                )}>
                                                    <div className="flex items-baseline gap-2 mb-1">
                                                        <span className="text-xs font-semibold text-foreground">
                                                            {log.speaker === 'agent' ? 'Gennie' : log.speaker === 'candidate' ? 'You' : 'System'}
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
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center min-h-[200px] text-muted-foreground">
                                    <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                                    <p>No transcript available for this session.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Assessment Report Dialog */}
            {session && (
                <AssessmentReportDialog
                    open={assessmentDialogOpen}
                    onClose={() => setAssessmentDialogOpen(false)}
                    interview={interview}
                    session={session}
                />
            )}
        </>
    )
}
