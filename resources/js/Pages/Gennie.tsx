import { Head, Link } from '@inertiajs/react'
import { useState } from 'react'
import { useDeepgramAgent } from '@/hooks/useDeepgramAgent'
import { VoiceVisualizer } from '@/components/VoiceVisualizer'
import { TranscriptDisplay } from '@/components/TranscriptDisplay'
import { Button } from '@/components/ui/button'
import { Globe, Phone, ArrowLeft } from 'lucide-react'
import type { PageProps } from '@/types'

export default function Gennie({ }: PageProps) {
    const {
        speakingState,
        transcript,
        startConversation,
        stopConversation,
        isConnected,
    } = useDeepgramAgent()

    const [isCalling, setIsCalling] = useState(false)

    const handleCallMe = async () => {
        setIsCalling(true)
        try {
            const res = await fetch('/api/twilio/call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: '+17204870145' })
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
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>

                    <div className="text-center space-y-2">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
                            Gennie - AI Virtual Recruiter
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground">
                            Chat with Gennie via browser or phone call
                        </p>
                        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                            Gennie will guide you through a natural conversation to understand your background, skills, and experience.
                        </p>
                    </div>
                </div>

                {/* Main Content - Centered */}
                <div className="flex-1 flex items-start justify-center pt-8">
                    {!isConnected ? (
                        /* Centered Layout - When Idle */
                        <div className="max-w-md w-full text-center space-y-8">
                            <VoiceVisualizer speakingState={speakingState} />

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
