import { Head, router, Link } from '@inertiajs/react'
import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, Pencil, Trash2 } from 'lucide-react'
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


interface ScheduledInterview {
    id: string
    interview: {
        job_title: string
        company_name: string
    }
    candidate: {
        id: string
        name: string
        email: string
    }
    scheduled_at: string
    status: string
    meeting_link: string | null
}

interface Candidate {
    id: string
    name: string
    email: string
}

interface Interview {
    id: string
    job_title: string
}

interface IndexProps {
    auth: any
    scheduledInterviews: ScheduledInterview[]
    candidates: Candidate[]
    interviews: Interview[]
}

export default function SchedulesIndex({ scheduledInterviews }: IndexProps) {
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [scheduleToDelete, setScheduleToDelete] = useState<ScheduledInterview | null>(null)

    const confirmDelete = (schedule: ScheduledInterview) => {
        setScheduleToDelete(schedule)
        setDeleteConfirmationOpen(true)
    }

    const handleDelete = () => {
        if (!scheduleToDelete) return
        router.delete(`/schedules/${scheduleToDelete.id}`)
        setDeleteConfirmationOpen(false)
        setScheduleToDelete(null)
    }


    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never'
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        })
    }

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title="Schedules" />

            <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Schedules</h1>
                        <p className="text-muted-foreground">
                            Manage your upcoming interviews.
                        </p>
                    </div>
                    {scheduledInterviews.length > 0 && (
                        <Link href="/schedules/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Schedule New
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    {scheduledInterviews.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium mb-2">No scheduled interviews</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Schedule interviews to appear here.
                                </p>
                                <Link href="/schedules/create">
                                    <Button>
                                        Schedule Your First Interview
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {/* Group by date logic could go here, for now simple list */}
                            <Card>
                                <CardContent className="p-0">
                                    {scheduledInterviews.map((schedule, i) => (
                                        <div key={schedule.id} className={`flex flex-col md:flex-row md:items-center justify-between p-6 gap-4 hover:bg-muted/50 transition-colors ${i !== scheduledInterviews.length - 1 ? 'border-b' : ''}`}>
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                                                    <Calendar className="h-6 w-6" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-semibold leading-none tracking-tight">{schedule.candidate.name}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Applying for <span className="font-medium text-foreground">{schedule.interview.job_title}</span>
                                                    </p>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Badge variant="outline">{schedule.status}</Badge>
                                                        <span>•</span>
                                                        <span>{formatDate(schedule.scheduled_at)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 self-end md:self-center">
                                                <Link href={`/schedules/${schedule.id}/edit`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                        title="Edit Schedule"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => confirmDelete(schedule)}
                                                    title="Cancel Interview"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this interview?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will cancel the scheduled interview for {scheduleToDelete?.candidate.name} on{' '}
                            {scheduleToDelete?.scheduled_at && format(new Date(scheduleToDelete.scheduled_at), "PPP 'at' p")}.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Schedule</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Cancel Interview
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    )
}
