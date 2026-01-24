import { Head } from '@inertiajs/react'
import { useState, useCallback, useEffect } from 'react'
import { useDeepgramAgent, type AgentConfig } from '@/hooks/useDeepgramAgent'
import { VoiceVisualizer } from '@/components/VoiceVisualizer'
import { TranscriptDisplay } from '@/components/TranscriptDisplay'
import { Button } from '@/components/ui/button'
import { Globe, Phone, Briefcase, Clock, User, Loader2, Eye, ArrowLeft, Pencil, Copy, Check } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Interview {
    id: string
    job_title: string
    company_name: string
    duration_minutes: number
    interview_type: string
    difficulty_level: string
    candidate_instructions?: string | null
}

interface Candidate {
    id: string
    name: string
    email: string
}

interface Props {
    interview?: Interview
    candidate?: Candidate | null
    scheduledAt?: string
    scheduleId?: number
    token: string
    type: 'interview' | 'scheduled'
    error?: string
    isSelfPreview?: boolean
}

export default function PublicInterview({ interview, candidate, token, error, isSelfPreview }: Props) {
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [isCreatingSession, setIsCreatingSession] = useState(false)
    const [isCalling, setIsCalling] = useState(false)
    const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState('')
    const [hasEnded, setHasEnded] = useState(false)
    const [interviewData, setInterviewData] = useState<{ job_description?: string } | null>(null)
    const [urlCopied, setUrlCopied] = useState(false)

    const handleCopyUrl = async () => {
        await navigator.clipboard.writeText(window.location.href)
        setUrlCopied(true)
        setTimeout(() => setUrlCopied(false), 2000)
    }

    // Error state
    if (error || !interview) {
        return (
            <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
                <Head title="Interview Unavailable" />
                <div className="max-w-md text-center space-y-4">
                    <div className="text-6xl">😔</div>
                    <h1 className="text-2xl font-bold">Interview Unavailable</h1>
                    <p className="text-muted-foreground">
                        {error || 'This interview link is no longer valid or has expired.'}
                    </p>
                </div>
            </div>
        )
    }

    const getAgentConfig = useCallback((): AgentConfig => ({
        sessionId: sessionId || undefined,
        jobTitle: interview.job_title,
        companyName: interview.company_name,
        jobDescription: interviewData?.job_description || '',
        resume: '',
        interviewType: interview.interview_type as AgentConfig['interviewType'],
        difficultyLevel: interview.difficulty_level as AgentConfig['difficultyLevel'],
        durationMinutes: interview.duration_minutes,
    }), [sessionId, interview, interviewData])

    const {
        speakingState,
        transcript,
        startConversation: startDeepgramConversation,
        stopConversation: stopDeepgramConversation,
        isConnected,
        connectionState,
    } = useDeepgramAgent(getAgentConfig())

    // Create a session via the public API
    const createSession = async (): Promise<string> => {
        setIsCreatingSession(true)
        try {
            const res = await fetch(`/public/start/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            const data = await res.json()

            if (!data.success) {
                throw new Error(data.error || 'Failed to start session')
            }

            setSessionId(data.session.id)
            setInterviewData(data.interview)
            return data.session.id
        } finally {
            setIsCreatingSession(false)
        }
    }

    // Start conversation with session creation
    const handleStartInterview = async () => {
        try {
            await createSession()
            setTimeout(() => {
                startDeepgramConversation()
            }, 100)
        } catch (error) {
            console.error('Failed to create session:', error)
            alert('Failed to start interview. Please try again.')
        }
    }

    // Handle stop
    const handleStopInterview = async () => {
        setHasEnded(true)
        await stopDeepgramConversation()
    }

    // Watch for interview end
    useEffect(() => {
        if (connectionState === 'idle' && sessionId && transcript.length > 0 && !hasEnded) {
            setHasEnded(true)
        }
    }, [connectionState, sessionId, transcript.length, hasEnded])

    const handleCallSubmit = async () => {
        if (!phoneNumber) {
            alert('Please enter a phone number')
            return
        }

        const newSessionId = await createSession()

        setIsPhoneDialogOpen(false)
        setIsCalling(true)
        try {
            const res = await fetch('/api/twilio/call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: phoneNumber,
                    session_id: newSessionId
                })
            })
            const data = await res.json()
            if (data.success) {
                alert('Calling your phone... The interview will begin when you answer.')
            } else {
                alert('Failed to initiate call: ' + (data.error || 'Unknown error'))
            }
        } catch (error) {
            console.error(error)
            alert('Error initiating call')
        } finally {
            setIsCalling(false)
        }
    }

    const isLoading = isCreatingSession || (connectionState === 'connecting')

    return (
        <>
            <Head>
                <title>{`Interview: ${interview.job_title} at ${interview.company_name}`}</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="bg-muted/50 text-foreground min-h-screen flex flex-col p-4">
                {/* Self Preview Banner */}
                {isSelfPreview && (
                    <div className="w-full max-w-6xl mx-auto mb-6">
                        <div className="bg-card border rounded-xl p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                        <Eye className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-amber-700 dark:text-amber-300">Preview Mode</h3>
                                        <p className="text-sm text-muted-foreground">You're seeing exactly what candidates will experience</p>
                                    </div>
                                </div>
                                <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0">
                                    <ArrowLeft className="h-3 w-3" />
                                    Dashboard
                                </a>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyUrl}
                                    className="gap-2"
                                >
                                    {urlCopied ? (
                                        <><Check className="h-4 w-4 text-green-600" /> Copied!</>
                                    ) : (
                                        <><Copy className="h-4 w-4" /> Copy URL</>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="gap-2"
                                >
                                    <a href={`/interviews/${interview.id}/edit`}>
                                        <Pencil className="h-4 w-4" />
                                        Edit Interview
                                    </a>
                                </Button>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-sm text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    Session marked as "Self"
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="w-full max-w-6xl mx-auto mb-6">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            <span className="text-primary">{interview.company_name}</span>
                        </h1>
                        <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                {interview.job_title}
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {interview.duration_minutes} min
                            </span>
                            <span className="capitalize flex items-center gap-2">
                                {interview.interview_type} Interview
                            </span>
                        </div>

                        {candidate && (
                            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 inline-flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                <span>Welcome, <strong>{candidate.name}</strong></span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex items-start justify-center pt-4">
                    {hasEnded ? (
                        /* Interview Completed */
                        <div className="max-w-md w-full text-center space-y-6">
                            <div className="text-6xl">🎉</div>
                            <h2 className="text-2xl font-bold">Interview Complete!</h2>
                            <p className="text-muted-foreground">
                                Thank you for completing your interview. The recruiter will review your responses and get back to you soon.
                            </p>
                        </div>
                    ) : !isConnected ? (
                        /* Ready to Start */
                        <div className="max-w-md w-full text-center space-y-8">
                            <VoiceVisualizer speakingState={speakingState} />

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleStartInterview}
                                    size="lg"
                                    className="flex-1 hover:scale-[1.02] active:scale-[0.98]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Starting...
                                        </>
                                    ) : (
                                        <>
                                            <Globe className="h-5 w-5 mr-2" />
                                            Start Interview
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => setIsPhoneDialogOpen(true)}
                                    variant="outline"
                                    size="lg"
                                    disabled={isCalling || isLoading}
                                    className="flex-1 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Phone className="h-5 w-5 mr-2" />
                                    {isCalling ? 'Calling...' : 'Call Me'}
                                </Button>
                            </div>

                            {/* Candidate Instructions (from recruiter) */}
                            {interview.candidate_instructions && (
                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-left space-y-2">
                                    <h3 className="font-semibold text-sm text-primary uppercase tracking-wide">
                                        Interview Instructions
                                    </h3>
                                    <p className="text-sm text-foreground whitespace-pre-wrap">
                                        {interview.candidate_instructions}
                                    </p>
                                </div>
                            )}

                            {/* Default Instructions */}
                            <div className="bg-card border rounded-lg p-4 text-left space-y-2">
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                    Before You Begin
                                </h3>
                                <ul className="text-sm space-y-1 text-muted-foreground">
                                    <li>• Find a quiet place with good internet connection</li>
                                    <li>• Allow microphone access when prompted</li>
                                    <li>• Speak naturally and clearly</li>
                                    <li>• The interview will take approximately {interview.duration_minutes} minutes</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        /* Interview in Progress */
                        <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                            {/* Voice Visualizer */}
                            <div className="w-full lg:w-2/5 text-center space-y-8">
                                <VoiceVisualizer speakingState={speakingState} />

                                <div className="flex gap-3 justify-center">
                                    <Button
                                        onClick={handleStopInterview}
                                        variant="destructive"
                                        size="lg"
                                        className="hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        End Interview
                                    </Button>
                                </div>
                            </div>

                            {/* Transcript */}
                            <div className="w-full lg:w-3/5">
                                <TranscriptDisplay
                                    transcript={transcript}
                                    className="lg:h-[500px] h-64"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isPhoneDialogOpen} onOpenChange={setIsPhoneDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter your phone number</DialogTitle>
                        <DialogDescription>
                            We'll call you to conduct the interview over the phone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                                Phone
                            </Label>
                            <Input
                                id="phone"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+1234567890"
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleCallSubmit} disabled={isCreatingSession}>
                            {isCreatingSession ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Setting up...
                                </>
                            ) : (
                                'Call Me'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
