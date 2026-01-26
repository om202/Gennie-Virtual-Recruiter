import { Head, Link, router } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Briefcase, MapPin, Users, Pencil, Trash2, X, Link2, Copy, Check, FileText, Loader2, Mail, Eye, Globe, ToggleLeft, ToggleRight } from 'lucide-react'
import { formatSalaryRange } from '@/lib/formatCurrency'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface JobDescription {
    id: string
    title: string
    company_name: string
    description: string | null
    location: string | null
    remote_type: 'onsite' | 'hybrid' | 'remote'
    employment_type: 'full-time' | 'part-time' | 'contract' | 'internship'
    salary_min: number | null
    salary_max: number | null
    salary_currency: string
    salary_period: string
    interviews_count: number
    applications_count: number
    public_token: string | null
    public_link_enabled: boolean
    created_at: string
}

interface IndexProps {
    auth: {
        user: {
            name: string
            email: string
            avatar: string
            company_name: string
            phone: string
            careers_token: string | null
            careers_page_enabled: boolean
        }
    }
    jobDescriptions: JobDescription[]
}

export default function Index({ auth, jobDescriptions: initialJobs }: IndexProps) {
    const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>(initialJobs)
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [jobToDelete, setJobToDelete] = useState<JobDescription | null>(null)
    const [highlightedJobId, setHighlightedJobId] = useState<string | null>(null)

    // Share dialog state
    const [shareDialogOpen, setShareDialogOpen] = useState(false)
    const [selectedJob, setSelectedJob] = useState<JobDescription | null>(null)
    const [publicUrl, setPublicUrl] = useState<string>('')
    const [isGeneratingLink, setIsGeneratingLink] = useState(false)
    const [copiedLink, setCopiedLink] = useState(false)
    const [copiedEmail, setCopiedEmail] = useState(false)

    // Careers dialog state
    const [careersDialogOpen, setCareersDialogOpen] = useState(false)
    const [copiedCareersLink, setCopiedCareersLink] = useState(false)

    // Check for highlight query parameter on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const highlightId = urlParams.get('highlight')
        if (highlightId) {
            setHighlightedJobId(highlightId)
            const filtered = initialJobs.filter(j => j.id === highlightId)
            if (filtered.length > 0) {
                setJobDescriptions(filtered)
            }
        }
    }, [initialJobs])

    const clearFilter = () => {
        setHighlightedJobId(null)
        setJobDescriptions(initialJobs)
        router.visit('/job-descriptions', { preserveState: true, replace: true })
    }

    const confirmDelete = (job: JobDescription) => {
        setJobToDelete(job)
        setDeleteConfirmationOpen(true)
    }

    const handleDeleteJob = async () => {
        if (!jobToDelete) return

        try {
            await window.axios.delete(`/job-descriptions/${jobToDelete.id}`)
            setJobDescriptions(jobDescriptions.filter(j => j.id !== jobToDelete.id))
            setDeleteConfirmationOpen(false)
            setJobToDelete(null)
        } catch (error: any) {
            console.error("Failed to delete job description:", error)
            if (error.response?.data?.error) {
                alert(error.response.data.error)
            }
        }
    }

    const handleOpenShareDialog = async (job: JobDescription) => {
        setSelectedJob(job)
        setShareDialogOpen(true)
        setCopiedLink(false)
        setCopiedEmail(false)

        // If already has a public link, construct URL
        if (job.public_token && job.public_link_enabled) {
            const companySlug = job.company_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            const jobSlug = job.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            setPublicUrl(`${window.location.origin}/apply/${companySlug}/${jobSlug}/${job.public_token}`)
        } else {
            // Generate new link
            setIsGeneratingLink(true)
            try {
                const response = await window.axios.post(`/job-descriptions/${job.id}/enable-public-link`)
                if (response.data.success) {
                    setPublicUrl(response.data.public_url)
                    setJobDescriptions(prev => prev.map(j =>
                        j.id === job.id
                            ? { ...j, public_token: response.data.public_token, public_link_enabled: true }
                            : j
                    ))
                }
            } catch (error) {
                console.error('Failed to generate link:', error)
            } finally {
                setIsGeneratingLink(false)
            }
        }
    }

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(publicUrl)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
    }

    const generateEmailTemplate = (job: JobDescription, url: string) => {
        return `Hi,

We're excited to share an opportunity with you!

Job Details:
• Position: ${job.title}
• Company: ${job.company_name}
• Location: ${job.location || 'Not specified'} (${getRemoteTypeLabel(job.remote_type)})
• Type: ${getEmploymentTypeLabel(job.employment_type)}

Apply directly using this link:
${url}

We look forward to receiving your application!

Best regards,
${job.company_name} Hiring Team`
    }

    const handleCopyEmailTemplate = async () => {
        if (!selectedJob) return
        const template = generateEmailTemplate(selectedJob, publicUrl)
        await navigator.clipboard.writeText(template)
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2000)
    }

    const getRemoteTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            onsite: 'On-site',
            hybrid: 'Hybrid',
            remote: 'Remote',
        }
        return labels[type] || type
    }

    const getRemoteTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            onsite: 'bg-primary/10 text-primary',
            hybrid: 'bg-purple-500/10 text-purple-700',
            remote: 'bg-green-500/10 text-green-700',
        }
        return colors[type] || 'bg-gray-100 text-gray-800'
    }

    const getEmploymentTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'full-time': 'Full-time',
            'part-time': 'Part-time',
            'contract': 'Contract',
            'internship': 'Internship',
        }
        return labels[type] || type
    }

    const formatSalary = (job: JobDescription) => {
        return formatSalaryRange(
            job.salary_min,
            job.salary_max,
            job.salary_currency || 'USD',
            job.salary_period as 'yearly' | 'monthly' | 'hourly' || 'yearly'
        )
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })
    }

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title="Job Descriptions" />

            <div className="max-w-7xl mx-auto py-8 md:pt-12 px-4 md:px-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
                            <Briefcase className="h-7 w-7 text-primary/80" />
                            Job Descriptions
                        </h1>
                        <p className="text-muted-foreground">
                            Create and manage job postings for your interviews.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCareersDialogOpen(true)
                            }}
                        >
                            <Globe className="h-4 w-4 mr-2" />
                            Careers Page
                        </Button>
                        <Link href="/applications" className={buttonVariants({ variant: "outline", className: "w-full md:w-auto" })}>
                            <Users className="h-4 w-4 mr-2" />
                            All Applications
                        </Link>
                        {jobDescriptions.length > 0 && (
                            <Link href="/job-descriptions/create" className={buttonVariants({ className: "w-full md:w-auto" })}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Job Description
                            </Link>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <>
                    {/* Filter Indicator */}
                    {highlightedJobId && (
                        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">Filtered</Badge>
                                <span className="text-sm text-muted-foreground">
                                    Showing 1 job description from interview logs
                                </span>
                            </div>
                            <Button variant="outline" size="sm" onClick={clearFilter}>
                                <X className="h-4 w-4 mr-2" />
                                Clear Filter
                            </Button>
                        </div>
                    )}

                    {/* Job Grid */}
                    {jobDescriptions.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium mb-2">No job descriptions yet</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Create your first job description to start setting up interviews.
                                </p>
                                <Link href="/job-descriptions/create" className={buttonVariants()}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Your First Job Description
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {jobDescriptions.map((job) => (
                                <Card key={job.id} className={`hover:shadow-md transition-shadow flex flex-col ${highlightedJobId === job.id ? 'ring-2 ring-primary' : ''}`}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <CardTitle className="text-lg truncate">{job.title}</CardTitle>
                                                <CardDescription className="truncate flex items-center gap-2">
                                                    <span>{job.company_name}</span>
                                                    {job.location && (
                                                        <>
                                                            <span>•</span>
                                                            <MapPin className="h-3 w-3 shrink-0" />
                                                            <span className="truncate">{job.location}</span>
                                                        </>
                                                    )}
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Link href={`/job-descriptions/${job.id}/edit`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                        title="Edit Job Description"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => confirmDelete(job)}
                                                    disabled={job.interviews_count > 0}
                                                    title="Delete Job Description"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 space-y-4">
                                        {/* Tags - matching Interview cards styling */}
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className={getRemoteTypeColor(job.remote_type)}>
                                                {getRemoteTypeLabel(job.remote_type)}
                                            </Badge>
                                            <Badge variant="outline">
                                                {getEmploymentTypeLabel(job.employment_type)}
                                            </Badge>
                                            {formatSalary(job) && (
                                                <Badge variant="outline">
                                                    {formatSalary(job)}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Stats - matching Interview cards styling */}
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <Link
                                                href={`/interviews?job_description_id=${job.id}`}
                                                className="flex items-center gap-1 hover:text-primary"
                                            >
                                                <Users className="h-3 w-3" />
                                                <span>{job.interviews_count} interview{job.interviews_count !== 1 ? 's' : ''}</span>
                                            </Link>
                                            <span className="flex items-center gap-1">
                                                Created {formatDate(job.created_at)}
                                            </span>
                                        </div>
                                    </CardContent>

                                    {/* Actions at bottom */}
                                    <CardContent className="pt-0 space-y-2">
                                        <div className="flex gap-2">
                                            <Button
                                                variant={job.public_link_enabled ? "outlinePrimary" : "outline"}
                                                className="flex-1"
                                                onClick={() => handleOpenShareDialog(job)}
                                                disabled={!job.public_link_enabled}
                                            >
                                                <Link2 className="h-4 w-4 mr-2" />
                                                {job.public_link_enabled ? 'Share Link' : 'Private'}
                                            </Button>
                                            <Button
                                                variant={job.public_link_enabled ? "outline" : "ghost"}
                                                size="icon"
                                                className={job.public_link_enabled ? "text-green-600" : "text-muted-foreground"}
                                                title={job.public_link_enabled ? "Public - visible on careers page" : "Private - hidden from careers page"}
                                                onClick={async () => {
                                                    try {
                                                        await window.axios.post(`/job-descriptions/${job.id}/toggle-public`);
                                                        setJobDescriptions(prev => prev.map(j =>
                                                            j.id === job.id
                                                                ? { ...j, public_link_enabled: !j.public_link_enabled }
                                                                : j
                                                        ));
                                                    } catch (error) {
                                                        console.error('Failed to toggle public status:', error);
                                                    }
                                                }}
                                            >
                                                {job.public_link_enabled ? (
                                                    <ToggleRight className="h-5 w-5" />
                                                ) : (
                                                    <ToggleLeft className="h-5 w-5" />
                                                )}
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Link href={`/job-descriptions/${job.id}/applications`}>
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Applications
                                                </Button>
                                            </Link>
                                            <Link href={`/interviews/create?job_description_id=${job.id}`}>
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Create Interview
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            </div>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the job description "{jobToDelete?.title}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteJob}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Share Link Dialog - matching Interview share dialog styling */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-primary">
                            <Link2 className="h-5 w-5" />
                            Share Application Link
                        </DialogTitle>
                        <DialogDescription>
                            Share this link with candidates to receive applications for this position.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Job Info - matching Interview dialog styling */}
                        {selectedJob && (
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                                <p className="font-semibold text-primary">{selectedJob.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedJob.company_name} • {selectedJob.location || 'Remote'} • {getEmploymentTypeLabel(selectedJob.employment_type)}
                                </p>
                            </div>
                        )}

                        {isGeneratingLink ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="ml-2 text-muted-foreground">Generating link...</span>
                            </div>
                        ) : (
                            <>
                                {/* Copy Link Section */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Application Link</Label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-muted rounded-md px-4 py-3 text-sm font-mono break-all border">
                                            {publicUrl}
                                        </div>
                                        <Button
                                            variant={copiedLink ? "outline" : "default"}
                                            onClick={handleCopyLink}
                                            className="shrink-0"
                                        >
                                            {copiedLink ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-2 text-green-600" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copy Link
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Email Template Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-primary" />
                                            Email Template
                                        </Label>
                                        <Button
                                            variant={copiedEmail ? "ghost" : "outlinePrimary"}
                                            size="sm"
                                            onClick={handleCopyEmailTemplate}
                                        >
                                            {copiedEmail ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-2 text-green-600" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copy Template
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <Textarea
                                        readOnly
                                        className="h-56 text-sm resize-none border-primary/20 focus-visible:ring-primary/30"
                                        value={selectedJob ? generateEmailTemplate(selectedJob, publicUrl) : ''}
                                    />
                                </div>

                                {/* Preview Section */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => window.open(publicUrl, '_blank')}
                                    disabled={!publicUrl}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview Application Page
                                </Button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Careers Page Dialog */}
            <Dialog open={careersDialogOpen} onOpenChange={setCareersDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Careers Page
                        </DialogTitle>
                        <DialogDescription>
                            Share this link on your website to show all open positions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
                            <Label className="text-xs text-muted-foreground mb-1 block">Your Careers Page URL</Label>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={`${window.location.origin}/careers/${auth.user.careers_token}`}
                                    className="flex-1 text-sm bg-background border rounded-md px-3 py-2"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                        await navigator.clipboard.writeText(`${window.location.origin}/careers/${auth.user.careers_token}`)
                                        setCopiedCareersLink(true)
                                        setTimeout(() => setCopiedCareersLink(false), 2000)
                                    }}
                                >
                                    {copiedCareersLink ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Only jobs with public application links enabled will appear on your careers page.
                        </p>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => window.open(`/careers/${auth.user.careers_token}`, '_blank')}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview Careers Page
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
