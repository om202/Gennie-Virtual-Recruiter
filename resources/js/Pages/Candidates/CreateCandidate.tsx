import { Head, Link, router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import CandidateForm from './Components/CandidateForm'
import { ArrowLeft } from 'lucide-react'

interface CreateCandidateProps {
    candidate?: any;
}

export default function CreateCandidate({ candidate }: CreateCandidateProps) {
    const isEditing = !!candidate;

    const handleSuccess = () => {
        router.visit('/candidates', {
            preserveState: false,
            preserveScroll: false,
        })
    }

    const handleCancel = () => {
        router.visit('/candidates')
    }

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title={isEditing ? `Edit ${candidate.name}` : 'Add Candidate'} />

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
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
                    <h1 className="text-2xl font-bold tracking-tight text-primary">
                        {isEditing ? 'Edit Candidate' : 'Add Candidate'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditing
                            ? 'Update candidate information and profile details.'
                            : 'Create a complete candidate profile or upload a resume to auto-fill.'
                        }
                    </p>
                </div>

                <CandidateForm
                    candidate={candidate}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    )
}
