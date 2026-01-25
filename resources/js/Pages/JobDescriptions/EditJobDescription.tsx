import { Head, Link, router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { JobDescriptionForm } from '@/components/JobDescriptionForm'

interface JobDescription {
    id: string
    title: string
    company_name: string
    description: string | null
    location: string | null
    remote_type: 'onsite' | 'hybrid' | 'remote'
    salary_min: number | null
    salary_max: number | null
    salary_currency: string
    salary_period: 'hourly' | 'monthly' | 'yearly'
    experience_years_min: number | null
    experience_years_max: number | null
    education_level: string | null
    skills: string[] | null
    employment_type: 'full-time' | 'part-time' | 'contract' | 'internship'
    benefits: string | null
}

interface EditJobDescriptionProps {
    auth: {
        user: {
            name: string
            email: string
        }
    }
    jobDescription: JobDescription
}

export default function EditJobDescription({ jobDescription }: EditJobDescriptionProps) {
    return (
        <div className="min-h-screen bg-muted/50">
            <Head title={`Edit ${jobDescription.title}`} />

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
                    <h1 className="text-2xl font-bold tracking-tight text-primary">
                        Edit Job Description
                    </h1>
                    <p className="text-muted-foreground">
                        Update the details for {jobDescription.title}.
                    </p>
                </div>

                <JobDescriptionForm
                    initialData={jobDescription}
                    onSuccess={() => router.visit('/job-descriptions')}
                    onCancel={() => router.visit('/job-descriptions')}
                />
            </div>
        </div>
    )
}
