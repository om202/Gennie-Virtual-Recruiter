import { Head, Link, router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import CandidateForm from './Components/CandidateForm'
import { ArrowLeft } from 'lucide-react'

export default function CreateCandidate() {

    const handleSuccess = () => {
        router.visit('/candidates')
    }

    const handleCancel = () => {
        router.visit('/candidates')
    }

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title="Add Candidate" />

            <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
                {/* Back Button */}
                <div>
                    <Link href="/candidates">
                        <Button variant="ghost" className="pl-0 gap-2 hover:bg-transparent hover:underline">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Candidates
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add Candidate</h1>
                    <p className="text-muted-foreground">
                        Create a complete candidate profile or upload a resume to auto-fill.
                    </p>
                </div>

                <CandidateForm
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    )
}
