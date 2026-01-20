import { Head } from '@inertiajs/react'
import { useState } from 'react'
import { useDeepgramAgent } from '@/hooks/useDeepgramAgent'
import { VoiceVisualizer } from '@/components/VoiceVisualizer'
import { TranscriptDisplay } from '@/components/TranscriptDisplay'
import { Button } from '@/components/ui/button'
import type { PageProps } from '@/types'

export default function Gennie({ }: PageProps) {
    const {
        speakingState,
        transcript,
        statusText,
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

            <div className="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-blue-400">
                            Gennie
                        </h1>
                        <p className="text-slate-400">AI Virtual Recruiter</p>
                    </div>

                    <VoiceVisualizer speakingState={speakingState} />

                    <div className="h-8 text-blue-300 font-mono text-sm">
                        {statusText}
                    </div>

                    <div className="flex gap-3">
                        {!isConnected ? (
                            <>
                                <Button
                                    onClick={startConversation}
                                    className="flex-1 py-4 px-6 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Start Interview
                                </Button>
                                <Button
                                    onClick={handleCallMe}
                                    variant="outline"
                                    disabled={isCalling}
                                    className="flex-1 py-4 px-6 hover:scale-[1.02] active:scale-[0.98] border-blue-400 text-blue-400 hover:bg-slate-800"
                                >
                                    {isCalling ? 'Calling...' : 'Call Me'}
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={stopConversation}
                                variant="destructive"
                                className="flex-1 py-4 px-6 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Stop
                            </Button>
                        )}
                    </div>

                    <TranscriptDisplay transcript={transcript} />
                </div>
            </div>
        </>
    )
}
