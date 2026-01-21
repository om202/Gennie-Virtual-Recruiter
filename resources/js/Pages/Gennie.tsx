import { Head, router, Link } from '@inertiajs/react'
import { GennieInterface } from '@/components/GennieInterface'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Briefcase, Clock, Building2 } from 'lucide-react'

interface Interview {
    id: string
    job_title: string
    company_name: string
    duration_minutes: number
    interview_type: string
    difficulty_level: string
}

interface GennietProps {
    sessionId: string
    interview: Interview
}

export default function Gennie({ sessionId, interview }: GennietProps) {
    const handleClose = () => {
        router.visit('/dashboard')
    }

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title={`Interview: ${interview.job_title}`} />

            {/* Header */}
            <div className="bg-background border-b">
                <div className="max-w-7xl mx-auto py-4 px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-xl font-bold flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                    {interview.job_title}
                                </h1>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Building2 className="h-4 w-4" />
                                        {interview.company_name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {interview.duration_minutes} min
                                    </span>
                                    <span className="capitalize">{interview.interview_type}</span>
                                </div>
                            </div>
                        </div>
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-8 px-4">
                <GennieInterface sessionId={sessionId} onClose={handleClose} />
            </div>
        </div>
    )
}
