import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Briefcase, Building2, Clock, Calendar } from 'lucide-react'
import { Scorecard } from '@/components/Analysis/Scorecard'

interface Session {
    id: string
    status: string
    created_at: string
    metadata: any
    progress_state: any
    analysis_status: 'pending' | 'processing' | 'completed' | 'failed'
    analysis_result: any
}

interface Interview {
    id: string
    job_title: string
    company_name: string
    duration_minutes?: number
    interview_type?: string
    difficulty_level?: string
}

interface AssessmentReportDialogProps {
    open: boolean
    onClose: () => void
    interview: Interview
    session: Session
}

export function AssessmentReportDialog({ open, onClose, interview, session }: AssessmentReportDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-y-auto p-0">
                {/* Header with shadcn pattern */}
                <DialogHeader className="sticky top-0 bg-background border-b z-10 py-4 px-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2 mb-2">
                                <Briefcase className="h-5 w-5 text-primary flex-shrink-0" />
                                <span className="truncate">{interview.job_title}</span>
                            </DialogTitle>
                            <div className="flex items-center gap-4 text-base text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                    <Building2 className="h-4 w-4" />
                                    {interview.company_name}
                                </span>
                                {interview.duration_minutes && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {interview.duration_minutes} min
                                    </span>
                                )}
                                {interview.interview_type && (
                                    <span className="capitalize">{interview.interview_type}</span>
                                )}
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </DialogHeader>

                {/* Main Content */}
                <div className="py-8 px-6 space-y-6">
                    {/* Session Info Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Session Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-base">
                                <div>
                                    <div className="text-muted-foreground text-sm mb-1">Session ID</div>
                                    <div className="font-mono text-sm">{session.id.slice(0, 8)}...</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground text-sm mb-1">Date</div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        {new Date(session.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground text-sm mb-1">Time</div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground text-sm mb-1">Status</div>
                                    <div className="capitalize">{session.status}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Full Assessment Report */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Candidate Assessment Report</h2>
                        <Scorecard
                            result={session.analysis_result}
                            status={session.analysis_status}
                            mode="full"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
