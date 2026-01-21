import { Head } from '@inertiajs/react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { InterviewSetup } from '@/components/InterviewSetup'
import { GennieInterface } from '@/components/GennieInterface'
import { CircleDot, User, Phone } from 'lucide-react'

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
}

export default function Dashboard({ auth }: DashboardProps) {
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

    const handleInterviewSetupComplete = (sessionId: string) => {
        setActiveSessionId(sessionId)
    }

    const handleCloseInterview = () => {
        setActiveSessionId(null)
    }

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title="Dashboard" />

            <div className="container mx-auto py-8 px-4 space-y-8">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Welcome back, {auth.user.name}. Manage your interviews and settings here.
                        </p>
                    </div>
                    {/* User Profile Card (Mini) */}
                    <Card className="w-full md:w-auto min-w-[300px]">
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                {auth.user.avatar ? (
                                    <img src={auth.user.avatar} alt={auth.user.name} className="h-full w-full rounded-full" />
                                ) : (
                                    <User className="h-6 w-6" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold">{auth.user.company_name}</h3>
                                <div className="flex items-center text-sm text-muted-foreground gap-2">
                                    <Phone className="h-3 w-3" />
                                    {auth.user.phone}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                {activeSessionId ? (
                    /* Gennie Interface - Full Width when active */
                    <GennieInterface
                        sessionId={activeSessionId}
                        onClose={handleCloseInterview}
                    />
                ) : (
                    /* Setup & History Layout */
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Create New Interview */}
                        <div className="lg:col-span-2 space-y-6">
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <CircleDot className="h-5 w-5 text-primary" />
                                    <h2 className="text-xl font-semibold">Start New Interview</h2>
                                </div>

                                <InterviewSetup onComplete={handleInterviewSetupComplete} />
                            </section>
                        </div>

                        {/* Sidebar / Stats / History */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Interviews</CardTitle>
                                    <CardDescription>Your past interview sessions.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
                                        No interviews yet.
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
