import { Head, Link, router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { InterviewForm } from '@/components/InterviewForm'
import { ArrowLeft } from 'lucide-react'

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

            <div className="max-w-[90rem] mx-auto py-8 px-4 space-y-6">
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
                    <h1 className="text-2xl font-bold tracking-tight">Create Interview</h1>
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
