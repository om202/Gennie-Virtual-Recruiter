import { useState } from 'react'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface CreateInterviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    defaultCompanyName?: string
    onSuccess: (interview: any) => void
}

export function CreateInterviewDialog({
    open,
    onOpenChange,
    defaultCompanyName = '',
    onSuccess,
}: CreateInterviewDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        job_title: '',
        company_name: defaultCompanyName,
        job_description: '',
        duration_minutes: '15',
        interview_type: 'screening',
        difficulty_level: 'mid',
        custom_instructions: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await fetch('/interviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    ...formData,
                    duration_minutes: parseInt(formData.duration_minutes),
                }),
            })

            const data = await response.json()
            if (data.success) {
                onSuccess(data.interview)
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
                })
            }
        } catch (error) {
            console.error('Failed to create interview:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Interview</DialogTitle>
                    <DialogDescription>
                        Set up an interview configuration. You can use this for multiple candidates.
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
                                onValueChange={(value: string) => setFormData({ ...formData, interview_type: value })}
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
                                onValueChange={(value: string) => setFormData({ ...formData, difficulty_level: value })}
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

                    {/* Custom Instructions */}
                    <div className="space-y-2">
                        <Label htmlFor="custom_instructions">Custom Instructions (Optional)</Label>
                        <Textarea
                            id="custom_instructions"
                            placeholder="e.g., Focus on React and AWS experience, ask about system design..."
                            className="min-h-[80px]"
                            value={formData.custom_instructions}
                            onChange={(e) => setFormData({ ...formData, custom_instructions: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!formData.job_title.trim() || isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Interview'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
