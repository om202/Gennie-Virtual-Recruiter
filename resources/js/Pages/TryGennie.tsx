import { Head, Link, router } from '@inertiajs/react'
import { useState, useEffect, useCallback } from 'react'
import { useDeepgramAgent, type AgentConfig } from '@/hooks/useDeepgramAgent'
import { VoiceVisualizer } from '@/components/VoiceVisualizer'
import { TranscriptDisplay } from '@/components/TranscriptDisplay'
import { Button } from '@/components/ui/button'
import { Globe, Phone, ArrowLeft, Loader2 } from 'lucide-react'
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

// Demo job description - pre-loaded for instant try
const DEMO_JOB_DESCRIPTION = `We are looking for a passionate Software Engineer to join our team.

Requirements:
- 3+ years of experience in software development
- Proficiency in JavaScript/TypeScript and React
- Experience with Node.js and REST APIs
- Strong problem-solving skills
- Excellent communication abilities

Responsibilities:
- Design and implement new features
- Write clean, maintainable code
- Collaborate with cross-functional teams
- Participate in code reviews`

const DEMO_RESUME = `John Doe - Software Engineer

Experience:
- 4 years at StartupXYZ as Full Stack Developer
- Built scalable web applications using React and Node.js
- Led team of 3 developers on mobile app project

Skills:
- JavaScript, TypeScript, Python
- React, Next.js, Node.js
- PostgreSQL, MongoDB
- AWS, Docker

Education:
- BS Computer Science, State University`

export default function TryGennie() {
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [isCreatingSession, setIsCreatingSession] = useState(false)
    const [isCalling, setIsCalling] = useState(false)
    const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState('')
    const [hasEnded, setHasEnded] = useState(false)

    // Create initial config (without sessionId initially)
    const getAgentConfig = useCallback((): AgentConfig => ({
        sessionId: sessionId || undefined,
        jobTitle: 'Software Engineer',
        companyName: 'TechCorp Inc.',
        jobDescription: DEMO_JOB_DESCRIPTION,
        resume: DEMO_RESUME,
    }), [sessionId])

    const {
        speakingState,
        transcript,
        startConversation: startDeepgramConversation,
        stopConversation: stopDeepgramConversation,
        isConnected,
        connectionState,
    } = useDeepgramAgent(getAgentConfig())

    // Create a session in the database
    const createSession = async (): Promise<string> => {
        setIsCreatingSession(true)
        try {
            // Create session
            const sessionRes = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    metadata: {
                        job_title: 'Software Engineer',
                        company_name: 'TechCorp Inc.',
                        source: 'try-gennie',
                    }
                })
            })
            const sessionData = await sessionRes.json()
            const newSessionId = sessionData.session.id

            // Add job description
            await fetch(`/api/sessions/${newSessionId}/jd`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: DEMO_JOB_DESCRIPTION })
            })

            // Add resume
            await fetch(`/api/sessions/${newSessionId}/resume`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: DEMO_RESUME })
            })

            // Start the session
            await fetch(`/api/sessions/${newSessionId}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_title: 'Software Engineer',
                    company_name: 'TechCorp Inc.'
                })
            })

            setSessionId(newSessionId)
            return newSessionId
        } finally {
            setIsCreatingSession(false)
        }
    }

    // Start conversation with session creation
    const handleStartInterview = async () => {
        try {
            // Create session first
            await createSession()

            // Update sessionId in state, then start conversation
            // Note: We need to wait for the state to update, so we use setTimeout
            setTimeout(() => {
                startDeepgramConversation()
            }, 100)
        } catch (error) {
            console.error('Failed to create session:', error)
            alert('Failed to start interview. Please try again.')
        }
    }

    // Handle stop and redirect to results
    const handleStopInterview = async () => {
        setHasEnded(true)
        await stopDeepgramConversation()

        // Give time for upload to complete, then redirect
        setTimeout(() => {
            if (sessionId) {
                router.visit(`/try-gennie/${sessionId}`)
            }
        }, 2000)
    }

    // Watch for interview end (when AI ends it)
    useEffect(() => {
        if (connectionState === 'idle' && sessionId && transcript.length > 0 && !hasEnded) {
            // Interview ended (either by AI or user)
            setHasEnded(true)
            // Give time for recording upload, then redirect
            setTimeout(() => {
                router.visit(`/try-gennie/${sessionId}`)
            }, 3000)
        }
    }, [connectionState, sessionId, transcript.length, hasEnded])

    const handleCallSubmit = async () => {
        if (!phoneNumber) {
            alert('Please enter a phone number')
            return
        }

        // Create session first for phone call
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
                alert('Calling your phone... After the call ends, you will see your results.')
                // For phone interviews, redirect after a delay
                // The user will complete the call, then can visit the results page
                router.visit(`/try-gennie/${newSessionId}`)
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
                <title>Try Gennie - Experience AI Voice Interviewing | Free Demo</title>
                <meta
                    name="description"
                    content="Experience the future of recruitment. Talk to Gennie, our AI virtual recruiter. Free interactive demo of voice-powered candidate screening and automated interviews - no signup required."
                />
                <meta
                    name="keywords"
                    content="AI interview demo, voice AI recruiter demo, try AI recruiting, automated interview experience, conversational AI hiring, free AI recruiter demo"
                />
            </Head>

            <div className="bg-muted/50 text-foreground min-h-screen flex flex-col p-4">
                {/* Header */}
                <div className="w-full max-w-6xl mx-auto mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Home
                            </Button>
                        </Link>
                    </div>

                    {/* Sign in Banner */}
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left">
                            <p className="font-semibold text-primary">Want the full experience?</p>
                            <p className="text-sm text-muted-foreground">Sign in to customize interviews with your own job descriptions.</p>
                        </div>
                        <a href="/dashboard">
                            <Button size="lg">Sign in with Google</Button>
                        </a>
                    </div>

                    <div className="text-center space-y-2">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
                            Try Gennie
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground">
                            Experience AI-powered interviewing - no signup required
                        </p>
                        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                            This demo uses a sample Software Engineer role. Your interview will be recorded and analyzed.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex items-start justify-center pt-4">
                    {!isConnected ? (
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
                                            Setting up...
                                        </>
                                    ) : (
                                        <>
                                            <Globe className="h-5 w-5 mr-2" />
                                            Start Demo Interview
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

                            {/* Demo Info */}
                            <div className="bg-card border rounded-lg p-4 text-left space-y-2">
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                    Demo Interview
                                </h3>
                                <div className="space-y-1 text-sm">
                                    <p><strong>Role:</strong> Software Engineer</p>
                                    <p><strong>Company:</strong> TechCorp Inc.</p>
                                    <p className="text-muted-foreground text-xs pt-2">
                                        Gennie will conduct a brief screening interview. After it ends, you'll see your full assessment report.
                                    </p>
                                </div>
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
                                        disabled={hasEnded}
                                    >
                                        {hasEnded ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Stop Interview'
                                        )}
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
                            Gennie will call you at this number to start the demo interview.
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
