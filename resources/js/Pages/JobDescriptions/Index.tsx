import { Head, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Briefcase, MapPin, Building2, Users, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
            onsite: 'bg-blue-100 text-blue-800',
            hybrid: 'bg-purple-100 text-purple-800',
            remote: 'bg-green-100 text-green-800',
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

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title="Job Descriptions - Gennie AI Recruiter" />

            <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Job Descriptions</h1>
                        <p className="text-muted-foreground">
                            Create and manage job postings for your interviews.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    {/* Actions Bar */}
                    {jobDescriptions.length > 0 && (
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">
                                {jobDescriptions.length} job description{jobDescriptions.length !== 1 ? 's' : ''}
                            </p>
                            <Link href="/job-descriptions/create" className={buttonVariants()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Job Description
                            </Link>
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
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <Link href={`/job-descriptions/${job.id}/edit`}>
                                                        <DropdownMenuItem>
                                                            <Pencil className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => confirmDelete(job)}
                                                        disabled={job.interviews_count > 0}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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

                                        {/* Interview Count */}
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground pt-2 border-t">
                                            <Users className="h-3 w-3" />
                                            <span>{job.interviews_count} interview{job.interviews_count !== 1 ? 's' : ''} using this JD</span>
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
        </div>
    )
}
