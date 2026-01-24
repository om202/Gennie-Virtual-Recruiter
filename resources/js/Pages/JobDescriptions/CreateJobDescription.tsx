import { Head, Link, router } from '@inertiajs/react'
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

            <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
                {/* Back Button */}
                <div>
                    <Link href="/job-descriptions">
                        <Button variant="ghost" className="pl-0 gap-2 hover:bg-transparent hover:underline">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Job Descriptions
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
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
