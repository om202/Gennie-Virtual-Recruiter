import { Head, router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { JobDescriptionForm } from '@/components/JobDescriptionForm'

interface CreateJobDescriptionProps {
    auth: {
        user: {
            name: string
            email: string
            avatar: string
            company_name: string
            phone: string
        }
    }
    defaultCompanyName: string
}

export default function CreateJobDescription({ defaultCompanyName }: CreateJobDescriptionProps) {
    return (
        <div className="min-h-screen bg-muted/50">
            <Head title="Create Job Description - Gennie AI Recruiter" />

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
                {/* Back Button & Title */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.visit('/job-descriptions')}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create Job Description</h1>
                        <p className="text-muted-foreground text-sm">
                            Define the role details that will be used for interviews.
                        </p>
                    </div>
                </div>

                <JobDescriptionForm
                    defaultCompanyName={defaultCompanyName}
                    onSuccess={() => router.visit('/job-descriptions')}
                    onCancel={() => router.visit('/job-descriptions')}
                />
            </div>
        </div>
    )
}
