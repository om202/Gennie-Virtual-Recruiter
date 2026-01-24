import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2, Upload, X, CheckCircle } from 'lucide-react'
import { toast } from '@/components/ui/sonner'
import { MarkdownEditor } from '@/components/MarkdownEditor'

interface JobDescription {
    id?: string
    title: string
    company_name: string
    description: string | null
    location: string | null
    remote_type: 'onsite' | 'hybrid' | 'remote'
    salary_min: number | null
    salary_max: number | null
    salary_currency: string
    salary_period: 'hourly' | 'monthly' | 'yearly'
    experience_years_min: number | null
    experience_years_max: number | null
    education_level: string | null
    skills: string[] | null
    employment_type: 'full-time' | 'part-time' | 'contract' | 'internship'
    benefits: string | null
}

interface JobDescriptionFormProps {
    defaultCompanyName?: string
    onSuccess: (jobDescription: JobDescription) => void
    onCancel: () => void
    initialData?: JobDescription
}

export function JobDescriptionForm({
    defaultCompanyName = '',
    onSuccess,
    onCancel,
    initialData,
}: JobDescriptionFormProps) {
    const isEditMode = !!initialData
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoadingJD, setIsLoadingJD] = useState(false)
    const [jdFilename, setJdFilename] = useState<string | null>(null)
    const jdInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        company_name: initialData?.company_name || defaultCompanyName,
        description: initialData?.description || '',
        location: initialData?.location || '',
        remote_type: initialData?.remote_type || 'onsite' as 'onsite' | 'hybrid' | 'remote',
        salary_min: initialData?.salary_min?.toString() || '',
        salary_max: initialData?.salary_max?.toString() || '',
        salary_currency: initialData?.salary_currency || 'USD',
        salary_period: initialData?.salary_period || 'yearly' as 'hourly' | 'monthly' | 'yearly',
        experience_years_min: initialData?.experience_years_min?.toString() || '',
        experience_years_max: initialData?.experience_years_max?.toString() || '',
        education_level: initialData?.education_level || '',
        skills: Array.isArray(initialData?.skills) ? initialData.skills.join(', ') : '',
        employment_type: initialData?.employment_type || 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship',
        benefits: initialData?.benefits || '',
    })

    const handleFileUpload = async (file: File) => {
        setIsLoadingJD(true)
        try {
            const uploadData = new FormData()
            uploadData.append('file', file)

            const response = await window.axios.post('/job-descriptions/parse', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (response.data.status === 'success') {
                const extracted = response.data.data

                // Auto-fill all structured form fields from AI extraction
                setFormData(prev => ({
                    ...prev,
                    title: extracted.title?.trim() || prev.title,
                    company_name: extracted.company_name?.trim() || prev.company_name,
                    description: extracted.description?.trim() || response.data.raw_text || prev.description,
                    location: extracted.location?.trim() || prev.location,
                    remote_type: extracted.remote_type || prev.remote_type,
                    salary_min: extracted.salary_min?.toString() || prev.salary_min,
                    salary_max: extracted.salary_max?.toString() || prev.salary_max,
                    salary_currency: extracted.salary_currency || prev.salary_currency,
                    salary_period: extracted.salary_period || prev.salary_period,
                    experience_years_min: extracted.experience_years_min?.toString() || prev.experience_years_min,
                    experience_years_max: extracted.experience_years_max?.toString() || prev.experience_years_max,
                    education_level: extracted.education_level?.trim() || prev.education_level,
                    skills: Array.isArray(extracted.skills) ? extracted.skills.join(', ') : prev.skills,
                    employment_type: extracted.employment_type || prev.employment_type,
                    benefits: extracted.benefits?.trim() || prev.benefits,
                }))

                setJdFilename(file.name)
                toast.success('Job description parsed successfully', {
                    description: `Extracted data from ${file.name}. Please review the auto-filled fields.`,
                })
            } else {
                toast.error('Failed to parse job description', {
                    description: response.data.message || 'Please try again or enter details manually.',
                })
            }
        } catch (error: any) {
            console.error('Upload failed:', error)
            toast.error('Upload failed', {
                description: error?.response?.data?.message || error?.message || 'Please try again or enter details manually.',
            })
        } finally {
            setIsLoadingJD(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const payload = {
                ...formData,
                salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
                salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
                experience_years_min: formData.experience_years_min ? parseInt(formData.experience_years_min) : null,
                experience_years_max: formData.experience_years_max ? parseInt(formData.experience_years_max) : null,
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
            }

            let response
            if (isEditMode) {
                response = await window.axios.put(`/job-descriptions/${initialData.id}`, payload)
            } else {
                response = await window.axios.post('/job-descriptions', payload)
            }

            if (response.data.success) {
                onSuccess(response.data.jobDescription)
            }
        } catch (error) {
            console.error('Failed to save job description:', error)
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
                            <Label htmlFor="title">
                                Job Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="e.g., Senior React Developer"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company_name">
                                Company Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="company_name"
                                placeholder="Your company"
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="description">Job Description</Label>
                            {isLoadingJD ? (
                                <span className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Parsing file...
                                </span>
                            ) : (
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
                            )}
                            <input
                                ref={jdInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleFileUpload(file)
                                    e.target.value = ''
                                }}
                            />
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
                            <MarkdownEditor
                                value={formData.description}
                                onChange={(value) => {
                                    setFormData({ ...formData, description: value })
                                    if (jdFilename) setJdFilename(null)
                                }}
                                placeholder="Paste the job description here or upload a file..."
                                minHeight="200px"
                            />
                            {isLoadingJD && (
                                <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-[1px] rounded-md">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 2: Location & Work Type */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Location & Work Type</CardTitle>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 2</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                placeholder="e.g., San Francisco, CA"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Work Type</Label>
                            <Select
                                value={formData.remote_type}
                                onValueChange={(value: 'onsite' | 'hybrid' | 'remote') => setFormData({ ...formData, remote_type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="onsite">On-site</SelectItem>
                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                    <SelectItem value="remote">Remote</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Employment Type</Label>
                            <Select
                                value={formData.employment_type}
                                onValueChange={(value: 'full-time' | 'part-time' | 'contract' | 'internship') => setFormData({ ...formData, employment_type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full-time">Full-time</SelectItem>
                                    <SelectItem value="part-time">Part-time</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="internship">Internship</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 3: Compensation */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Compensation</CardTitle>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 3</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="salary_min">Salary Min</Label>
                            <Input
                                id="salary_min"
                                type="number"
                                placeholder="50000"
                                value={formData.salary_min}
                                onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="salary_max">Salary Max</Label>
                            <Input
                                id="salary_max"
                                type="number"
                                placeholder="100000"
                                value={formData.salary_max}
                                onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select
                                value={formData.salary_currency}
                                onValueChange={(value) => setFormData({ ...formData, salary_currency: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="GBP">GBP</SelectItem>
                                    <SelectItem value="INR">INR</SelectItem>
                                    <SelectItem value="CAD">CAD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Period</Label>
                            <Select
                                value={formData.salary_period}
                                onValueChange={(value: 'hourly' | 'monthly' | 'yearly') => setFormData({ ...formData, salary_period: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hourly">Hourly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 4: Requirements */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Requirements</CardTitle>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 4</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="experience_years_min">Experience (Years Min)</Label>
                            <Input
                                id="experience_years_min"
                                type="number"
                                min="0"
                                placeholder="2"
                                value={formData.experience_years_min}
                                onChange={(e) => setFormData({ ...formData, experience_years_min: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="experience_years_max">Experience (Years Max)</Label>
                            <Input
                                id="experience_years_max"
                                type="number"
                                min="0"
                                placeholder="5"
                                value={formData.experience_years_max}
                                onChange={(e) => setFormData({ ...formData, experience_years_max: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="education_level">Education Level</Label>
                            <Input
                                id="education_level"
                                placeholder="e.g., Bachelor's Degree"
                                value={formData.education_level}
                                onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2 mt-4">
                        <Label htmlFor="skills">Required Skills</Label>
                        <Input
                            id="skills"
                            placeholder="React, TypeScript, Node.js (comma separated)"
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        />
                        <p className="text-[13px] text-muted-foreground">
                            Enter skills separated by commas.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Section 5: Additional Details */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Additional Details</CardTitle>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 5</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="benefits">Benefits & Perks</Label>
                        <MarkdownEditor
                            value={formData.benefits}
                            onChange={(value) => setFormData({ ...formData, benefits: value })}
                            placeholder="Health insurance, 401k, remote work options..."
                            minHeight="120px"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="bg-background">
                    Cancel
                </Button>
                <Button type="submit" disabled={!formData.title.trim() || !formData.company_name.trim() || isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {isEditMode ? 'Saving...' : 'Creating...'}
                        </>
                    ) : (
                        isEditMode ? 'Save Changes' : 'Create Job Description'
                    )}
                </Button>
            </div>
        </form>
    )
}
