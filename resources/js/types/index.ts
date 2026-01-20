export interface PageProps {
    auth?: {
        user?: {
            id: number
            name: string
            email: string
        }
    }
}

export interface TranscriptMessage {
    role: 'user' | 'agent' | 'system'
    content: string
    timestamp?: number
}

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'

export type SpeakingState = 'idle' | 'listening' | 'user_speaking' | 'agent_speaking'
