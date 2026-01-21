import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2, Sparkles, Trash2, Plus } from 'lucide-react'
import {
    getInterviewTemplate,
    type InterviewTemplateType,
    STT_MODELS,
    AURA_VOICES,
    type SttModel,
    type AuraVoice
} from '@/shared/interviewConfig'

interface CreateInterviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    defaultCompanyName?: string
    onSuccess: (interview: any) => void
    initialData?: any // For edit mode
}

export function CreateInterviewDialog({
    open,
    onOpenChange,
    defaultCompanyName = '',
    onSuccess,
    initialData, // Optional: if provided, we are in "Edit Mode"
}: CreateInterviewDialogProps) {
    const isEditMode = !!initialData
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        job_title: '',
        company_name: defaultCompanyName,
        job_description: '',
        duration_minutes: '15',
        interview_type: 'screening' as InterviewTemplateType,
        difficulty_level: 'mid' as 'entry' | 'mid' | 'senior' | 'executive',
        custom_instructions: '',
        stt_model: 'flux-general-en' as SttModel,
        voice_id: 'aura-asteria-en' as AuraVoice,
        endpointing: 300,
        utterance_end_ms: 1000,
        smart_format: true,
        keywords: '', // Comma separated string for input
        required_questions: [''] as string[],
    })
    const [manuallyEdited, setManuallyEdited] = useState(false)

    // Reset or populate form when dialog opens
    useEffect(() => {
        if (open) {
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
        }
    }, [open, initialData, isEditMode, defaultCompanyName])

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
                response = await window.axios.put(`/interviews/${initialData.id}`, payload)
            } else {
                response = await window.axios.post('/interviews', payload)
            }

            if (response.data.success) {
                onSuccess(response.data.interview)
                onOpenChange(false)
                // Reset form
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
        } catch (error) {
            console.error('Failed to create interview:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Interview' : 'Create New Interview'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update the configuration for this interview template.'
                            : 'Set up an interview configuration. You can use this for multiple candidates.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Required Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    {/* Job Description */}
                    <div className="space-y-2">
                        <Label htmlFor="job_description">Job Description</Label>
                        <Textarea
                            id="job_description"
                            placeholder="Paste the job description here..."
                            className="min-h-[150px]"
                            value={formData.job_description}
                            onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                            Gennie will use this to ask relevant questions during the interview.
                        </p>
                    </div>

                    {/* Interview Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    </div>

                    {/* AI Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>

                    {/* Required Questions */}
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

                    {/* Custom Instructions */}
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
                        <p className="text-xs text-muted-foreground">
                            These instructions guide Gennie's interview approach. Feel free to customize them.
                        </p>
                    </div>

                    {/* Advanced STT Configuration */}
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="advanced-stt">
                            <AccordionTrigger className="text-sm font-medium">
                                Advanced STT Settings
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                                <div className="flex items-center space-x-2">
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
                    </DialogFooter>
                </form >
            </DialogContent >
        </Dialog >
    )
}
