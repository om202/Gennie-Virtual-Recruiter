import { Head, Link } from '@inertiajs/react'
import { useState, useCallback, useEffect } from 'react'
import { useDeepgramAgent, type AgentConfig } from '@/hooks/useDeepgramAgent'
import { VoiceVisualizer } from '@/components/VoiceVisualizer'
import { TranscriptDisplay } from '@/components/TranscriptDisplay'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Globe, Phone, Clock, User, Loader2, Eye, ArrowLeft, Copy, Check } from 'lucide-react'
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
import { Badge } from "@/components/ui/badge"
import { MarkdownViewer, DEFAULT_CANDIDATE_INSTRUCTIONS } from "@/components/MarkdownEditor"

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

export default function PublicInterview({ interview, candidate, token, error, isSelfPreview, type }: Props) {
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

    // Generic Candidate Info State
    const [candidateName, setCandidateName] = useState('')
    const [candidateEmail, setCandidateEmail] = useState('')
    const [candidatePhone, setCandidatePhone] = useState('')
    const [isCandidateInfoDialogOpen, setIsCandidateInfoDialogOpen] = useState(false)

    // Create a session via the public API
    const createSession = async (): Promise<string> => {
        setIsCreatingSession(true)
        try {
            const res = await fetch(`/public/start/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: candidateName,
                    email: candidateEmail,
                    phone: candidatePhone,
                }),
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
        // If generic interview, require candidate info first
        if (type === 'interview' && !isSelfPreview) {
            setIsCandidateInfoDialogOpen(true)
            return
        }

        await startSessionProcess()
    }

    const startSessionProcess = async () => {
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

    const handleCandidateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!candidateName.trim() || !candidateEmail.trim()) {
            alert('Please provide your Name and Email to start the interview.')
            return
        }

        setIsCandidateInfoDialogOpen(false)
        await startSessionProcess()
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

        /* ... existing call submit logic ... */
        // We need to bypass the generic check or handle it if we want phone calls to also collect info
        // For now assuming existing logic where createSession uses current state

        let newSessionId: string;
        try {
            newSessionId = await createSession()
        } catch (e) {
            alert('Failed to create session')
            return
        }

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

            <div className="bg-muted/50 text-foreground min-h-screen flex flex-col p-4 pb-16">
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
                                        <h3 className="font-semibold text-lg">Organizer Preview Mode</h3>
                                        <p className="text-muted-foreground">
                                            You are viewing this interview as the organizer. Calls will be marked as "Self Preview".
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopyUrl}
                                        className="gap-2"
                                    >
                                        {urlCopied ? (
                                            <>
                                                <Check className="h-4 w-4 text-green-500" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4" />
                                                Copy Public Link
                                            </>
                                        )}
                                    </Button>
                                    <Link href="/interviews">
                                        <Button variant="outline" size="sm">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Back to Dashboard
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <header className="flex items-center justify-between mb-8 max-w-6xl mx-auto w-full">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                            <Globe className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-lg">{interview.company_name}</span>
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full space-y-8">
                    {/* Header Info */}
                    <div className="text-center space-y-4">
                        <Badge variant="outline" className="px-3 py-1">
                            {interview.interview_type.charAt(0).toUpperCase() + interview.interview_type.slice(1)} Interview
                        </Badge>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            {interview.job_title}
                        </h1>

                        {candidate && (
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>{candidate.name}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-2">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>~{interview.duration_minutes} Minutes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span>Online Now</span>
                            </div>
                        </div>
                    </div>

                    {hasEnded ? (
                        /* Ended State */
                        <Card className="w-full max-w-md mx-auto text-center p-8">
                            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Interview Completed</h2>
                            <p className="text-muted-foreground mb-6">
                                Thank you for your time. Your response has been recorded and will be reviewed by the hiring team.
                            </p>
                            <Button onClick={() => window.location.reload()} variant="outline">
                                Start New Session
                            </Button>
                        </Card>
                    ) : !isConnected ? (
                        /* Ready to Start - Single Column Layout */
                        <div className="w-full max-w-2xl flex flex-col items-center space-y-8">

                            {/* Top: Start Controls */}
                            <VoiceVisualizer speakingState={speakingState} />

                            {/* Action Buttons */}
                            <div className="flex gap-3 w-full max-w-sm">
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

                            {/* Bottom: Instructions */}
                            <div className="text-left w-full">
                                <MarkdownViewer content={interview.candidate_instructions || DEFAULT_CANDIDATE_INSTRUCTIONS} />
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
                </main>
            </div>

            {/* Candidate Info Dialog */}
            <Dialog open={isCandidateInfoDialogOpen} onOpenChange={setIsCandidateInfoDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Details Required</DialogTitle>
                        <DialogDescription>
                            Please provide your details to start the interview.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCandidateSubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="name"
                                placeholder="Jane Doe"
                                value={candidateName}
                                onChange={(e) => setCandidateName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="jane@example.com"
                                value={candidateEmail}
                                onChange={(e) => setCandidateEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={candidatePhone}
                                onChange={(e) => setCandidatePhone(e.target.value)}
                            />
                        </div>

                        <DialogFooter className="mt-6">
                            <Button type="submit" disabled={isCreatingSession}>
                                {isCreatingSession ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Starting...
                                    </>
                                ) : (
                                    'Begin Interview'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Phone Call Dialog */}
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
