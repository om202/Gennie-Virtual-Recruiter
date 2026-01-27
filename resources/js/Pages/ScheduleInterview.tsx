import { Head, router } from '@inertiajs/react'
import { ScheduleForm } from '@/components/ScheduleForm'
import { BackButton } from '@/components/BackButton'

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
    userTimezone?: string
    userTimezoneLabel?: string
}

export default function ScheduleInterview({ candidates, interviews, interview, schedule, userTimezoneLabel }: ScheduleInterviewProps) {
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

            <div className="max-w-4xl mx-auto py-8 md:pt-12 px-4 space-y-6">
                <div>
                    <BackButton fallback="/schedules" label="Back" />
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
                    timezoneLabel={userTimezoneLabel}
                />
            </div>
        </div>
    )
}
