import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { FileText, Upload, ClipboardPaste, X, CheckCircle, Loader2 } from 'lucide-react'

interface InterviewSetupProps {
    onComplete: (sessionId: string, context: { jd: string; resume: string; jobTitle: string; companyName: string }) => void
}

interface DocumentState {
    text: string
    filename?: string
    isLoading: boolean
    error?: string
}

export function InterviewSetup({ onComplete }: InterviewSetupProps) {
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [jd, setJd] = useState<DocumentState>({ text: '', isLoading: false })
    const [resume, setResume] = useState<DocumentState>({ text: '', isLoading: false })
    const [jobTitle, setJobTitle] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [pasteDialogOpen, setPasteDialogOpen] = useState(false)
    const [pasteTarget, setPasteTarget] = useState<'jd' | 'resume'>('jd')
    const [pasteText, setPasteText] = useState('')
    const [isStarting, setIsStarting] = useState(false)

    const jdInputRef = useRef<HTMLInputElement>(null)
    const resumeInputRef = useRef<HTMLInputElement>(null)

    // Create session on first interaction
    const ensureSession = async () => {
        if (sessionId) return sessionId

        const res = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ metadata: {} }),
        })
        const data = await res.json()
        if (data.success) {
            setSessionId(data.session.id)
            return data.session.id
        }
        throw new Error('Failed to create session')
    }

    // Handle file upload
    const handleFileUpload = async (
        file: File,
        type: 'jd' | 'resume',
        setState: React.Dispatch<React.SetStateAction<DocumentState>>
    ) => {
        setState(prev => ({ ...prev, isLoading: true, error: undefined }))

        try {
            const sid = await ensureSession()
            const formData = new FormData()
            formData.append('file', file)

            const endpoint = type === 'jd' ? 'jd' : 'resume'
            const res = await fetch(`/api/sessions/${sid}/${endpoint}`, {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()
            if (data.success) {
                setState({
                    text: data.session[type === 'jd' ? 'job_description' : 'resume'] || '',
                    filename: file.name,
                    isLoading: false,
                })
            } else {
                setState(prev => ({ ...prev, isLoading: false, error: data.error }))
            }
        } catch (error: any) {
            setState(prev => ({ ...prev, isLoading: false, error: error.message }))
        }
    }

    // Handle paste submission
    const handlePasteSubmit = async () => {
        if (!pasteText.trim()) return

        const setState = pasteTarget === 'jd' ? setJd : setResume
        setState(prev => ({ ...prev, isLoading: true, error: undefined }))

        try {
            const sid = await ensureSession()
            const endpoint = pasteTarget === 'jd' ? 'jd' : 'resume'
            const res = await fetch(`/api/sessions/${sid}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: pasteText }),
            })

            const data = await res.json()
            if (data.success) {
                setState({
                    text: pasteText,
                    isLoading: false,
                })
                setPasteDialogOpen(false)
                setPasteText('')
            } else {
                setState(prev => ({ ...prev, isLoading: false, error: data.error }))
            }
        } catch (error: any) {
            setState(prev => ({ ...prev, isLoading: false, error: error.message }))
        }
    }

    // Open paste dialog
    const openPasteDialog = (target: 'jd' | 'resume') => {
        setPasteTarget(target)
        setPasteText('')
        setPasteDialogOpen(true)
    }

    // Clear document
    const clearDocument = (type: 'jd' | 'resume') => {
        if (type === 'jd') {
            setJd({ text: '', isLoading: false })
        } else {
            setResume({ text: '', isLoading: false })
        }
    }

    // Start interview
    const handleStart = async () => {
        if (!jd.text) return

        setIsStarting(true)
        try {
            const sid = await ensureSession()
            const res = await fetch(`/api/sessions/${sid}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_title: jobTitle,
                    company_name: companyName,
                }),
            })

            const data = await res.json()
            if (data.success) {
                onComplete(sid, { jd: jd.text, resume: resume.text, jobTitle, companyName })
            }
        } catch (error) {
            console.error('Failed to start interview:', error)
        } finally {
            setIsStarting(false)
        }
    }

    const DocumentCard = ({
        title,
        description,
        state,
        type,
        inputRef,
    }: {
        title: string
        description: string
        state: DocumentState
        type: 'jd' | 'resume'
        inputRef: React.RefObject<HTMLInputElement>
    }) => (
        <Card className="p-6 space-y-4">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        {title}
                        {type === 'jd' && <span className="text-destructive">*</span>}
                    </h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                {state.text && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => clearDocument(type)}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {state.isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : state.text ? (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        {state.filename ? `Uploaded: ${state.filename}` : 'Text added'}
                    </div>
                    <div className="bg-muted/50 p-3 rounded-md max-h-32 overflow-y-auto">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                            {state.text.substring(0, 300)}...
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => inputRef.current?.click()}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => openPasteDialog(type)}
                    >
                        <ClipboardPaste className="h-4 w-4 mr-2" />
                        Paste Text
                    </Button>
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                                handleFileUpload(file, type, type === 'jd' ? setJd : setResume)
                            }
                        }}
                    />
                </div>
            )}

            {state.error && (
                <p className="text-sm text-destructive">{state.error}</p>
            )}
        </Card>
    )

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Interview Setup</h2>
                <p className="text-muted-foreground">
                    Add a job description and optionally a candidate resume to customize the interview
                </p>
            </div>

            {/* Job Title and Company Name */}
            <Card className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title <span className="text-destructive">*</span></Label>
                        <Input
                            id="jobTitle"
                            placeholder="e.g. Senior React Developer"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name <span className="text-destructive">*</span></Label>
                        <Input
                            id="companyName"
                            placeholder="e.g. Acme Corporation"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            <DocumentCard
                title="Job Description"
                description="Upload or paste the job description. Gennie will frame questions based on this."
                state={jd}
                type="jd"
                inputRef={jdInputRef as React.RefObject<HTMLInputElement>}
            />

            <DocumentCard
                title="Candidate Resume"
                description="Optional. Add a resume to personalize the conversation."
                state={resume}
                type="resume"
                inputRef={resumeInputRef as React.RefObject<HTMLInputElement>}
            />

            <Button
                size="lg"
                className="w-full"
                disabled={!jd.text || !jobTitle.trim() || !companyName.trim() || isStarting}
                onClick={handleStart}
            >
                {isStarting ? (
                    <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Starting Interview...
                    </>
                ) : (
                    'Start Interview →'
                )}
            </Button>

            {/* Paste Dialog */}
            <Dialog open={pasteDialogOpen} onOpenChange={setPasteDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            Paste {pasteTarget === 'jd' ? 'Job Description' : 'Resume'}
                        </DialogTitle>
                        <DialogDescription>
                            Paste the {pasteTarget === 'jd' ? 'job description' : 'resume'} text below.
                            You can copy from any source.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            value={pasteText}
                            onChange={(e) => setPasteText(e.target.value)}
                            placeholder={`Paste ${pasteTarget === 'jd' ? 'job description' : 'resume'} here...`}
                            className="min-h-[300px] resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            {pasteText.length} characters (minimum 50 required)
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPasteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePasteSubmit}
                            disabled={pasteText.length < 50}
                        >
                            Add {pasteTarget === 'jd' ? 'Job Description' : 'Resume'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
