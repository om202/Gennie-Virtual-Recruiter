import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient, AgentEvents } from '@deepgram/sdk'
import type { ConnectionState, SpeakingState, TranscriptMessage } from '@/types'

interface UseDeepgramAgentReturn {
    connectionState: ConnectionState
    speakingState: SpeakingState
    transcript: TranscriptMessage[]
    statusText: string
    startConversation: () => Promise<void>
    stopConversation: () => void
    isConnected: boolean
}

export function useDeepgramAgent(): UseDeepgramAgentReturn {
    const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
    const [speakingState, setSpeakingState] = useState<SpeakingState>('idle')
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([])
    const [statusText, setStatusText] = useState('Ready to Connect...')

    const connectionRef = useRef<any>(null)
    const audioProcessorRef = useRef<any>(null)
    const playbackAudioCtxRef = useRef<AudioContext | null>(null)
    const nextPlayTimeRef = useRef<number>(0)

    const SAMPLE_RATE = 16000

    const addTranscript = useCallback((role: TranscriptMessage['role'], content: string) => {
        setTranscript(prev => [...prev, { role, content, timestamp: Date.now() }])
    }, [])

    const playAudio = useCallback(async (audioData: any) => {
        if (!playbackAudioCtxRef.current) {
            playbackAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: SAMPLE_RATE
            })
            nextPlayTimeRef.current = playbackAudioCtxRef.current.currentTime
        }

        const ctx = playbackAudioCtxRef.current

        if (ctx.state === 'suspended') {
            await ctx.resume()
            nextPlayTimeRef.current = ctx.currentTime
        }

        try {
            const buffer = audioData instanceof ArrayBuffer ? audioData :
                (audioData.buffer ? audioData.buffer.slice(audioData.byteOffset, audioData.byteOffset + audioData.byteLength) : new Uint8Array(audioData).buffer)

            const int16Array = new Int16Array(buffer)
            const float32Array = new Float32Array(int16Array.length)

            for (let i = 0; i < int16Array.length; i++) {
                float32Array[i] = int16Array[i] / 32768
            }

            const audioBuffer = ctx.createBuffer(1, float32Array.length, SAMPLE_RATE)
            audioBuffer.copyToChannel(float32Array, 0)

            const source = ctx.createBufferSource()
            source.buffer = audioBuffer
            source.connect(ctx.destination)

            const currentTime = ctx.currentTime
            if (nextPlayTimeRef.current < currentTime) {
                nextPlayTimeRef.current = currentTime
            }

            source.start(nextPlayTimeRef.current)
            nextPlayTimeRef.current += audioBuffer.duration
        } catch (error) {
            console.error('Audio playback error:', error)
        }
    }, [])

    const startMicrophone = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            })

            const audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 16000,
            })

            const source = audioContext.createMediaStreamSource(stream)
            const processor = audioContext.createScriptProcessor(4096, 1, 1)

            audioProcessorRef.current = { audioContext, processor, stream, source }

            processor.onaudioprocess = (e: AudioProcessingEvent) => {
                if (connectionRef.current && connectionRef.current.getReadyState && connectionRef.current.getReadyState() === 1) {
                    const inputData = e.inputBuffer.getChannelData(0)
                    const int16Data = new Int16Array(inputData.length)
                    for (let i = 0; i < inputData.length; i++) {
                        int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768))
                    }
                    connectionRef.current.send(int16Data.buffer)
                }
            }

            source.connect(processor)
            processor.connect(audioContext.destination)
        } catch (err) {
            console.error('Microphone error:', err)
            addTranscript('system', 'Error: Could not access microphone')
        }
    }, [addTranscript])

    const stopMicrophone = useCallback(() => {
        if (audioProcessorRef.current) {
            audioProcessorRef.current.processor.disconnect()
            audioProcessorRef.current.audioContext.close()
            audioProcessorRef.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
            audioProcessorRef.current = null
        }
    }, [])

    const startConversation = useCallback(async () => {
        setConnectionState('connecting')
        setStatusText('Initializing Gennie...')

        try {
            const response = await fetch('/gennie/token')
            const data = await response.json()
            const apiKey = data.key

            if (!apiKey) {
                throw new Error('API Key not found')
            }

            const deepgram = createClient(apiKey)
            const connection = deepgram.agent()
            connectionRef.current = connection

            connection.on(AgentEvents.Open, () => {
                console.log('Agent WebSocket Connected')
                setConnectionState('connected')
                setStatusText('Configuring Gennie...')

                connection.configure({
                    audio: {
                        input: { encoding: 'linear16', sample_rate: 16000 },
                        output: { encoding: 'linear16', sample_rate: 16000, container: 'none' },
                    },
                    agent: {
                        language: 'en',
                        greeting: "Hi there! I'm Gennie. I'm excited to learn more about you. Shall we start?",
                        listen: {
                            provider: { type: 'deepgram', model: 'nova-2' },
                        },
                        think: {
                            provider: { type: 'open_ai', model: 'gpt-4o-mini' },
                            prompt: "You are Gennie, a professional and friendly recruiter for a Tech Company. You are screening a candidate for a Senior React Developer role. Ask about their experience, management style, and salary expectations. Keep answers concise. Use the 'get_context' function if you need information about the company benefits or role details. Do not make up info.",
                            functions: [
                                {
                                    name: 'get_context',
                                    description: 'Retrieve information about the company, benefits, or job description.',
                                    parameters: {
                                        type: 'object',
                                        properties: {
                                            query: { type: 'string', description: 'The question or topic to search for.' },
                                        },
                                    },
                                },
                            ],
                        },
                        speak: {
                            provider: { type: 'deepgram', model: 'aura-asteria-en' },
                        },
                    },
                })

                setStatusText('Gennie is listening...')
                setSpeakingState('listening')
                startMicrophone()
            })

            connection.on(AgentEvents.Close, () => {
                console.log('Agent Connection Closed')
                setConnectionState('disconnected')
                setStatusText('Connection Closed')
                setSpeakingState('idle')
                stopMicrophone()
            })

            connection.on(AgentEvents.Error, (error: any) => {
                console.error('Agent Error:', error)
                setConnectionState('error')
                setStatusText('Error occurred')
                addTranscript('system', `Error: ${JSON.stringify(error)}`)
            })

            connection.on(AgentEvents.UserStartedSpeaking, () => {
                setStatusText('User Speaking...')
                setSpeakingState('user_speaking')
            })

            connection.on(AgentEvents.AgentStartedSpeaking, () => {
                setStatusText('Gennie Speaking...')
                setSpeakingState('agent_speaking')
            })

            connection.on(AgentEvents.ConversationText, (data: any) => {
                if (data.role && data.content) {
                    addTranscript(data.role, data.content)
                }
            })

            connection.on(AgentEvents.FunctionCallRequest, async (data: any) => {
                const { function_name, function_call_id, input } = data
                console.log('Function call request:', data)

                if (function_name === 'get_context') {
                    addTranscript('system', `Searching knowledge base for "${input?.query}"...`)
                    try {
                        const apiRes = await fetch('/api/agent/context', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ query: input?.query }),
                        })
                        const apiData = await apiRes.json()

                        connection.functionCallResponse({
                            id: function_call_id,
                            name: function_name,
                            content: apiData.context || 'No context found.',
                        })
                    } catch (err) {
                        connection.functionCallResponse({
                            id: function_call_id,
                            name: function_name,
                            content: 'Error retrieving context.',
                        })
                    }
                }
            })

            connection.on(AgentEvents.Audio, (audioData: any) => {
                playAudio(audioData)
            })

            connection.on(AgentEvents.Unhandled, (data: any) => {
                if (data.type === 'History' && data.role && data.content) {
                    addTranscript(data.role, data.content)
                } else {
                    console.log('Unhandled agent event:', data)
                }
            })
        } catch (error: any) {
            console.error('Connection error:', error)
            setConnectionState('error')
            setStatusText('Failed to connect')
            addTranscript('system', `Failed to connect: ${error.message}`)
        }
    }, [startMicrophone, stopMicrophone, addTranscript, playAudio])

    const stopConversation = useCallback(() => {
        console.log('Stopping conversation...')
        if (connectionRef.current) {
            try {
                connectionRef.current.disconnect()
                connectionRef.current = null
            } catch (error) {
                console.error('Error disconnecting:', error)
            }
        }
        stopMicrophone()
        setConnectionState('idle')
        setSpeakingState('idle')
        setStatusText('Ready to Connect...')
        addTranscript('system', 'Interview stopped by user')
    }, [stopMicrophone, addTranscript])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (connectionRef.current) {
                try {
                    connectionRef.current.disconnect()
                } catch (error) {
                    console.error('Error cleaning up connection:', error)
                }
            }
            if (audioProcessorRef.current) {
                try {
                    audioProcessorRef.current.processor.disconnect()
                    audioProcessorRef.current.audioContext.close()
                    audioProcessorRef.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
                } catch (error) {
                    console.error('Error cleaning up audio:', error)
                }
            }
        }
    }, [])

    return {
        connectionState,
        speakingState,
        transcript,
        statusText,
        startConversation,
        stopConversation,
        isConnected: connectionState === 'connected',
    }
}
