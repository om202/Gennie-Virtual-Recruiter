import { Head, router, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GennieInterface } from '@/components/GennieInterface'
import { CreateInterviewDialog } from '@/components/CreateInterviewDialog'
import { Plus, Phone, Play, Clock, Briefcase, Calendar, Settings } from 'lucide-react'

interface Interview {
    id: string
    job_title: string
    company_name: string
    job_description: string | null
    duration_minutes: number
    interview_type: 'screening' | 'technical' | 'behavioral' | 'final'
    difficulty_level: 'entry' | 'mid' | 'senior' | 'executive'
    status: 'draft' | 'active' | 'archived'
    total_sessions: number
    last_session_at: string | null
    created_at: string
    updated_at: string
}

interface DashboardProps {
    auth: {
        user: {
            name: string
            email: string
            avatar: string
            company_name: string
            phone: string
        }
    }
    interviews: Interview[]
}

export default function Dashboard({ auth, interviews: initialInterviews }: DashboardProps) {
    const [interviews, setInterviews] = useState<Interview[]>(initialInterviews)
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)

    const handleInterviewCreated = (interview: Interview) => {
        setInterviews([interview, ...interviews])
    }

    const handleStartInterview = (interview: Interview) => {
        // Navigate to start interview session
        router.visit(`/interviews/${interview.id}/start`)
    }

    const handleCloseInterview = () => {
        setActiveSessionId(null)
    }

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            screening: 'bg-blue-100 text-blue-800',
            technical: 'bg-purple-100 text-purple-800',
            behavioral: 'bg-green-100 text-green-800',
            final: 'bg-orange-100 text-orange-800',
        }
        return colors[type] || 'bg-gray-100 text-gray-800'
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'bg-yellow-100 text-yellow-800',
            active: 'bg-green-100 text-green-800',
            archived: 'bg-gray-100 text-gray-800',
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        })
    }

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title="Dashboard" />

            <div className="container mx-auto py-8 px-4 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Welcome back, {auth.user.name}. Manage your interviews here.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* User Info */}
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="font-medium text-sm">{auth.user.company_name}</div>
                                <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    {auth.user.phone}
                                </div>
                            </div>
                            <Link href="/profile">
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Settings className="h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                {activeSessionId ? (
                    <GennieInterface
                        sessionId={activeSessionId}
                        onClose={handleCloseInterview}
                    />
                ) : (
                    <div className="space-y-6">
                        {/* Actions Bar - Only show when there are interviews */}
                        {interviews.length > 0 && (
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Your Interviews</h2>
                                <Button onClick={() => setCreateDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Interview
                                </Button>
                            </div>
                        )}

                        {/* Interview Grid */}
                        {interviews.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No interviews yet</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                        Create your first interview to get started with Gennie.
                                    </p>
                                    <Button onClick={() => setCreateDialogOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First Interview
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {interviews.map((interview) => (
                                    <Card key={interview.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-lg leading-tight">
                                                        {interview.job_title}
                                                    </CardTitle>
                                                    <CardDescription>{interview.company_name}</CardDescription>
                                                </div>
                                                <Badge className={getStatusColor(interview.status)}>
                                                    {interview.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline" className={getTypeColor(interview.interview_type)}>
                                                    {interview.interview_type}
                                                </Badge>
                                                <Badge variant="outline">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {interview.duration_minutes}m
                                                </Badge>
                                                <Badge variant="outline">
                                                    {interview.difficulty_level}
                                                </Badge>
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{interview.total_sessions} sessions</span>
                                                </div>
                                                <span>Last: {formatDate(interview.last_session_at)}</span>
                                            </div>

                                            {/* Actions */}
                                            <Button
                                                className="w-full"
                                                onClick={() => handleStartInterview(interview)}
                                                disabled={interview.status === 'archived'}
                                            >
                                                <Play className="h-4 w-4 mr-2" />
                                                Start Interview
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Interview Dialog */}
            <CreateInterviewDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                defaultCompanyName={auth.user.company_name}
                onSuccess={handleInterviewCreated}
            />
        </div>
    )
}
