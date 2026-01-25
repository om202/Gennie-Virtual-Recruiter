import { Head, Link, router } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Briefcase, MapPin, Building2, Users, Pencil, Trash2, X, Link2, Copy, Check, FileText, Loader2 } from 'lucide-react'
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
    DialogFooter,
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
        }
    }
    jobDescriptions: JobDescription[]
}

export default function Index({ jobDescriptions: initialJobs }: IndexProps) {
    const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>(initialJobs)
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [jobToDelete, setJobToDelete] = useState<JobDescription | null>(null)
    const [highlightedJobId, setHighlightedJobId] = useState<string | null>(null)

    // Share dialog state
    const [shareDialogOpen, setShareDialogOpen] = useState(false)
    const [selectedJob, setSelectedJob] = useState<JobDescription | null>(null)
    const [publicUrl, setPublicUrl] = useState<string>('')
    const [isGeneratingLink, setIsGeneratingLink] = useState(false)
    const [urlCopied, setUrlCopied] = useState(false)

    // Check for highlight query parameter on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const highlightId = urlParams.get('highlight')
        if (highlightId) {
            setHighlightedJobId(highlightId)
            // Filter to show only the highlighted JD
            const filtered = initialJobs.filter(j => j.id === highlightId)
            if (filtered.length > 0) {
                setJobDescriptions(filtered)
            }
        }
    }, [initialJobs])

    const clearFilter = () => {
        setHighlightedJobId(null)
        setJobDescriptions(initialJobs)
        // Update URL without the query param
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

    const handleShareClick = async (job: JobDescription) => {
        setSelectedJob(job)
        setShareDialogOpen(true)
        setUrlCopied(false)

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
                    // Update local state
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

    const handleCopyUrl = async () => {
        await navigator.clipboard.writeText(publicUrl)
        setUrlCopied(true)
        setTimeout(() => setUrlCopied(false), 2000)
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
        if (!job.salary_min && !job.salary_max) return null
        const currency = job.salary_currency || 'USD'
        const period = job.salary_period === 'yearly' ? '/yr' : job.salary_period === 'monthly' ? '/mo' : '/hr'

        if (job.salary_min && job.salary_max) {
            return `${currency} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}${period}`
        }
        if (job.salary_min) {
            return `${currency} ${job.salary_min.toLocaleString()}+${period}`
        }
        return `Up to ${currency} ${job.salary_max?.toLocaleString()}${period}`
    }

    const getEmailTemplate = () => {
        if (!selectedJob) return ''
        return `Hi,

I wanted to share an exciting opportunity with you!

We're hiring for the position of ${selectedJob.title} at ${selectedJob.company_name}.

You can apply directly using this link:
${publicUrl}

Looking forward to receiving your application!

Best regards`
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
                    {jobDescriptions.length > 0 && (
                        <Link href="/job-descriptions/create" className={buttonVariants({ className: "w-full md:w-auto" })}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Job Description
                        </Link>
                    )}
                </div>

                {/* Main Content */}
                <div className="space-y-6">
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

                    {/* Count Info - Only show when there are jobs and not filtered */}
                    {jobDescriptions.length > 0 && !highlightedJobId && (
                        <p className="text-sm text-muted-foreground">
                            {jobDescriptions.length} job description{jobDescriptions.length !== 1 ? 's' : ''}
                        </p>
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
                                <Card key={job.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1 flex-1 min-w-0">
                                                <CardTitle className="text-lg leading-tight truncate">
                                                    {job.title}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1">
                                                    <Building2 className="h-3 w-3" />
                                                    {job.company_name}
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0"
                                                    onClick={() => handleShareClick(job)}
                                                    title="Share Application Link"
                                                >
                                                    <Link2 className="h-4 w-4" />
                                                </Button>
                                                <Link href={`/job-descriptions/${job.id}/edit`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0"
                                                        title="Edit Job Description"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                                    onClick={() => confirmDelete(job)}
                                                    disabled={job.interviews_count > 0}
                                                    title="Delete Job Description"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Location */}
                                        {job.location && (
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate">{job.location}</span>
                                            </div>
                                        )}

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className={getRemoteTypeColor(job.remote_type)}>
                                                {getRemoteTypeLabel(job.remote_type)}
                                            </Badge>
                                            <Badge variant="outline">
                                                {getEmploymentTypeLabel(job.employment_type)}
                                            </Badge>
                                        </div>

                                        {/* Salary */}
                                        {formatSalary(job) && (
                                            <p className="text-sm font-medium">{formatSalary(job)}</p>
                                        )}

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                <span>{job.interviews_count} interview{job.interviews_count !== 1 ? 's' : ''}</span>
                                            </div>
                                            {job.applications_count > 0 && (
                                                <Link
                                                    href={`/job-descriptions/${job.id}/applications`}
                                                    className="flex items-center gap-1 hover:text-primary"
                                                >
                                                    <FileText className="h-3 w-3" />
                                                    <span>{job.applications_count} application{job.applications_count !== 1 ? 's' : ''}</span>
                                                </Link>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
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

            {/* Share Link Dialog */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Link2 className="h-5 w-5" />
                            Share Application Link
                        </DialogTitle>
                        <DialogDescription>
                            Share this link with candidates to receive applications for {selectedJob?.title}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {isGeneratingLink ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="ml-2 text-muted-foreground">Generating link...</span>
                            </div>
                        ) : (
                            <>
                                {/* URL Input with Copy */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Application Link</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={publicUrl}
                                            readOnly
                                            className="font-mono text-sm"
                                        />
                                        <Button
                                            onClick={handleCopyUrl}
                                            variant="outline"
                                            className="shrink-0"
                                        >
                                            {urlCopied ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-2 text-green-500" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Email Template */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email Template</label>
                                    <div className="relative">
                                        <textarea
                                            value={getEmailTemplate()}
                                            readOnly
                                            className="w-full h-40 p-3 text-sm border rounded-md bg-muted/50 resize-none"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-2 right-2"
                                            onClick={async () => {
                                                await navigator.clipboard.writeText(getEmailTemplate())
                                            }}
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                            Close
                        </Button>
                        <Button onClick={() => window.open(publicUrl, '_blank')} disabled={!publicUrl}>
                            Preview Link
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
