import { Head, Link } from '@inertiajs/react'
import { useState } from 'react'
import { useDeepgramAgent, type AgentConfig } from '@/hooks/useDeepgramAgent'
import { VoiceVisualizer } from '@/components/VoiceVisualizer'
import { TranscriptDisplay } from '@/components/TranscriptDisplay'
import { InterviewSetup } from '@/components/InterviewSetup'
import { Button } from '@/components/ui/button'
import { Globe, Phone, ArrowLeft, Settings } from 'lucide-react'
import type { PageProps } from '@/types'

export default function Gennie({ }: PageProps) {
    // Setup state
    const [setupComplete, setSetupComplete] = useState(false)
    const [agentConfig, setAgentConfig] = useState<AgentConfig>({})

    const {
        speakingState,
        transcript,
        startConversation,
        stopConversation,
        isConnected,
    } = useDeepgramAgent(setupComplete ? agentConfig : undefined)

    const [isCalling, setIsCalling] = useState(false)

    const handleSetupComplete = (sessionId: string, context: { jd: string; resume: string; jobTitle: string; companyName: string }) => {
        setAgentConfig({
            sessionId,
            jobDescription: context.jd,
            resume: context.resume,
            jobTitle: context.jobTitle,
            companyName: context.companyName,
        })
        setSetupComplete(true)
    }

    const handleResetSetup = () => {
        setSetupComplete(false)
        setAgentConfig({})
    }

    const handleCallMe = async () => {
        setIsCalling(true)
        try {
            const res = await fetch('/api/twilio/call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: '+17204870145',
                    session_id: agentConfig.sessionId
                })
            })
            const data = await res.json()
            if (data.success) {
                alert('Calling your phone...')
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

    return (
        <>
            <Head>
                <title>Gennie - AI Virtual Recruiter</title>
                <meta
                    name="description"
                    content="Experience AI-powered voice recruitment with Gennie, your intelligent virtual recruiter."
                />
                <meta property="og:title" content="Gennie - AI Virtual Recruiter" />
                <meta property="og:type" content="website" />
                <meta
                    property="og:description"
                    content="Experience AI-powered voice recruitment with Gennie"
                />
            </Head>

            <div className="bg-muted/50 text-foreground min-h-screen flex flex-col p-4">
                {/* Header Section - Always Visible */}
                <div className="w-full max-w-6xl mx-auto mb-2">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Home
                            </Button>
                        </Link>
                        {setupComplete && !isConnected && (
                            <Button variant="outline" size="sm" onClick={handleResetSetup}>
                                <Settings className="h-4 w-4 mr-2" />
                                Change Setup
                            </Button>
                        )}
                    </div>

                    <div className="text-center space-y-2">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
                            Gennie - AI Virtual Recruiter
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground">
                            {setupComplete
                                ? 'Ready to start your customized interview'
                                : 'Set up your interview with a job description'}
                        </p>
                        {!setupComplete && (
                            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                                Upload or paste a job description to customize Gennie's questions.
                                Add a candidate resume for personalized interviews.
                            </p>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex items-start justify-center pt-8">
                    {!setupComplete ? (
                        /* Setup Step */
                        <InterviewSetup onComplete={handleSetupComplete} />
                    ) : !isConnected ? (
                        /* Ready to Start - After Setup */
                        <div className="max-w-md w-full text-center space-y-8">
                            <VoiceVisualizer speakingState={speakingState} />

                            {/* Setup Summary */}
                            <div className="bg-card border rounded-lg p-4 text-left space-y-2">
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                    Interview Configuration
                                </h3>
                                <div className="space-y-1 text-sm">
                                    <p className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span>
                                        Job Description loaded
                                    </p>
                                    {agentConfig.resume && (
                                        <p className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            Candidate Resume loaded
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={startConversation}
                                    size="lg"
                                    className="flex-1 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Globe className="h-5 w-5 mr-2" />
                                    Start Interview
                                </Button>
                                <Button
                                    onClick={handleCallMe}
                                    variant="outline"
                                    size="lg"
                                    disabled={isCalling}
                                    className="flex-1 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Phone className="h-5 w-5 mr-2" />
                                    {isCalling ? 'Calling...' : 'Call Me'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* Side-by-Side Layout - When Call in Progress */
                        <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                            {/* Main Content - Left Side */}
                            <div className="w-full lg:w-2/5 text-center space-y-8">
                                <VoiceVisualizer speakingState={speakingState} />

                                <div className="flex gap-3 justify-center">
                                    <Button
                                        onClick={stopConversation}
                                        variant="destructive"
                                        size="lg"
                                        className="hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Stop
                                    </Button>
                                </div>
                            </div>

                            {/* Transcript - Right Side on Desktop */}
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
        </>
    )
}
