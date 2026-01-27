import { Head, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { BackButton } from '@/components/BackButton'
import {
    Users,
    FileText,
    Mail,
    Phone,
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
    MoreVertical,
    Loader2,
    Briefcase,
    Search
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Candidate {
    id: string
    name: string
    email: string
    phone: string | null
}

interface JobDescription {
    id: string
    title: string
    company_name: string
}

interface Application {
    id: string
    candidate: Candidate
    job_description: JobDescription
    status: string
    status_label: string
    status_color: string
    cover_letter: string | null
    applied_at: string
    source: string
}

interface Props {
    applications: Application[]
}

export default function AllApplications({ applications: initialApplications }: Props) {
    const [applications, setApplications] = useState<Application[]>(initialApplications)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [coverLetterDialog, setCoverLetterDialog] = useState<{ open: boolean, content: string | null }>({
        open: false,
        content: null
    })

    const updateStatus = async (applicationId: string, newStatus: string) => {
        setUpdatingId(applicationId)
        try {
            const response = await window.axios.patch(`/api/applications/${applicationId}/status`, {
                status: newStatus
            })

            if (response.data.success) {
                setApplications(prev => prev.map(app =>
                    app.id === applicationId
                        ? {
                            ...app,
                            status: newStatus,
                            status_label: response.data.status_label,
                            status_color: response.data.status_color
                        }
                        : app
                ))
            }
        } catch (error) {
            console.error('Failed to update status:', error)
        } finally {
            setUpdatingId(null)
        }
    }

    const getStatusBadge = (app: Application) => {
        const colorMap: Record<string, string> = {
            'applied': 'bg-blue-500/10 text-blue-700 border-blue-200',
            'under_review': 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
            'shortlisted': 'bg-green-500/10 text-green-700 border-green-200',
            'rejected': 'bg-red-500/10 text-red-700 border-red-200',
        }
        return colorMap[app.status] || 'bg-gray-500/10 text-gray-700'
    }

    // Filter applications
    const filteredApplications = applications.filter(app => {
        const matchesSearch = searchQuery === '' ||
            app.candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.job_description.title.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === 'all' || app.status === statusFilter

        return matchesSearch && matchesStatus
    })

    // Group by status for counts
    const statusCounts = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title="All Applications" />

            <div className="max-w-7xl mx-auto py-8 md:pt-12 px-4 md:px-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-3">
                            <Users className="h-6 w-6 text-primary/80" />
                            All Applications
                        </h1>
                        <p className="text-muted-foreground">
                            View and manage applications across all job postings.
                        </p>
                    </div>
                    <BackButton fallback="/job-descriptions" label="Back" variant="outline" />
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="px-3 py-1">
                        {applications.length} total
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 bg-blue-500/10 text-blue-700 border-blue-200">
                        {statusCounts['applied'] || 0} new
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 bg-yellow-500/10 text-yellow-700 border-yellow-200">
                        {statusCounts['under_review'] || 0} reviewing
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 bg-green-500/10 text-green-700 border-green-200">
                        {statusCounts['shortlisted'] || 0} shortlisted
                    </Badge>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or job title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="under_review">Under Review</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Applications List */}
                {filteredApplications.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                                {applications.length === 0 ? 'No applications yet' : 'No matching applications'}
                            </h3>
                            <p className="text-muted-foreground text-center mb-4">
                                {applications.length === 0
                                    ? 'Share your job links to start receiving applications.'
                                    : 'Try adjusting your search or filters.'}
                            </p>
                            {applications.length === 0 && (
                                <Link href="/job-descriptions" className={buttonVariants({ variant: "outline" })}>
                                    Go to Job Descriptions
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredApplications.map((app) => (
                            <Card key={app.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6 space-y-4">
                                    {/* Header with Name and Status */}
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-semibold">{app.candidate.name}</h3>
                                            <Badge
                                                variant="outline"
                                                className={getStatusBadge(app)}
                                            >
                                                {app.status_label}
                                            </Badge>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={updatingId === app.id}>
                                                    {updatingId === app.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <MoreVertical className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => updateStatus(app.id, 'under_review')}
                                                    disabled={app.status === 'under_review'}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Mark as Under Review
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => updateStatus(app.id, 'shortlisted')}
                                                    disabled={app.status === 'shortlisted'}
                                                >
                                                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                                    Shortlist
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => updateStatus(app.id, 'rejected')}
                                                    disabled={app.status === 'rejected'}
                                                    className="text-destructive"
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Reject
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Job Info */}
                                    <div className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-2 rounded-md">
                                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                                        <Link
                                            href={`/job-descriptions/${app.job_description.id}/applications`}
                                            className="hover:text-primary truncate"
                                        >
                                            {app.job_description.title}
                                        </Link>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        <a
                                            href={`mailto:${app.candidate.email}`}
                                            className="flex items-center gap-1 hover:text-foreground truncate"
                                        >
                                            <Mail className="h-3 w-3 shrink-0" />
                                            {app.candidate.email}
                                        </a>
                                        {app.candidate.phone && (
                                            <a
                                                href={`tel:${app.candidate.phone}`}
                                                className="flex items-center gap-1 hover:text-foreground"
                                            >
                                                <Phone className="h-3 w-3" />
                                                {app.candidate.phone}
                                            </a>
                                        )}
                                    </div>

                                    {/* Applied Date */}
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>Applied {app.applied_at}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                        {app.cover_letter && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => setCoverLetterDialog({ open: true, content: app.cover_letter })}
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                Letter
                                            </Button>
                                        )}
                                        <Link href={`/candidates/${app.candidate.id}`} className={app.cover_letter ? '' : 'col-span-2'}>
                                            <Button variant="outline" size="sm" className="w-full">
                                                <Briefcase className="h-4 w-4 mr-2" />
                                                Profile
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Cover Letter Dialog */}
            <Dialog open={coverLetterDialog.open} onOpenChange={(open) => setCoverLetterDialog({ open, content: open ? coverLetterDialog.content : null })}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Cover Letter</DialogTitle>
                        <DialogDescription>
                            The candidate's cover letter for this application.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-md max-h-96 overflow-y-auto">
                            {coverLetterDialog.content}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
