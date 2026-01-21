import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2, Sparkles, Trash2, Plus, Upload, FileText, X, CheckCircle } from 'lucide-react'
import {
    getInterviewTemplate,
    type InterviewTemplateType,
    type SttModel,
    type AuraVoice
} from '@/shared/interviewConfig'

interface Interview {
    id?: string
    job_title: string
    company_name: string
    job_description: string | null
    duration_minutes: number
    interview_type: InterviewTemplateType
    difficulty_level: 'mid' | 'entry' | 'senior' | 'executive'
    custom_instructions: string | null
    metadata?: {
        voice_id?: AuraVoice
        stt_model?: SttModel
        endpointing?: number
        utterance_end_ms?: number
        keywords?: string | string[]
        smart_format?: boolean
        required_questions?: string[]
    }
}

const STT_MODELS: Record<string, string> = {
    'nova-2': 'Nova 2 (Fastest & Accurate)',
    'nova-2-medical': 'Nova 2 Medical',
    'nova-2-meeting': 'Nova 2 Meeting',
    'nova-2-phonecall': 'Nova 2 Phone Call',
    'flux-general-en': 'Flux General (English)',
    'enhanced': 'Enhanced',
    'base': 'Base'
}

const AURA_VOICES: Record<string, string> = {
    'aura-asteria-en': 'Asteria (US Female)',
    'luna-en': 'Luna (US Female)',
    'stella-en': 'Stella (US Female)',
    'athena-en': 'Athena (UK Female)',
    'hera-en': 'Hera (US Female)',
    'orion-en': 'Orion (US Male)',
    'arcas-en': 'Arcas (US Male)',
    'perseus-en': 'Perseus (US Male)',
    'angus-en': 'Angus (Irish Male)',
    'orpheus-en': 'Orpheus (US Male)',
    'helios-en': 'Helios (UK Male)',
    'zeus-en': 'Zeus (US Male)'
}

interface InterviewFormProps {
    defaultCompanyName?: string
    onSuccess: (interview: Interview) => void
    onCancel: () => void
    initialData?: Interview
}

export function InterviewForm({
    defaultCompanyName = '',
    onSuccess,
    onCancel,
    initialData,
}: InterviewFormProps) {
    const isEditMode = !!initialData
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [manuallyEdited, setManuallyEdited] = useState(false)
    const [isLoadingJD, setIsLoadingJD] = useState(false)
    const [jdFilename, setJdFilename] = useState<string | null>(null)
    const jdInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        job_title: initialData?.job_title || '',
        company_name: initialData?.company_name || defaultCompanyName,
        job_description: initialData?.job_description || '',
        duration_minutes: initialData?.duration_minutes?.toString() || '15',
        interview_type: initialData?.interview_type || 'screening' as InterviewTemplateType,
        difficulty_level: initialData?.difficulty_level || 'mid' as 'entry' | 'mid' | 'senior' | 'executive',
        custom_instructions: initialData?.custom_instructions || '',
        stt_model: initialData?.metadata?.stt_model || 'flux-general-en' as SttModel,
        voice_id: initialData?.metadata?.voice_id || 'aura-asteria-en' as AuraVoice,
        endpointing: initialData?.metadata?.endpointing || 300,
        utterance_end_ms: initialData?.metadata?.utterance_end_ms || 1000,
        smart_format: initialData?.metadata?.smart_format ?? true,
        keywords: Array.isArray(initialData?.metadata?.keywords) ? initialData.metadata.keywords.join(', ') : '',
        required_questions: Array.isArray(initialData?.metadata?.required_questions) && initialData.metadata.required_questions.length > 0
            ? initialData.metadata.required_questions
            : [''],
    })

    const handleFileUpload = async (file: File) => {
        setIsLoadingJD(true)
        try {
            const uploadData = new FormData()
            uploadData.append('file', file)

            const res = await fetch('/api/documents/parse', {
                method: 'POST',
                body: uploadData,
            })

            const data = await res.json()
            if (data.success) {
                setFormData(prev => ({ ...prev, job_description: data.text }))
                setJdFilename(data.filename)
            } else {
                console.error('Failed to parse JD:', data.error)
                // Optionally show error toast
            }
        } catch (error) {
            console.error('Upload failed:', error)
        } finally {
            setIsLoadingJD(false)
        }
    }

    // Reset or populate form when initialData changes
    useEffect(() => {
        if (isEditMode && initialData) {
            // Parse metadata for STT config
            const sttConfig = initialData.metadata?.stt_config || {}
            const sttModel = initialData.metadata?.stt_model || 'nova-2'

            setFormData({
                job_title: initialData.job_title || '',
                company_name: initialData.company_name || defaultCompanyName,
                job_description: initialData.job_description || '',
                duration_minutes: String(initialData.duration_minutes || '15'),
                interview_type: initialData.interview_type || 'screening',
                difficulty_level: initialData.difficulty_level || 'mid',
                custom_instructions: initialData.custom_instructions || '',
                stt_model: sttModel,
                voice_id: initialData.voice_id || 'aura-asteria-en',
                endpointing: sttConfig.endpointing || 300,
                utterance_end_ms: sttConfig.utterance_end_ms || 1000,
                smart_format: sttConfig.smart_format ?? true,
                keywords: Array.isArray(sttConfig.keywords) ? sttConfig.keywords.join(', ') : '',
                required_questions: Array.isArray(initialData.required_questions) && initialData.required_questions.length > 0
                    ? initialData.required_questions
                    : [''],
            })
            setManuallyEdited(true) // Don't auto-overwrite custom instructions in edit mode
        } else {
            // Reset to defaults for create mode
            setFormData({
                job_title: '',
                company_name: defaultCompanyName,
                job_description: '',
                duration_minutes: '15',
                interview_type: 'screening',
                difficulty_level: 'mid',
                custom_instructions: '',
                stt_model: 'flux-general-en',
                voice_id: 'aura-asteria-en',
                endpointing: 300,
                utterance_end_ms: 1000,
                smart_format: true,
                keywords: '',
                required_questions: [''],
            })
            setManuallyEdited(false)
        }
    }, [initialData, isEditMode, defaultCompanyName])

    // Auto-populate custom instructions when interview type or difficulty changes
    useEffect(() => {
        if (!manuallyEdited) {
            const template = getInterviewTemplate(
                formData.interview_type,
                formData.difficulty_level
            )
            setFormData(prev => ({ ...prev, custom_instructions: template }))
        }
    }, [formData.interview_type, formData.difficulty_level, manuallyEdited])

    const handleAddQuestion = () => {
        setFormData(prev => ({ ...prev, required_questions: [...prev.required_questions, ''] }))
    }

    const handleRemoveQuestion = (index: number) => {
        setFormData(prev => ({
            ...prev,
            required_questions: prev.required_questions.filter((_, i) => i !== index)
        }))
    }

    const handleQuestionChange = (index: number, value: string) => {
        const newQuestions = [...formData.required_questions]
        newQuestions[index] = value
        setFormData(prev => ({ ...prev, required_questions: newQuestions }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const payload = {
                ...formData,
                duration_minutes: parseInt(formData.duration_minutes),
                keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
                required_questions: formData.required_questions.filter(q => q.trim() !== ''),
            }

            let response
            if (isEditMode) {
                response = await window.axios.put(`/ interviews / ${initialData.id} `, payload)
            } else {
                response = await window.axios.post('/interviews', payload)
            }

            if (response.data.success) {
                onSuccess(response.data.interview)
                // Reset form handled by parent or unmount
            }
        } catch (error) {
            console.error('Failed to create/update interview:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Section 1: Role Details */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Role Details</CardTitle>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 1</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="job_title">
                                Job Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="job_title"
                                placeholder="e.g., Senior React Developer"
                                value={formData.job_title}
                                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company_name">Company Name</Label>
                            <Input
                                id="company_name"
                                placeholder="Your company"
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="job_description">Job Description</Label>
                            {isLoadingJD ? (
                                <span className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Parsing file...
                                </span>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => jdInputRef.current?.click()}
                                    >
                                        <Upload className="h-3 w-3 mr-2" />
                                        Upload File
                                    </Button>
                                    <input
                                        ref={jdInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.txt"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleFileUpload(file)
                                            // Reset input
                                            e.target.value = ''
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {jdFilename && (
                            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded w-fit">
                                <CheckCircle className="h-3 w-3" />
                                Imported from: {jdFilename}
                                <button type="button" onClick={() => setJdFilename(null)} className="ml-2 hover:text-green-800">
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}

                        <div className="relative">
                            <Textarea
                                id="job_description"
                                placeholder="Paste the job description here or upload a file..."
                                className="min-h-[150px] font-normal"
                                value={formData.job_description}
                                onChange={(e) => {
                                    setFormData({ ...formData, job_description: e.target.value })
                                    if (jdFilename) setJdFilename(null) // Clear filename if manually edited
                                }}
                            />
                            {isLoadingJD && (
                                <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-[1px] rounded-md transition-all">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                        <p className="text-[13px] text-muted-foreground">
                            Gennie will use this to generate relevant questions.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Section 2: Interview Configuration */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Configuration</CardTitle>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 2</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>Interview Type</Label>
                            <Select
                                value={formData.interview_type}
                                onValueChange={(value: string) => setFormData({ ...formData, interview_type: value as InterviewTemplateType })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="screening">Screening</SelectItem>
                                    <SelectItem value="technical">Technical</SelectItem>
                                    <SelectItem value="behavioral">Behavioral</SelectItem>
                                    <SelectItem value="final">Final</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Difficulty</Label>
                            <Select
                                value={formData.difficulty_level}
                                onValueChange={(value: string) => setFormData({ ...formData, difficulty_level: value as 'entry' | 'mid' | 'senior' | 'executive' })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="entry">Entry Level</SelectItem>
                                    <SelectItem value="mid">Mid Level</SelectItem>
                                    <SelectItem value="senior">Senior</SelectItem>
                                    <SelectItem value="executive">Executive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Duration</Label>
                            <Select
                                value={formData.duration_minutes}
                                onValueChange={(value: string) => setFormData({ ...formData, duration_minutes: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="45">45 minutes</SelectItem>
                                    <SelectItem value="60">60 minutes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 3: Interview Guide */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Interview Guide</CardTitle>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 3</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                Required Questions
                                <span className="text-xs text-muted-foreground font-normal">(Questions Gennie MUST ask)</span>
                            </Label>
                            <div className="space-y-2">
                                {formData.required_questions.map((question, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={question}
                                            onChange={(e) => handleQuestionChange(index, e.target.value)}
                                            placeholder={`Question ${index + 1} `}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveQuestion(index)}
                                            disabled={formData.required_questions.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={handleAddQuestion}>
                                    <Plus className="h-3 w-3 mr-2" />
                                    Add Question
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="custom_instructions" className="flex items-center gap-2">
                                Custom Instructions
                                <Sparkles className="h-3 w-3 text-primary" />
                                <span className="text-xs text-muted-foreground font-normal">(Auto-filled based on type)</span>
                            </Label>
                            <Textarea
                                id="custom_instructions"
                                placeholder="Custom instructions will auto-populate when you select interview type and difficulty..."
                                className="min-h-[200px] font-mono text-sm"
                                value={formData.custom_instructions}
                                onChange={(e) => {
                                    setFormData({ ...formData, custom_instructions: e.target.value })
                                    setManuallyEdited(true)
                                }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 4: AI & Audio */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>AI Configuration</CardTitle>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 4</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>AI Voice</Label>
                            <Select
                                value={formData.voice_id}
                                onValueChange={(value: string) => setFormData({ ...formData, voice_id: value as AuraVoice })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {Object.entries(AURA_VOICES).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>STT Model</Label>
                            <Select
                                value={formData.stt_model}
                                onValueChange={(value: string) => setFormData({ ...formData, stt_model: value as SttModel })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(STT_MODELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="advanced-stt" className="border-none">
                            <AccordionTrigger className="text-sm font-medium hover:no-underline py-2">
                                <span className="flex items-center text-muted-foreground">Advanced STT Settings</span>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4 px-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="endpointing">
                                            Pause Detection (ms)
                                        </Label>
                                        <Input
                                            id="endpointing"
                                            type="number"
                                            min="10"
                                            max="5000"
                                            value={formData.endpointing}
                                            onChange={(e) => setFormData({ ...formData, endpointing: parseInt(e.target.value) || 300 })}
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            How long to wait after silence to process speech. (Default: 300ms)
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="utterance_end_ms">
                                            Utterance End (ms)
                                        </Label>
                                        <Input
                                            id="utterance_end_ms"
                                            type="number"
                                            min="500"
                                            max="5000"
                                            value={formData.utterance_end_ms}
                                            onChange={(e) => setFormData({ ...formData, utterance_end_ms: parseInt(e.target.value) || 1000 })}
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            Gap duration to detect end of turn. (Default: 1000ms)
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="keywords">Keywords to Boost</Label>
                                    <Input
                                        id="keywords"
                                        placeholder="e.g. React, Laravel, Kubernetes (comma separated)"
                                        value={formData.keywords}
                                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                        id="smart_format"
                                        checked={formData.smart_format}
                                        onCheckedChange={(checked) => setFormData({ ...formData, smart_format: checked })}
                                    />
                                    <Label htmlFor="smart_format">Enable Smart Formatting (Dates, Times, Currency)</Label>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="bg-background">
                    Cancel
                </Button>
                <Button type="submit" disabled={!formData.job_title.trim() || isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {isEditMode ? 'Saving...' : 'Creating...'}
                        </>
                    ) : (
                        isEditMode ? 'Save Changes' : 'Create Interview'
                    )}
                </Button>
            </div>
        </form>
    )
}
