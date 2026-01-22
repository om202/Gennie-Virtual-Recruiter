import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient, AgentEvents } from '@deepgram/sdk'
import type { ConnectionState, SpeakingState, TranscriptMessage } from '@/types'
import {
    generateGreeting,
    generatePrompt,
    type InterviewConfig
} from '@/shared/interviewConfig'

interface UseDeepgramAgentReturn {
    connectionState: ConnectionState
    speakingState: SpeakingState
    transcript: TranscriptMessage[]
    statusText: string
    startConversation: () => Promise<void>
    stopConversation: () => void
    isConnected: boolean
}

export interface AgentConfig extends InterviewConfig {
    sessionId?: string
}

export function useDeepgramAgent(config?: AgentConfig): UseDeepgramAgentReturn {
    const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
    const [speakingState, setSpeakingState] = useState<SpeakingState>('idle')
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([])
    const [statusText, setStatusText] = useState('Ready to Connect...')

    const connectionRef = useRef<any>(null)
    const audioProcessorRef = useRef<any>(null)
    const playbackAudioCtxRef = useRef<AudioContext | null>(null)
    const nextPlayTimeRef = useRef<number>(0)
    const configRef = useRef<AgentConfig | undefined>(config)

    // Recording Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const recordingChunksRef = useRef<Blob[]>([])
    const recordingDestRef = useRef<MediaStreamAudioDestinationNode | null>(null)

    // Keep configRef up to date
    configRef.current = config

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
            // Create recording destination immediately so AI audio is captured from first chunk
            recordingDestRef.current = playbackAudioCtxRef.current.createMediaStreamDestination()
            console.log('🎤 Recording destination created for AI audio capture')
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

            if (recordingDestRef.current) {
                source.connect(recordingDestRef.current)
                console.log('🔊 AI audio connected to recording destination')
            } else {
                console.warn('⚠️ Recording destination not available for AI audio')
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

            // Load AudioWorklet processor
            await audioContext.audioWorklet.addModule('/audio-processor.js')

            const source = audioContext.createMediaStreamSource(stream)
            const workletNode = new AudioWorkletNode(audioContext, 'audio-capture-processor')

            audioProcessorRef.current = { audioContext, workletNode, stream, source }

            // Listen for audio data from the worklet
            workletNode.port.onmessage = (event: MessageEvent) => {
                if (connectionRef.current && connectionRef.current.getReadyState && connectionRef.current.getReadyState() === 1) {
                    connectionRef.current.send(event.data)
                }
            }

            source.connect(workletNode)
            workletNode.connect(audioContext.destination)

            // --- Initialize Recording ---
            try {
                // Ensure playback context exists to capture agent audio
                if (!playbackAudioCtxRef.current) {
                    playbackAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
                        sampleRate: SAMPLE_RATE
                    })
                    nextPlayTimeRef.current = playbackAudioCtxRef.current.currentTime
                }

                // Create destination for mixed audio if not exists
                if (!recordingDestRef.current) {
                    recordingDestRef.current = playbackAudioCtxRef.current.createMediaStreamDestination()
                }

                // Connect user microphone to the SAME recording destination as AI audio
                // This properly mixes both audio sources at the AudioContext level
                const micSourceForRecording = playbackAudioCtxRef.current.createMediaStreamSource(stream)
                micSourceForRecording.connect(recordingDestRef.current)

                console.log(`📼 Recording Mixer Setup:`)
                console.log(`  - User mic connected to recording destination`)
                console.log(`  - AI audio already connected to same destination`)
                console.log(`  - Output tracks: ${recordingDestRef.current.stream.getAudioTracks().length}`)

                const mimeType = [
                    'audio/webm;codecs=opus',
                    'audio/webm',
                    'audio/mp4',
                    ''
                ].find(type => type === '' || MediaRecorder.isTypeSupported(type)) || ''

                console.log(`🎙️ Initializing recorder with mimeType: ${mimeType || 'default'}`)

                // Record the mixed output from the destination (contains both mic + AI)
                const recorder = new MediaRecorder(recordingDestRef.current.stream, mimeType ? { mimeType } : undefined)
                mediaRecorderRef.current = recorder
                recordingChunksRef.current = []

                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        recordingChunksRef.current.push(e.data)
                    }
                }

                recorder.start()
                console.log('🎙️ Call recording started (mixed audio)')

            } catch (recErr: any) {
                console.error('Failed to start recording:', recErr)
                addTranscript('system', `Warning: Call recording failed to start (${recErr.message})`)
            }
            // -----------------------------

        } catch (err) {
            console.error('Microphone error:', err)
            addTranscript('system', 'Error: Could not access microphone')
        }
    }, [addTranscript])

    // Shared function to stop and upload recording
    const stopAndUploadRecording = useCallback(async () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
            return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
            setStatusText('Uploading Recording...')

            mediaRecorderRef.current!.onstop = async () => {
                const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'
                const blob = new Blob(recordingChunksRef.current, { type: mimeType })

                if (configRef.current?.sessionId && blob.size > 0) {
                    try {
                        console.log(`Uploading recording... (${blob.size} bytes, type: ${mimeType})`)
                        const formData = new FormData()
                        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
                        formData.append('file', blob, `recording.${ext}`)
                        formData.append('duration', '0')

                        await fetch(`/api/sessions/${configRef.current.sessionId}/upload-recording`, {
                            method: 'POST',
                            body: formData
                        })
                        console.log('✅ Recording uploaded successfully')
                        addTranscript('system', 'Interview recording saved.')
                    } catch (uploadErr) {
                        console.error('Failed to upload recording:', uploadErr)
                        addTranscript('system', 'Error saving interview recording.')
                    }
                }
                setStatusText('Interview Complete')
                resolve();
            }

            mediaRecorderRef.current!.stop()
        });
    }, [addTranscript])

    const stopMicrophone = useCallback(() => {
        if (audioProcessorRef.current) {
            audioProcessorRef.current.workletNode.disconnect()
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

                const currentConfig = configRef.current
                console.log('Current config:', currentConfig)

                // Use shared greeting generator
                const greeting = generateGreeting(currentConfig)

                // Configure STT options - Per Deepgram docs: smart_format and keyterms go inside provider
                const sttConfig = currentConfig?.sttConfig
                const selectedModel = currentConfig?.sttModel || 'flux-general-en'
                const isFlux = selectedModel.startsWith('flux')

                const listenConfig: any = {
                    provider: {
                        type: 'deepgram',
                        model: selectedModel,
                        // Flux requires version: v2, and cannot use smart_format
                        ...(isFlux ? { version: 'v2' } : { smart_format: sttConfig?.smartFormat ?? false }),
                    },
                }

                // Add keyterms if provided (note: "keyterms" not "keywords" per API spec)
                // keyterms only works with nova-3 'en'
                if (sttConfig?.keywords && sttConfig.keywords.length > 0 && !isFlux) {
                    listenConfig.provider.keyterms = sttConfig.keywords
                }

                connection.configure({
                    audio: {
                        input: { encoding: 'linear16', sample_rate: 16000 },
                        output: { encoding: 'linear16', sample_rate: 16000, container: 'none' },
                    },
                    agent: {
                        language: 'en',
                        greeting,
                        listen: listenConfig,
                        think: {
                            provider: { type: 'open_ai', model: 'gpt-4o-mini' },
                            prompt: generatePrompt(currentConfig),
                            functions: [
                                {
                                    name: 'get_context',
                                    description: 'Retrieves specific information from the company knowledge base associated with this interview. Use this tool immediately when the candidate asks questions about the company, culture, benefits, or specific role details that are not in your system prompt.',
                                    parameters: {
                                        type: 'object',
                                        properties: {
                                            query: { type: 'string', description: 'The specific question or topic to search for in the knowledge base.' },
                                        },
                                        required: ['query'],
                                    },
                                },
                                {
                                    name: 'get_current_time',
                                    description: 'Get the current local time of the interview. Use this if the candidate asks about the time or if you need to timestamp a specific event.',
                                    parameters: {
                                        type: 'object',
                                        properties: {},
                                    },
                                },
                                {
                                    name: 'update_interview_progress',
                                    description: 'Mark a required question as COMPLETED. Call this immediately after the candidate provides a satisfactory answer to one of the mandatory questions in your instructions. Do not call this if the answer was vague or incomplete.',
                                    parameters: {
                                        type: 'object',
                                        properties: {
                                            question_text: { type: 'string', description: 'The exact text of the required question that was answered.' },
                                            status: { type: 'string', enum: ['completed', 'skipped'], description: "Status of the question." },
                                        },
                                        required: ['question_text', 'status'],
                                    },
                                },
                                {
                                    name: 'end_interview',
                                    description: 'Ends the interview session. Call this tool ONLY in these cases: 1) You have asked all your planned questions and the candidate has no further questions. 2) The candidate explicitly asks to stop or end the interview. 3) The candidate says a definitive goodbye. IMPORTANT: Always be polite and thank the candidate before calling this tool.',
                                    parameters: {
                                        type: 'object',
                                        properties: {
                                            reason: { type: 'string', description: "The reason for ending the interview. Allowed values: 'screening_complete', 'candidate_request', 'goodbye', 'time_limit_reached'." },
                                            summary: { type: 'string', description: 'A concise summary (1-2 sentences) of how the interview went.' },
                                        },
                                        required: ['reason'],
                                    },
                                },
                            ],
                        },
                        speak: {
                            provider: { type: 'deepgram', model: currentConfig?.voiceId || 'aura-asteria-en' },
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

            connection.on(AgentEvents.ConversationText, async (data: any) => {
                if (data.role && data.content) {
                    addTranscript(data.role, data.content)

                    // Log to Backend for Persistence
                    if (configRef.current?.sessionId) {
                        try {
                            await fetch(`/api/sessions/${configRef.current.sessionId}/log`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    speaker: data.role === 'user' ? 'candidate' : 'agent', // Normalize roles
                                    message: data.content,
                                    metadata: { timestamp: Date.now() }
                                })
                            });
                        } catch (e) {
                            console.error('Failed to log conversation:', e);
                        }
                    }
                }
            })

            connection.on(AgentEvents.FunctionCallRequest, async (data: any) => {
                console.log('Function call request:', data)

                // The event data has a `functions` array with each function call
                const functions = data.functions || []

                for (const func of functions) {
                    const { id: functionCallId, name: functionName, arguments: argsString } = func

                    // Parse the arguments JSON string
                    let input: Record<string, any> = {}
                    try {
                        input = JSON.parse(argsString || '{}')
                    } catch (parseErr) {
                        console.error('Failed to parse function arguments:', parseErr)
                    }

                    console.log(`Processing function: ${functionName}, id: ${functionCallId}, input:`, input)

                    if (functionName === 'get_context') {
                        addTranscript('system', `Searching knowledge base for "${input?.query}"...`)
                        try {
                            const apiRes = await fetch('/api/agent/context', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ query: input?.query }),
                            })
                            const apiData = await apiRes.json()

                            console.log('Sending function call response:', {
                                id: functionCallId,
                                name: functionName,
                                content: apiData.context || 'No context found.',
                            })

                            connection.functionCallResponse({
                                id: functionCallId,
                                name: functionName,
                                content: apiData.context || 'No context found.',
                            })
                        } catch (err) {
                            console.error('Error calling backend tool:', err)
                            connection.functionCallResponse({
                                id: functionCallId,
                                name: functionName,
                                content: 'Error retrieving context.',
                            })
                        }
                    } else if (functionName === 'end_interview') {
                        // Handle interview termination
                        console.log('🔴 AI requested to end interview:', {
                            reason: input?.reason,
                            summary: input?.summary,
                        })

                        // Notify backend to end session
                        if (configRef.current?.sessionId) {
                            try {
                                await fetch(`/api/sessions/${configRef.current.sessionId}/end`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ reason: input?.reason || 'ai_ended' })
                                });
                            } catch (e) {
                                console.error('Failed to update session status on backend:', e);
                            }
                        }

                        addTranscript('system', `Interview ending: ${input?.reason || 'complete'}`)

                        // Acknowledge the function call
                        connection.functionCallResponse({
                            id: functionCallId,
                            name: functionName,
                            content: 'Interview ended successfully. Goodbye!',
                        })

                        // Give the AI time to say goodbye, then disconnect
                        setTimeout(async () => {
                            console.log('Disconnecting after AI goodbye...')

                            // Stop and upload recording before cleanup
                            await stopAndUploadRecording()

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
                            setStatusText('Interview Complete')
                            addTranscript('system', input?.summary || 'Interview concluded')
                        }, 5000)
                    } else if (functionName === 'get_current_time') {
                        const now = new Date().toLocaleTimeString();
                        console.log('Sending time:', now);
                        addTranscript('system', `Provided time to agent: ${now}`);

                        connection.functionCallResponse({
                            id: functionCallId,
                            name: functionName,
                            content: `The current time is ${now}.`,
                        });

                    } else if (functionName === 'update_interview_progress') {
                        console.log('Updating interview progress:', input);
                        addTranscript('system', `Marked question as done: "${input?.question_text}"`);

                        if (configRef.current?.sessionId) {
                            fetch(`/api/sessions/${configRef.current.sessionId}/progress`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    action: 'mark_question_complete',
                                    payload: input
                                })
                            }).catch(err => console.error('Failed to save progress:', err));
                        }

                        connection.functionCallResponse({
                            id: functionCallId,
                            name: functionName,
                            content: `Progress saved. Question "${input?.question_text}" marked as ${input?.status}. Proceed to the next question.`,
                        });

                    } else {
                        // Unknown function - respond with error to not leave it hanging
                        console.warn(`Unknown function called: ${functionName}`)
                        connection.functionCallResponse({
                            id: functionCallId,
                            name: functionName,
                            content: 'Function not implemented.',
                        })
                    }
                }
            })

            connection.on(AgentEvents.Audio, (audioData: any) => {
                playAudio(audioData)
            })

            connection.on(AgentEvents.Unhandled, (data: any) => {
                console.log('Unhandled agent event:', data)
            })
        } catch (error: any) {
            console.error('Connection error:', error)
            setConnectionState('error')
            setStatusText('Failed to connect')
            addTranscript('system', `Failed to connect: ${error.message}`)
        }
    }, [startMicrophone, stopMicrophone, addTranscript, playAudio])

    const stopConversation = useCallback(async () => {
        console.log('Stopping conversation...')

        // Stop and upload recording
        await stopAndUploadRecording()
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            setStatusText('Uploading Recording...')

            // Handle Upload on Stop
            mediaRecorderRef.current.onstop = async () => {
                const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'
                const blob = new Blob(recordingChunksRef.current, { type: mimeType })
                if (configRef.current?.sessionId && blob.size > 0) {
                    try {
                        console.log('Uploading recording...', blob.size, 'bytes')
                        const formData = new FormData()
                        formData.append('file', blob, 'recording.webm')

                        // Calculate duration
                        // We can estimate duration from chunks or just let backend handle/metadata
                        // Ideally we pass duration logic here but keeping it simple
                        formData.append('duration', '0') // Optional: Calculate real duration

                        await fetch(`/api/sessions/${configRef.current.sessionId}/upload-recording`, {
                            method: 'POST',
                            body: formData
                        })
                        console.log('✅ Recording uploaded successfully')
                        addTranscript('system', 'Interview recording saved.')
                    } catch (uploadErr) {
                        console.error('Failed to upload recording:', uploadErr)
                        addTranscript('system', 'Error saving interview recording.')
                    }
                }
                setStatusText('Interview Complete') // Reset status after upload logic
            }
            mediaRecorderRef.current.stop()
        } else {
            setStatusText('Interview Complete')
        }

        // Notify backend to end session
        if (configRef.current?.sessionId) {
            fetch(`/api/sessions/${configRef.current.sessionId}/end`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'user_ended' })
            }).catch(e => console.error('Failed to update session status on backend:', e));
        }

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
        // setStatusText('Ready to Connect...') // Moved inside upload callback to show uploading status
        addTranscript('system', 'Interview stopped by user')
    }, [stopMicrophone, stopAndUploadRecording, addTranscript])

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
                    audioProcessorRef.current.workletNode.disconnect()
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
