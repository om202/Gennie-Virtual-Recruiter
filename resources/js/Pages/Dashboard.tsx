import { Head, router, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GennieInterface } from '@/components/GennieInterface'
import { Plus, Play, Clock, Briefcase, Calendar, MoreVertical, Pencil, Trash2, History, AlertCircle } from 'lucide-react'
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
    location: string | null
    remote_type: 'onsite' | 'hybrid' | 'remote'
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
}

export default function Dashboard({ auth, interviews: initialInterviews }: DashboardProps) {
    const [interviews, setInterviews] = useState<Interview[]>(initialInterviews)
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [interviewToDelete, setInterviewToDelete] = useState<Interview | null>(null)

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

    const handleStartInterview = (interview: Interview) => {
        // Navigate to start interview session
        router.visit(`/interviews/${interview.id}/start`)
    }

    const handleCloseInterview = () => {
        setActiveSessionId(null)
    }

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            screening: 'bg-blue-100 text-blue-800',
            technical: 'bg-purple-100 text-purple-800',
            behavioral: 'bg-green-100 text-green-800',
            final: 'bg-orange-100 text-orange-800',
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
            <Head title="Dashboard - Gennie AI Recruiter" />

            <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Welcome back, {auth.user.name}. Manage your interviews here.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                {activeSessionId ? (
                    <GennieInterface
                        sessionId={activeSessionId}
                        onClose={handleCloseInterview}
                    />
                ) : (
                    <div className="space-y-6">
                        {/* Actions Bar - Only show when there are interviews */}
                        {interviews.length > 0 && (
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Your Interviews</h2>
                                <Link href="/interviews/create" className={buttonVariants()}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Interview
                                </Link>
                            </div>
                        )}

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
                                                <div className="flex items-center gap-2">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <Link href={`/interviews/${interview.id}/logs`}>
                                                                <DropdownMenuItem>
                                                                    <History className="h-4 w-4 mr-2" />
                                                                    View Logs
                                                                </DropdownMenuItem>
                                                            </Link>
                                                            <Link href={`/interviews/${interview.id}/edit`}>
                                                                <DropdownMenuItem>
                                                                    <Pencil className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            </Link>
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => confirmDelete(interview)}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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
                                            <Button
                                                className="w-full"
                                                onClick={() => handleStartInterview(interview)}
                                                disabled={interview.status === 'archived' || !interview.job_description_id}
                                            >
                                                <Play className="h-4 w-4 mr-2" />
                                                Start Interview
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
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
