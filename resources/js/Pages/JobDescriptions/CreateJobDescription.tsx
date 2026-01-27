import { Head, router } from '@inertiajs/react'
import { BackButton } from '@/components/BackButton'
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
            <Head title="Create Job Description" />

            <div className="max-w-4xl mx-auto py-8 md:pt-12 px-4 space-y-6">
                {/* Back Button */}
                <div>
                    <BackButton fallback="/job-descriptions" label="Back" />
                </div>

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">
                        Create Job Description
                    </h1>
                    <p className="text-muted-foreground">
                        Define the role details that will be used for interviews.
                    </p>
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
