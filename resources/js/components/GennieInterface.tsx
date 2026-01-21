import { useState, useEffect } from 'react'
import { useDeepgramAgent, type AgentConfig } from '@/hooks/useDeepgramAgent'
import { VoiceVisualizer } from '@/components/VoiceVisualizer'
import { TranscriptDisplay } from '@/components/TranscriptDisplay'
import { Button } from '@/components/ui/button'
import { Globe, Phone, X } from 'lucide-react'
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

interface GennieInterfaceProps {
    sessionId: string
    onClose: () => void
}

export function GennieInterface({ sessionId, onClose }: GennieInterfaceProps) {
    const [agentConfig, setAgentConfig] = useState<AgentConfig>({})
    const [isLoading, setIsLoading] = useState(true)
    const [isCalling, setIsCalling] = useState(false)
    const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState('')

    // Fetch session data
    useEffect(() => {
        fetch(`/api/sessions/${sessionId}/context`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAgentConfig({
                        sessionId,
                        jobDescription: data.context || '',
                        resume: '',
                        jobTitle: data.metadata?.job_title || 'Candidate',
                        companyName: data.metadata?.company_name || 'Generic Company',
                        // Interview-specific configuration
                        interviewType: data.interview?.interview_type || 'screening',
                        difficultyLevel: data.interview?.difficulty_level || 'mid',
                        customInstructions: data.interview?.custom_instructions || '',
                        durationMinutes: data.interview?.duration_minutes || 15,
                        // AI model configuration
                        sttModel: data.metadata?.stt_model || 'nova-2',
                        voiceId: data.metadata?.voice_id || 'aura-asteria-en',
                    })
                }
            })
            .catch(err => console.error("Failed to load session", err))
            .finally(() => setIsLoading(false))
    }, [sessionId])

    const {
        speakingState,
        transcript,
        startConversation,
        stopConversation,
        isConnected,
    } = useDeepgramAgent(agentConfig.sessionId ? agentConfig : undefined)

    const handleCallSubmit = async () => {
        if (!phoneNumber) {
            alert('Please enter a phone number')
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading interview session...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with close button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Gennie Interview</h2>
                    <p className="text-muted-foreground">
                        {isConnected ? 'Interview in progress' : 'Ready to start your interview'}
                    </p>
                </div>
                {!isConnected && (
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4 mr-2" />
                        Back to Setup
                    </Button>
                )}
            </div>

            {!isConnected ? (
                /* Ready to Start */
                <div className="max-w-md mx-auto text-center space-y-8">
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
                            onClick={() => setIsPhoneDialogOpen(true)}
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
                /* Interview in Progress */
                <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                    {/* Voice Visualizer */}
                    <div className="w-full lg:w-2/5 text-center space-y-8">
                        <VoiceVisualizer speakingState={speakingState} />

                        <div className="flex gap-3 justify-center">
                            <Button
                                onClick={stopConversation}
                                variant="destructive"
                                size="lg"
                                className="hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Stop Interview
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

            <Dialog open={isPhoneDialogOpen} onOpenChange={setIsPhoneDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter your phone number</DialogTitle>
                        <DialogDescription>
                            Gennie will call you at this number to start the interview.
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
                        <Button type="submit" onClick={handleCallSubmit}>Call Me</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
