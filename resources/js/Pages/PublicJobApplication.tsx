import { Head } from '@inertiajs/react'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MarkdownViewer } from "@/components/MarkdownEditor"
import {
    MapPin,
    Briefcase,
    DollarSign,
    Clock,
    GraduationCap,
    Loader2,
    Check,
    Sparkles,
    Building2,
    FileText,
    Send,
    User
} from 'lucide-react'

interface JobDescription {
    id: string
    title: string
    company_name: string
    description: string | null
    location: string | null
    remote_type: string
    salary_range: string | null
    experience_range: string | null
    education_level: string | null
    skills: string[] | null
    employment_type: string
    benefits: string | null
    application_deadline: string | null
}

interface Props {
    job?: JobDescription
    token: string
    error?: string
}

export default function PublicJobApplication({ job, token, error }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        linkedin_url: '',
        cover_letter: '',
    })
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isParsingResume, setIsParsingResume] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Error state
    if (error || !job) {
        return (
            <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
                <Head title="Job Not Available" />
                <div className="max-w-md text-center space-y-4">
                    <div className="text-6xl">😔</div>
                    <h1 className="text-2xl font-bold">Job Not Available</h1>
                    <p className="text-muted-foreground">
                        {error || 'This job posting is no longer accepting applications.'}
                    </p>
                </div>
            </div>
        )
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0])
        }
    }

    const handleAutoFill = async () => {
        if (!resumeFile) return

        setIsParsingResume(true)
        try {
            const formDataPayload = new FormData()
            formDataPayload.append('resume', resumeFile)

            const res = await fetch('/apply/parse-resume', {
                method: 'POST',
                body: formDataPayload,
            })
            const data = await res.json()

            if (data.status === 'success' && data.data) {
                setFormData(prev => ({
                    ...prev,
                    name: data.data.name || prev.name,
                    email: data.data.email || prev.email,
                    phone: data.data.phone || prev.phone,
                    linkedin_url: data.data.linkedin_url || prev.linkedin_url,
                }))
            }
        } catch (error) {
            console.error('Failed to parse resume:', error)
        } finally {
            setIsParsingResume(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!resumeFile) {
            setSubmitError('Please upload your resume.')
            return
        }

        setIsSubmitting(true)
        setSubmitError(null)

        try {
            const formDataPayload = new FormData()
            formDataPayload.append('name', formData.name)
            formDataPayload.append('email', formData.email)
            formDataPayload.append('phone', formData.phone)
            formDataPayload.append('resume', resumeFile)
            if (formData.linkedin_url) {
                formDataPayload.append('linkedin_url', formData.linkedin_url)
            }
            if (formData.cover_letter) {
                formDataPayload.append('cover_letter', formData.cover_letter)
            }

            const res = await fetch(`/apply/${token}`, {
                method: 'POST',
                body: formDataPayload,
            })
            const data = await res.json()

            if (data.success) {
                setIsSubmitted(true)
            } else {
                setSubmitError(data.error || 'Failed to submit application. Please try again.')
            }
        } catch (error) {
            console.error('Submission error:', error)
            setSubmitError('An error occurred. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatRemoteType = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1)
    }

    const formatEmploymentType = (type: string) => {
        return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
    }

    // Success State
    if (isSubmitted) {
        return (
            <>
                <Head title={`Application Submitted - ${job.title}`} />
                <div className="bg-muted/50 text-foreground min-h-screen flex flex-col p-4 pb-16">
                    <header className="w-full mt-6 mb-10">
                        <a href="/" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <span className="text-sm">Powered by</span>
                            <img src="/gennie.png" alt="Gennie" className="h-6 w-6 object-contain" />
                            <span className="font-semibold text-sm text-primary">Gennie Talent</span>
                        </a>
                    </header>

                    <main className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
                        <Card className="w-full text-center">
                            <CardContent className="pt-8 pb-8">
                                <div className="h-16 w-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="h-8 w-8" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
                                <p className="text-muted-foreground mb-6">
                                    Thank you for applying to <span className="font-medium">{job.title}</span> at{' '}
                                    <span className="font-medium">{job.company_name}</span>.
                                    We'll review your application and get back to you soon.
                                </p>
                                <Button onClick={() => window.location.reload()} variant="outline">
                                    Submit Another Application
                                </Button>
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </>
        )
    }

    return (
        <>
            <Head>
                <title>{`Apply: ${job.title} at ${job.company_name}`}</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="bg-muted/50 text-foreground min-h-screen flex flex-col p-4 pb-16">
                {/* Powered by Gennie */}
                <header className="w-full mt-6 mb-10">
                    <a href="/" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <span className="text-sm">Powered by</span>
                        <img src="/gennie.png" alt="Gennie" className="h-6 w-6 object-contain" />
                        <span className="font-semibold text-sm text-primary">Gennie Talent</span>
                    </a>
                </header>

                <main className="flex-1 flex flex-col items-center max-w-4xl mx-auto w-full space-y-8">
                    {/* Header Info */}
                    <div className="text-center space-y-4">
                        <Badge variant="outline" className="px-3 py-1">
                            {formatEmploymentType(job.employment_type)} Position
                        </Badge>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            {job.title}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground pt-2">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span>{job.company_name}</span>
                            </div>
                            {job.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{job.location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                <span>{formatRemoteType(job.remote_type)}</span>
                            </div>
                        </div>

                        {/* Additional Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                            {job.salary_range && (
                                <Badge variant="secondary" className="gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {job.salary_range}
                                </Badge>
                            )}
                            {job.experience_range && (
                                <Badge variant="secondary" className="gap-1">
                                    <Clock className="h-3 w-3" />
                                    {job.experience_range}
                                </Badge>
                            )}
                            {job.education_level && (
                                <Badge variant="secondary" className="gap-1">
                                    <GraduationCap className="h-3 w-3" />
                                    {job.education_level}
                                </Badge>
                            )}
                        </div>

                        {job.application_deadline && (
                            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                                Application deadline: {job.application_deadline}
                            </p>
                        )}
                    </div>

                    {/* Job Details Section */}
                    <div className="w-full space-y-6">
                        {/* Job Description */}
                        {job.description && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">About the Role</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <MarkdownViewer content={job.description} />
                                </CardContent>
                            </Card>
                        )}

                        {/* Skills */}
                        {job.skills && job.skills.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Required Skills</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map((skill, i) => (
                                            <Badge key={i} variant="secondary">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Benefits */}
                        {job.benefits && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Benefits & Perks</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <MarkdownViewer content={job.benefits} />
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Application Form at Bottom */}
                    <Card className="w-full max-w-xl mx-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Apply for this Position
                            </CardTitle>
                            <CardDescription>
                                Complete the form below to submit your application
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Resume Upload */}
                                <div className="space-y-2">
                                    <Label htmlFor="resume">
                                        Resume <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Input
                                                ref={fileInputRef}
                                                id="resume"
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileChange}
                                                className="cursor-pointer"
                                            />
                                        </div>
                                        {resumeFile && (
                                            <Button
                                                type="button"
                                                variant="outlinePrimary"
                                                size="sm"
                                                onClick={handleAutoFill}
                                                disabled={isParsingResume}
                                                className="gap-1 shrink-0"
                                            >
                                                {isParsingResume ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Sparkles className="h-4 w-4" />
                                                )}
                                                Auto-fill
                                            </Button>
                                        )}
                                    </div>
                                    {resumeFile && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            {resumeFile.name}
                                        </p>
                                    )}
                                </div>

                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Full Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Jane Doe"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email Address <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="jane@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone">
                                        Phone Number <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="+1 (555) 000-0000"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                {/* LinkedIn */}
                                <div className="space-y-2">
                                    <Label htmlFor="linkedin_url">
                                        LinkedIn Profile
                                        <span className="text-muted-foreground text-xs font-normal ml-1">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="linkedin_url"
                                        name="linkedin_url"
                                        type="url"
                                        placeholder="https://linkedin.com/in/yourprofile"
                                        value={formData.linkedin_url}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Cover Letter */}
                                <div className="space-y-2">
                                    <Label htmlFor="cover_letter">
                                        Cover Letter
                                        <span className="text-muted-foreground text-xs font-normal ml-1">(Optional)</span>
                                    </Label>
                                    <Textarea
                                        id="cover_letter"
                                        name="cover_letter"
                                        placeholder="Tell us why you're interested in this role..."
                                        value={formData.cover_letter}
                                        onChange={handleInputChange}
                                        rows={4}
                                    />
                                </div>

                                {/* Error Message */}
                                {submitError && (
                                    <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                                        {submitError}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Submit Application
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    )
}
