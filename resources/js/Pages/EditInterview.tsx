import { Head, router } from '@inertiajs/react'
import { InterviewForm } from '@/components/InterviewForm'
import { BackButton } from '@/components/BackButton'

interface EditInterviewProps {
    auth: {
        user: {
            name: string
            company_name: string
        }
    }
    interview: any
}

export default function EditInterview({ auth, interview }: EditInterviewProps) {

    const handleSuccess = () => {
        router.visit('/dashboard')
    }

    const handleCancel = () => {
        router.visit('/dashboard')
    }

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title={`Edit - ${interview.job_title}`} />

            <div className="max-w-4xl mx-auto py-8 md:pt-12 px-4 space-y-6">
                <div>
                    <BackButton fallback="/interviews" label="Back" />
                </div>

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Edit Interview</h1>
                    <p className="text-muted-foreground">
                        Update configuration for {interview.job_title}
                    </p>
                </div>

                <InterviewForm
                    defaultCompanyName={auth.user.company_name}
                    initialData={interview}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    )
}
