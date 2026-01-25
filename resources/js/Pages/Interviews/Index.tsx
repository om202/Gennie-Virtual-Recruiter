import { Head, router, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Clock, Briefcase, Calendar, Pencil, History, AlertCircle, Trash2, Eye, Mic, Link2, Copy, Check, Mail } from 'lucide-react'

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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'



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

    // Share dialog state
    const [shareDialogOpen, setShareDialogOpen] = useState(false)
    const [shareInterview, setShareInterview] = useState<Interview | null>(null)
    const [shareUrl, setShareUrl] = useState<string>('')
    const [copiedLink, setCopiedLink] = useState(false)
    const [copiedEmail, setCopiedEmail] = useState(false)
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

    const handleOpenShareDialog = async (interview: Interview) => {
        try {
            // Call API to enable public link and get URL
            const res = await window.axios.post(`/interviews/${interview.id}/enable-public-link`)
            const publicUrl = res.data.url

            // Update local state
            setInterviews(interviews.map(i =>
                i.id === interview.id
                    ? { ...i, public_token: res.data.token, public_link_enabled: true }
                    : i
            ))

            // Open share dialog
            setShareInterview(interview)
            setShareUrl(publicUrl)
            setShareDialogOpen(true)
            setCopiedLink(false)
            setCopiedEmail(false)
        } catch (error) {
            console.error("Failed to generate link:", error)
            alert('Failed to generate public link. Please try again.')
        }
    }

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(shareUrl)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
    }

    const generateEmailTemplate = (interview: Interview, url: string) => {
        return `Hi,

You have been invited to complete an AI-powered screening interview for the ${interview.job_title} position at ${interview.company_name}.

Interview Details:
• Position: ${interview.job_title}
• Company: ${interview.company_name}
• Duration: ~${interview.duration_minutes} minutes
• Type: ${interview.interview_type.charAt(0).toUpperCase() + interview.interview_type.slice(1)} Interview

Please click the link below to start your interview:
${url}

Note: You can complete this interview at any time that works for you. Make sure you're in a quiet environment with a stable internet connection.

Best regards,
${interview.company_name} Hiring Team`
    }

    const handleCopyEmailTemplate = async () => {
        if (!shareInterview) return
        const template = generateEmailTemplate(shareInterview, shareUrl)
        await navigator.clipboard.writeText(template)
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2000)
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
                                                    onClick={() => handleOpenSchedule(interview.id)}
                                                    title="Schedule Interview"
                                                >
                                                    <Calendar className="h-4 w-4" />
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
                                                onClick={() => handleOpenShareDialog(interview)}
                                                disabled={!interview.job_description_id}
                                            >
                                                <Link2 className="h-4 w-4 mr-2" />
                                                Share Link
                                            </Button>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => handleStartInterview(interview)}
                                                    disabled={interview.status === 'archived' || !interview.job_description_id}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Preview
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

            {/* Share Link Dialog */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-primary">
                            <Link2 className="h-5 w-5" />
                            Share Interview Link
                        </DialogTitle>
                        <DialogDescription>
                            Share this link with candidates to allow them to complete the interview.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Interview Info */}
                        {shareInterview && (
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                                <p className="font-semibold text-primary">{shareInterview.job_title}</p>
                                <p className="text-sm text-muted-foreground">{shareInterview.company_name} • {shareInterview.duration_minutes} min</p>
                            </div>
                        )}

                        {/* Copy Link Section */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Interview Link</Label>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-muted rounded-md px-4 py-3 text-sm font-mono break-all border">
                                    {shareUrl}
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
                                value={shareInterview ? generateEmailTemplate(shareInterview, shareUrl) : ''}
                            />
                        </div>

                        {/* Schedule Section */}
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
                            onClick={() => {
                                setShareDialogOpen(false)
                                if (shareInterview) {
                                    handleOpenSchedule(shareInterview.id)
                                }
                            }}
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule with a Candidate
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    )
}
