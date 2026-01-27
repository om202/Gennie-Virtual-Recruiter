import { Head, router } from '@inertiajs/react'
import { InterviewForm } from '@/components/InterviewForm'
import { BackButton } from '@/components/BackButton'

interface CreateInterviewProps {
    auth: {
        user: {
            name: string
            company_name: string
        }
    }
}

export default function CreateInterview({ auth }: CreateInterviewProps) {

    const handleSuccess = () => {
        router.visit('/dashboard')
    }

    const handleCancel = () => {
        router.visit('/dashboard')
    }

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title="Create Interview" />

            <div className="max-w-4xl mx-auto py-8 md:pt-12 px-4 space-y-6">
                <div>
                    <BackButton fallback="/interviews" label="Back" />
                </div>

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Create Interview</h1>
                    <p className="text-muted-foreground">
                        Set up a new interview configuration.
                    </p>
                </div>

                <InterviewForm
                    defaultCompanyName={auth.user.company_name}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    )
}
