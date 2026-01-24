import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2, Sparkles, Trash2, Plus, AlertCircle, Building2, MapPin, Briefcase } from 'lucide-react'
import {
    getInterviewTemplate,
    type InterviewTemplateType,
    type SttModel,
    type AuraVoice
} from '@/shared/interviewConfig'
import { Link } from '@inertiajs/react'

interface JobDescription {
    id: string
    title: string
    company_name: string
    location: string | null
    remote_type: 'onsite' | 'hybrid' | 'remote'
}

interface Interview {
    id?: string
    job_description_id: string | null
    job_title?: string
    company_name?: string
    job_description?: string | null
    duration_minutes: number
    interview_type: InterviewTemplateType
    difficulty_level: 'mid' | 'entry' | 'senior' | 'executive'
    custom_instructions: string | null
    voice_id?: AuraVoice
    required_questions?: string[]
    metadata?: {
        voice_id?: AuraVoice
        stt_model?: SttModel
        stt_config?: {
            endpointing?: number
            utterance_end_ms?: number
            keywords?: string | string[]
            smart_format?: boolean
        }
        endpointing?: number
        utterance_end_ms?: number
        keywords?: string | string[]
        smart_format?: boolean
        required_questions?: string[]
    }
    jobDescription?: JobDescription
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
    jobDescriptions?: JobDescription[]
}

export function InterviewForm({
    onSuccess,
    onCancel,
    initialData,
    jobDescriptions: initialJobDescriptions,
}: InterviewFormProps) {
    const isEditMode = !!initialData
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [manuallyEdited, setManuallyEdited] = useState(false)
    const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>(initialJobDescriptions || [])
    const [isLoadingJDs, setIsLoadingJDs] = useState(!initialJobDescriptions)

    const [formData, setFormData] = useState({
        job_description_id: initialData?.job_description_id || '',
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

    // Fetch job descriptions on mount if not provided
    useEffect(() => {
        if (!initialJobDescriptions) {
            fetch('/job-descriptions/list')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setJobDescriptions(data.jobDescriptions)
                    }
                })
                .finally(() => setIsLoadingJDs(false))
        }
    }, [initialJobDescriptions])

    // Reset or populate form when initialData changes
    useEffect(() => {
        if (isEditMode && initialData) {
            const sttConfig = initialData.metadata?.stt_config || {}
            const sttModel = initialData.metadata?.stt_model || 'nova-2'

            setFormData({
                job_description_id: initialData.job_description_id || '',
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
            setManuallyEdited(true)
        } else {
            setFormData({
                job_description_id: '',
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
    }, [initialData, isEditMode])

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

    const selectedJD = jobDescriptions.find(jd => jd.id === formData.job_description_id)

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
                response = await window.axios.put(`/interviews/${initialData.id}`, payload)
            } else {
                response = await window.axios.post('/interviews', payload)
            }

            if (response.data.success) {
                onSuccess(response.data.interview)
            }
        } catch (error) {
            console.error('Failed to create/update interview:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const getRemoteTypeLabel = (type: string) => {
        const labels: Record<string, string> = { onsite: 'On-site', hybrid: 'Hybrid', remote: 'Remote' }
        return labels[type] || type
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Section 1: Job Description Selection */}
            <Card className={!formData.job_description_id ? 'border-destructive/50' : ''}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Select Job Description</CardTitle>
                            <CardDescription>Choose the role this interview is for</CardDescription>
                        </div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Required</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoadingJDs ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : jobDescriptions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground mb-4">
                                No job descriptions found. Create one first.
                            </p>
                            <Link href="/job-descriptions/create">
                                <Button type="button">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Job Description
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Select
                                value={formData.job_description_id}
                                onValueChange={(value) => setFormData({ ...formData, job_description_id: value })}
                            >
                                <SelectTrigger className={!formData.job_description_id ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select a job description..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {jobDescriptions.map((jd) => (
                                        <SelectItem key={jd.id} value={jd.id}>
                                            <span className="flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                {jd.title} - {jd.company_name}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {selectedJD && (
                                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{selectedJD.title}</span>
                                        <span className="text-muted-foreground">at {selectedJD.company_name}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        {selectedJD.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {selectedJD.location}
                                            </span>
                                        )}
                                        <Badge variant="outline" className="text-xs">
                                            {getRemoteTypeLabel(selectedJD.remote_type)}
                                        </Badge>
                                    </div>
                                </div>
                            )}

                            {!formData.job_description_id && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    Please select a job description to continue
                                </p>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Section 2: Interview Configuration */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Configuration</CardTitle>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 1</span>
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
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 2</span>
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
                                            placeholder={`Question ${index + 1}`}
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
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 3</span>
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
                <Button
                    type="submit"
                    disabled={!formData.job_description_id || isSubmitting || jobDescriptions.length === 0}
                >
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
