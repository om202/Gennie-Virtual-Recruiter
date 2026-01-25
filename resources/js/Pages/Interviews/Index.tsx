import { Head, router, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Clock, Briefcase, Calendar, Pencil, History, AlertCircle, Trash2, Copy, Check, Eye, Mic } from 'lucide-react'

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
    location: string | null
    remote_type: 'onsite' | 'hybrid' | 'remote'
}



interface Candidate {
    id: string
    name: string
    email: string
}

interface Interview {
    id: string
    job_description_id: string | null
    job_title: string
    company_name: string
    job_description: string | null
    duration_minutes: number
    interview_type: 'screening' | 'technical' | 'behavioral' | 'final'
    difficulty_level: 'entry' | 'mid' | 'senior' | 'executive'
    status: 'draft' | 'active' | 'archived'
    total_sessions: number
    last_session_at: string | null
    created_at: string
    updated_at: string
    job_description_relation?: JobDescription
    public_token?: string | null
    public_link_enabled?: boolean
}

interface DashboardProps {
    auth: {
        user: {
            name: string
            email: string
            avatar: string
            company_name: string
            phone: string
        }
    }
    interviews: Interview[]
    candidates: Candidate[]
}

export default function InterviewsIndex({ interviews: initialInterviews }: DashboardProps) {
    const [interviews, setInterviews] = useState<Interview[]>(initialInterviews)
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [interviewToDelete, setInterviewToDelete] = useState<Interview | null>(null)
    const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null)
    const handleOpenSchedule = (interviewId?: string) => {
        if (interviewId) {
            router.visit(`/schedules/create?interview_id=${interviewId}`)
        } else {
            router.visit('/schedules/create')
        }
    }

    const confirmDelete = (interview: Interview) => {
        setInterviewToDelete(interview)
        setDeleteConfirmationOpen(true)
    }

    const handleDeleteInterview = async () => {
        if (!interviewToDelete) return

        try {
            await window.axios.delete(`/interviews/${interviewToDelete.id}`)
            setInterviews(interviews.filter(i => i.id !== interviewToDelete.id))
            setDeleteConfirmationOpen(false)
            setInterviewToDelete(null)
        } catch (error) {
            console.error("Failed to delete interview:", error)
        }
    }

    const handleCopyLink = async (interview: Interview) => {
        try {
            // Call API to enable public link and get URL
            const res = await window.axios.post(`/interviews/${interview.id}/enable-public-link`)
            const publicUrl = res.data.url

            // Copy to clipboard
            await navigator.clipboard.writeText(publicUrl)

            // Show feedback
            setCopiedLinkId(interview.id)
            setTimeout(() => setCopiedLinkId(null), 2000)

            // Update local state
            setInterviews(interviews.map(i =>
                i.id === interview.id
                    ? { ...i, public_token: res.data.token, public_link_enabled: true }
                    : i
            ))
        } catch (error) {
            console.error("Failed to copy link:", error)
            alert('Failed to generate public link. Please try again.')
        }
    }

    const handleStartInterview = async (interview: Interview) => {
        try {
            // Ensure public link is enabled and get the URL
            const res = await window.axios.post(`/interviews/${interview.id}/enable-public-link`)
            const publicUrl = res.data.url

            // Navigate to the public interview page (will detect self-preview)
            window.location.href = publicUrl
        } catch (error) {
            console.error("Failed to start preview:", error)
            alert('Failed to start preview. Please try again.')
        }
    }

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            screening: 'bg-primary/10 text-primary',
            technical: 'bg-purple-500/10 text-purple-700',
            behavioral: 'bg-green-500/10 text-green-700',
            final: 'bg-orange-500/10 text-orange-700',
        }
        return colors[type] || 'bg-gray-100 text-gray-800'
    }


    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        })
    }

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title="Interviews" />

            <div className="max-w-7xl mx-auto py-8 md:pt-12 px-4 md:px-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
                            <Mic className="h-7 w-7 text-primary/80" />
                            Interviews
                        </h1>
                        <p className="text-muted-foreground">
                            Create and manage your interview configurations.
                        </p>
                    </div>
                    {interviews.length > 0 && (
                        <Link href="/interviews/create" className={buttonVariants({ className: "w-full md:w-auto" })}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Interview
                        </Link>
                    )}
                </div>

                {/* Main Content */}
                <>

                    {/* Interview Grid */}
                    {interviews.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium mb-2">No interviews yet</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Create your first interview to get started with Gennie.
                                </p>
                                <Link href="/interviews/create" className={buttonVariants()}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Your First Interview
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {interviews.map((interview) => (
                                <Card key={interview.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg leading-tight flex items-center justify-between gap-2">
                                                    <span>{interview.job_title}</span>
                                                </CardTitle>
                                                <CardDescription>{interview.company_name}</CardDescription>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={() => handleCopyLink(interview)}
                                                    title="Copy Public Link"
                                                    disabled={!interview.job_description_id}
                                                >
                                                    {copiedLinkId === interview.id ? (
                                                        <Check className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Link href={`/interviews/${interview.id}/edit`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                        title="Edit Interview"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => confirmDelete(interview)}
                                                    title="Delete Interview"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Legacy Interview Warning */}
                                        {!interview.job_description_id && (
                                            <div className="flex items-center gap-2 text-sm bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200 px-3 py-2 rounded-md">
                                                <AlertCircle className="h-4 w-4 shrink-0" />
                                                <span>No JD linked</span>
                                                <Link href={`/interviews/${interview.id}/edit`} className="ml-auto text-xs underline underline-offset-2 hover:no-underline">
                                                    Link Now
                                                </Link>
                                            </div>
                                        )}

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className={getTypeColor(interview.interview_type)}>
                                                {interview.interview_type}
                                            </Badge>
                                            <Badge variant="outline">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {interview.duration_minutes}m
                                            </Badge>
                                            <Badge variant="outline">
                                                {interview.difficulty_level}
                                            </Badge>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{interview.total_sessions} sessions</span>
                                            </div>
                                            <span>Last: {formatDate(interview.last_session_at)}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="space-y-2">
                                            <Button
                                                variant="outlinePrimary"
                                                className="w-full"
                                                onClick={() => handleStartInterview(interview)}
                                                disabled={interview.status === 'archived' || !interview.job_description_id}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Preview Interview
                                            </Button>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => handleOpenSchedule(interview.id)}
                                                >
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    Schedule
                                                </Button>
                                                <Link href={`/interviews/${interview.id}/logs`}>
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <History className="h-4 w-4 mr-2" />
                                                        View Logs
                                                    </Button>
                                                </Link>
                                            </div>
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
                            This will permanently delete the interview "{interviewToDelete?.job_title}" and all its session history.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteInterview}
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
