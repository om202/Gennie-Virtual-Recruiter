import { Head, Link, router } from '@inertiajs/react'

import { Button } from '@/components/ui/button'
import { InterviewForm } from '@/components/InterviewForm'
import { ArrowLeft } from 'lucide-react'

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
                {/* Header with Back Button */}
                {/* Back Button */}
                <div>
                    <Link href="/dashboard">
                        <Button variant="ghost" className="pl-0 gap-2 hover:bg-transparent hover:underline">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
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
