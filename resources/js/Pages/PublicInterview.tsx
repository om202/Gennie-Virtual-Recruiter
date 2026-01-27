import { Head } from '@inertiajs/react'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useDeepgramAgent, type AgentConfig } from '@/hooks/useDeepgramAgent'
import { VoiceVisualizer } from '@/components/VoiceVisualizer'
import { TranscriptDisplay } from '@/components/TranscriptDisplay'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BackButton } from '@/components/BackButton'
import { Globe, Phone, Clock, User, Loader2, Eye, Copy, Check, Timer, CalendarClock, Hourglass, CheckCircle, XCircle, Mail, KeyRound } from 'lucide-react'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MarkdownViewer, DEFAULT_CANDIDATE_INSTRUCTIONS } from "@/components/MarkdownEditor"
import { getInterviewTypeColor } from '@/lib/badgeColors'

interface Interview {
    id: string
    job_title: string
    company_name: string
    duration_minutes: number
    interview_type: string
    difficulty_level: string
    candidate_instructions?: string | null
    job_description?: string | null
    required_questions?: string[]
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
    // Access status for scheduled interviews
    accessStatus?: 'too_early' | 'accessible' | 'expired' | 'completed' | 'cancelled' | 'in_progress'
    windowOpensAt?: string
    candidateName?: string
    interviewTitle?: string
    companyName?: string
    durationMinutes?: number
}

export default function PublicInterview({
    interview,
    candidate,
    token,
    error,
    isSelfPreview,
    type,
    accessStatus,
    windowOpensAt,
    candidateName: propCandidateName,
    interviewTitle,
    companyName: propCompanyName,
    scheduledAt
}: Props) {
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [isCreatingSession, setIsCreatingSession] = useState(false)
    const [isCalling, setIsCalling] = useState(false)
    const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState('')
    const [hasEnded, setHasEnded] = useState(false)
    const [interviewData, setInterviewData] = useState<{ job_description?: string } | null>(null)
    const [urlCopied, setUrlCopied] = useState(false)
    const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'error'>('idle')
    const [callError, setCallError] = useState<string | null>(null)

    // OTP verification state for scheduled interviews
    const [otpStep, setOtpStep] = useState<'request' | 'verify' | 'verified'>(type === 'scheduled' ? 'request' : 'verified')
    const [otpCode, setOtpCode] = useState('')
    const [otpEmail, setOtpEmail] = useState('')
    const [otpLoading, setOtpLoading] = useState(false)
    const [otpError, setOtpError] = useState<string | null>(null)

    // Interview timer state
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Generic Candidate Info State - must be before any returns
    const [candidateName, setCandidateName] = useState('')
    const [candidateEmail, setCandidateEmail] = useState('')
    const [candidatePhone, setCandidatePhone] = useState('')
    const [isCandidateInfoDialogOpen, setIsCandidateInfoDialogOpen] = useState(false)

    // Agent config - must be before any returns
    const getAgentConfig = useCallback((): AgentConfig => ({
        sessionId: sessionId || undefined,
        jobTitle: interview?.job_title || '',
        companyName: interview?.company_name || '',
        jobDescription: interviewData?.job_description || '',
        resume: '',
        interviewType: (interview?.interview_type || 'screening') as AgentConfig['interviewType'],
        difficultyLevel: (interview?.difficulty_level || 'medium') as AgentConfig['difficultyLevel'],
        durationMinutes: interview?.duration_minutes || 30,
        requiredQuestions: interview?.required_questions || [],
    }), [sessionId, interview, interviewData])

    // Deepgram agent hook - must be before any returns
    const {
        speakingState,
        transcript,
        startConversation: startDeepgramConversation,
        stopConversation: stopDeepgramConversation,
        isConnected,
        connectionState,
    } = useDeepgramAgent(getAgentConfig())

    // Watch for interview end - must be before any returns
    useEffect(() => {
        if (connectionState === 'idle' && sessionId && transcript.length > 0 && !hasEnded) {
            setHasEnded(true)
        }
    }, [connectionState, sessionId, transcript.length, hasEnded])

    // Start timer when interview begins - must be before any returns
    useEffect(() => {
        if (isConnected && interview && timeRemaining === null) {
            setTimeRemaining(interview.duration_minutes * 60)
        }
    }, [isConnected, interview, timeRemaining])

    // Countdown timer - must be before any returns
    useEffect(() => {
        if (isConnected && timeRemaining !== null && timeRemaining > 0) {
            timerIntervalRef.current = setInterval(() => {
                setTimeRemaining(prev => (prev !== null && prev > 0) ? prev - 1 : 0)
            }, 1000)
        }

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current)
            }
        }
    }, [isConnected, timeRemaining !== null])

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleCopyUrl = async () => {
        await navigator.clipboard.writeText(window.location.href)
        setUrlCopied(true)
        setTimeout(() => setUrlCopied(false), 2000)
    }

    // Access status states for scheduled interviews
    if (accessStatus && accessStatus !== 'accessible' && accessStatus !== 'in_progress') {
        const statusConfig = {
            too_early: {
                icon: CalendarClock,
                iconBg: 'bg-warning/10',
                iconColor: 'text-warning',
                title: 'Interview Not Yet Available',
                description: `Your interview window opens 5 minutes before the scheduled time.`,
            },
            expired: {
                icon: Hourglass,
                iconBg: 'bg-muted',
                iconColor: 'text-muted-foreground',
                title: 'Interview Window Closed',
                description: 'The access window for this interview has passed. Please contact the recruiter if you need to reschedule.',
            },
            completed: {
                icon: CheckCircle,
                iconBg: 'bg-success/10',
                iconColor: 'text-success',
                title: 'Interview Completed',
                description: 'This interview has already been completed. Thank you for your participation!',
            },
            cancelled: {
                icon: XCircle,
                iconBg: 'bg-destructive/10',
                iconColor: 'text-destructive',
                title: 'Interview Cancelled',
                description: 'This interview has been cancelled. Please contact the recruiter for more information.',
            },
        }

        const config = statusConfig[accessStatus]
        const StatusIcon = config.icon
        const scheduledDate = scheduledAt ? new Date(scheduledAt) : null
        const windowOpensDate = windowOpensAt ? new Date(windowOpensAt) : null

        return (
            <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
                <Head title={config.title} />

                <Card className="w-full max-w-md">
                    {/* Icon Header */}
                    <div className="pt-8 pb-2 flex justify-center">
                        <div className={`h-16 w-16 ${config.iconBg} rounded-full flex items-center justify-center`}>
                            <StatusIcon className={`h-8 w-8 ${config.iconColor}`} />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="px-6 pb-6 text-center space-y-3">
                        <h1 className="text-2xl font-bold">{config.title}</h1>

                        {interviewTitle && propCompanyName && (
                            <p className="text-base font-medium">
                                {interviewTitle} at {propCompanyName}
                            </p>
                        )}

                        {propCandidateName && (
                            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                                <User className="h-4 w-4" />
                                <span>{propCandidateName}</span>
                            </div>
                        )}

                        <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>

                    {/* Schedule Details for "too_early" */}
                    {accessStatus === 'too_early' && scheduledDate && (
                        <div className="border-t px-6 py-5 bg-muted/30">
                            <div className="text-center space-y-1">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Scheduled for</p>
                                <p className="text-base font-medium">
                                    {scheduledDate.toLocaleDateString(undefined, {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                <p className="text-lg font-semibold text-primary">
                                    {scheduledDate.toLocaleTimeString(undefined, {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZoneName: 'short'
                                    })}
                                </p>
                                {windowOpensDate && (
                                    <p className="text-xs text-muted-foreground pt-2">
                                        You can join starting at {windowOpensDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
                                    </p>
                                )}
                            </div>

                            {/* Access window reminder */}
                            <div className="mt-4 pt-3 border-t border-border/50">
                                <p className="text-xs text-muted-foreground text-center">
                                    <span className="font-medium">Please be on time.</span> Access closes 10 minutes after the scheduled time.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Footer Action */}
                    <div className="border-t px-6 py-4 flex justify-center">
                        <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                            Refresh Page
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    // Error state (legacy fallback)
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

    // OTP verification handlers
    const handleRequestOtp = async () => {
        setOtpLoading(true)
        setOtpError(null)

        try {
            const res = await fetch(`/s/otp/request/${token}`, { method: 'POST' })
            const data = await res.json()

            if (data.success) {
                setOtpEmail(data.email)
                setOtpStep('verify')
            } else {
                setOtpError(data.error || 'Failed to send access code')
            }
        } catch {
            setOtpError('Network error. Please try again.')
        } finally {
            setOtpLoading(false)
        }
    }

    const handleVerifyOtp = async () => {
        if (otpCode.length !== 6) {
            setOtpError('Please enter a 6-digit code')
            return
        }

        setOtpLoading(true)
        setOtpError(null)

        try {
            const res = await fetch(`/s/otp/verify/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: otpCode })
            })
            const data = await res.json()

            if (data.success) {
                setOtpStep('verified')
            } else {
                setOtpError(data.error || 'Invalid code')
            }
        } catch {
            setOtpError('Network error. Please try again.')
        } finally {
            setOtpLoading(false)
        }
    }

    // OTP verification screens for scheduled interviews
    if (type === 'scheduled' && otpStep !== 'verified') {
        return (
            <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
                <Head title="Verify Your Identity" />

                <Card className="w-full max-w-md">
                    {/* Icon Header */}
                    <div className="pt-8 pb-2 flex justify-center">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                            {otpStep === 'request' ? (
                                <Mail className="h-8 w-8 text-primary" />
                            ) : (
                                <KeyRound className="h-8 w-8 text-primary" />
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="px-6 pb-6 text-center space-y-3">
                        <h1 className="text-2xl font-bold">
                            {otpStep === 'request' ? 'Ready to Start' : 'Enter Access Code'}
                        </h1>

                        <p className="text-base font-medium">
                            {interview.job_title} at {interview.company_name}
                        </p>

                        {candidate && (
                            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                                <User className="h-4 w-4" />
                                <span>{candidate.name}</span>
                            </div>
                        )}

                        <p className="text-sm text-muted-foreground">
                            {otpStep === 'request'
                                ? 'To verify your identity, we\'ll send a one-time access code to your email address on file.'
                                : `We sent a 6-digit code to ${otpEmail}. Enter it below to continue.`
                            }
                        </p>
                    </div>

                    {/* OTP Input (verify step) */}
                    {otpStep === 'verify' && (
                        <div className="px-6 pb-4">
                            <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                placeholder="000000"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="text-center text-2xl tracking-widest font-mono"
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Error Message */}
                    {otpError && (
                        <div className="px-6 pb-4">
                            <p className="text-sm text-destructive text-center">{otpError}</p>
                        </div>
                    )}

                    {/* Spam folder reminder */}
                    {otpStep === 'verify' && (
                        <div className="px-6 pb-4">
                            <p className="text-xs text-muted-foreground text-center">
                                Don't see it? Check your spam or junk folder.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="border-t px-6 py-4 space-y-3">
                        {otpStep === 'request' ? (
                            <Button
                                onClick={handleRequestOtp}
                                disabled={otpLoading}
                                className="w-full"
                            >
                                {otpLoading ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                                ) : (
                                    <><Mail className="h-4 w-4 mr-2" /> Send Access Code</>
                                )}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={handleVerifyOtp}
                                    disabled={otpLoading || otpCode.length !== 6}
                                    className="w-full"
                                >
                                    {otpLoading ? (
                                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</>
                                    ) : (
                                        'Verify & Continue'
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRequestOtp}
                                    disabled={otpLoading}
                                    className="w-full text-muted-foreground"
                                >
                                    Resend Code
                                </Button>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        )
    }

    // Hooks already moved to top of component

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

    // Hooks moved to top of component

    const handleCallSubmit = async () => {
        if (!phoneNumber) {
            alert('Please enter a phone number')
            return
        }

        // For generic interviews, require candidate info
        if (type === 'interview' && !isSelfPreview) {
            if (!candidateName.trim() || !candidateEmail.trim()) {
                alert('Please provide your Name and Email to proceed.')
                return
            }
        }

        let newSessionId: string;
        try {
            newSessionId = await createSession()
        } catch (e) {
            alert('Failed to create session')
            return
        }

        setIsPhoneDialogOpen(false)
        setIsCalling(true)
        setCallStatus('calling')
        setCallError(null)
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
                // Call initiated successfully - UI will show calling state
            } else {
                setCallStatus('error')
                setCallError(data.error || 'Failed to initiate call')
            }
        } catch (error) {
            console.error(error)
            setCallStatus('error')
            setCallError('Error initiating call. Please try again.')
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
                {/* Powered by Gennie */}
                <header className="w-full mt-6 mb-10">
                    <a href="/" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <span className="text-sm">Powered by</span>
                        <img src="/gennie.png" alt="Gennie" className="h-6 w-6 object-contain" />
                        <span className="font-semibold text-sm text-primary">Gennie Talent</span>
                    </a>
                </header>

                {/* Self Preview Banner */}
                {isSelfPreview && (
                    <div className="w-full max-w-6xl mx-auto mb-6">
                        <div className="bg-card border rounded-xl p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-warning/10 rounded-lg">
                                        <Eye className="h-5 w-5 text-warning" />
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
                                                <Check className="h-4 w-4 text-success" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4" />
                                                Copy Public Link
                                            </>
                                        )}
                                    </Button>
                                    <BackButton fallback="/dashboard" label="Back" variant="outline" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full space-y-8">
                    {/* Header Info */}
                    <div className="text-center space-y-4">
                        <Badge variant="outline" className={`px-3 py-1 ${getInterviewTypeColor(interview.interview_type)}`}>
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
                                <span>~{interview.duration_minutes} Minutes • {interview.company_name}</span>
                            </div>
                        </div>
                    </div>

                    {callStatus === 'calling' ? (
                        /* Call in Progress State */
                        <Card className="w-full max-w-md mx-auto text-center p-8">
                            <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <Phone className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Calling You Now...</h2>
                            <p className="text-muted-foreground mb-4">
                                Please answer your phone when it rings.<br />
                                The interview will begin once you pick up.
                            </p>
                            <p className="text-sm text-muted-foreground font-mono">
                                {phoneNumber}
                            </p>
                            <Button
                                onClick={() => {
                                    setCallStatus('idle')
                                    window.location.reload()
                                }}
                                variant="outline"
                                className="mt-6"
                            >
                                Cancel & Start Over
                            </Button>
                        </Card>
                    ) : callStatus === 'error' ? (
                        /* Call Error State */
                        <Card className="w-full max-w-md mx-auto text-center p-8">
                            <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
                                <Phone className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Call Failed</h2>
                            <p className="text-muted-foreground mb-6">
                                {callError || 'Something went wrong. Please try again.'}
                            </p>
                            <Button onClick={() => {
                                setCallStatus('idle')
                                setIsPhoneDialogOpen(true)
                            }}>
                                Try Again
                            </Button>
                        </Card>
                    ) : hasEnded ? (
                        /* Ended State */
                        <Card className="w-full max-w-md mx-auto text-center p-8">
                            <div className="h-16 w-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
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
                                    variant="outlinePrimary"
                                    size="lg"
                                    disabled={isCalling || isLoading}
                                    className="flex-1 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Phone className="h-5 w-5 mr-2" />
                                    {isCalling ? 'Calling...' : 'Call Me'}
                                </Button>
                            </div>

                            {/* Bottom: Instructions & Job Description Tabs */}
                            <div className="text-left w-full">
                                {interview.job_description ? (
                                    <Tabs defaultValue="instructions" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="instructions">Candidate Instructions</TabsTrigger>
                                            <TabsTrigger value="job-description">Job Description</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="instructions" className="mt-4">
                                            <MarkdownViewer content={interview.candidate_instructions || DEFAULT_CANDIDATE_INSTRUCTIONS} />
                                        </TabsContent>
                                        <TabsContent value="job-description" className="mt-4">
                                            <MarkdownViewer content={interview.job_description} />
                                        </TabsContent>
                                    </Tabs>
                                ) : (
                                    <MarkdownViewer content={interview.candidate_instructions || DEFAULT_CANDIDATE_INSTRUCTIONS} />
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Interview in Progress */
                        <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                            {/* Voice Visualizer */}
                            <div className="w-full lg:w-2/5 text-center space-y-8">
                                {/* Interview Timer */}
                                {timeRemaining !== null && (
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg ${timeRemaining <= 120
                                        ? 'bg-destructive/10 text-destructive animate-pulse'
                                        : timeRemaining <= 300
                                            ? 'bg-warning/10 text-warning'
                                            : 'bg-muted text-muted-foreground'
                                        }`}>
                                        <Timer className="h-5 w-5" />
                                        <span>{formatTime(timeRemaining)}</span>
                                        <span className="text-sm font-normal">remaining</span>
                                    </div>
                                )}

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
                        <DialogTitle>Call Me for Interview</DialogTitle>
                        <DialogDescription>
                            We'll call you to conduct the interview over the phone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Show candidate info fields for generic interviews (not scheduled, not self-preview) */}
                        {type === 'interview' && !isSelfPreview && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="phone-name">Full Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="phone-name"
                                        placeholder="Jane Doe"
                                        value={candidateName}
                                        onChange={(e) => setCandidateName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone-email">Email Address <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="phone-email"
                                        type="email"
                                        placeholder="jane@example.com"
                                        value={candidateEmail}
                                        onChange={(e) => setCandidateEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="phone-number">Phone Number <span className="text-destructive">*</span></Label>
                            <Input
                                id="phone-number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+1234567890"
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
