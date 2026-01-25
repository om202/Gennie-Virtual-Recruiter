import { Head, Link, router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { ScheduleForm } from '@/components/ScheduleForm'
import { ArrowLeft } from 'lucide-react'

interface Candidate {
    id: string
    name: string
    email: string
}

interface Interview {
    id: string
    job_title: string
}

interface Schedule {
    id: string
    interview_id: string
    candidate_id: string
    scheduled_at: string
    interview: Interview
    candidate: Candidate
}

interface ScheduleInterviewProps {
    candidates: Candidate[]
    interviews: Interview[]
    interview?: Interview | null
    schedule?: Schedule | null
}

export default function ScheduleInterview({ candidates, interviews, interview, schedule }: ScheduleInterviewProps) {
    const isEditing = !!schedule

    const handleSuccess = () => {
        router.visit('/schedules', {
            preserveState: false,
            preserveScroll: false,
        })
    }

    const handleCancel = () => {
        router.visit('/schedules')
    }

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title={isEditing ? 'Edit Schedule' : 'Schedule Interview'} />

            <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
                {/* Back Button */}
                <div>
                    <Link href="/schedules">
                        <Button variant="ghost" className="pl-0 gap-2 hover:bg-transparent hover:underline">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Schedules
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">
                        {isEditing ? 'Edit Schedule' : 'Schedule Interview'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditing
                            ? 'Update the interview schedule details.'
                            : 'Set up a time for a candidate to take an interview.'
                        }
                    </p>
                </div>

                <ScheduleForm
                    schedule={schedule}
                    interviewId={interview?.id || schedule?.interview_id}
                    candidates={candidates}
                    interviews={interviews}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    )
}
