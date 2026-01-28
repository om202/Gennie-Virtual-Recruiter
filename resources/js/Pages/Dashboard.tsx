import { Head, Link } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
    Activity,
    Users,
    Briefcase,
    Plus,
    ArrowRight,
    Calendar,
    Mic,
    TrendingUp,
    LayoutDashboard,
    Phone,
    Globe,
    FileText,
    AlertTriangle,
    BookOpen
} from 'lucide-react'

interface DashboardProps {
    auth: {
        user: {
            name: string
            email: string
            avatar: string
            company_name: string
        }
    }
    stats: {
        activeInterviews: number
        totalCandidates: number
        totalSessions: number
    }
    recentActivity: Array<{
        id: string
        type: string
        title: string
        description: string
        status: string
        session_type: 'phone' | 'web'
        created_at: string
        link: string
    }>
    subscription: {
        plan_name: string
        plan_slug: string
        minutes_used: number
        minutes_included: number
        minutes_remaining: number
        percentage_used: number
        is_over_limit: boolean
    }
}

export default function Dashboard({ auth, stats, recentActivity, subscription }: DashboardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="min-h-screen bg-muted/50 pb-20">
            <Head title="Dashboard" />

            <div className="max-w-7xl mx-auto flex-1 space-y-6 p-4 md:p-8 pt-6 md:pt-12">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-3">
                            <LayoutDashboard className="h-6 w-6 text-primary/80" />
                            Welcome, {auth.user.name.split(' ')[0]}
                        </h2>
                        <p className="text-muted-foreground">
                            Here's what's happening with your recruiting pipeline today.
                        </p>
                    </div>
                    <Link href="/docs">
                        <Button variant="outline" size="sm" className="gap-2 w-full md:w-auto">
                            <BookOpen className="h-4 w-4" />
                            Read Gennie Docs
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Interviews
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeInterviews}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently accepting candidates
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Candidates
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
                            <p className="text-xs text-muted-foreground">
                                Across all roles
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Sessions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalSessions}</div>
                            <p className="text-xs text-muted-foreground">
                                Completed screening calls
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Minutes Used
                            </CardTitle>
                            <Link href="/subscription">
                                <Button variant="outline" size="sm">
                                    Manage Plan
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                const percentageUsed = subscription?.percentage_used || 0;
                                const isOverLimit = subscription?.is_over_limit || false;

                                let textColor = 'text-foreground';
                                if (isOverLimit || percentageUsed >= 90) {
                                    textColor = 'text-destructive';
                                } else if (percentageUsed >= 70) {
                                    textColor = 'text-amber-600 dark:text-amber-500';
                                } else if (percentageUsed >= 50) {
                                    textColor = 'text-primary';
                                } else {
                                    textColor = 'text-green-600 dark:text-green-500';
                                }

                                return (
                                    <>
                                        <div className="text-2xl font-bold">
                                            <span className={textColor}>{subscription?.minutes_used || 0}</span>
                                            <span className="text-foreground"> / {subscription?.minutes_included || 30}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {subscription?.plan_name || 'Free Trial'} Plan
                                        </p>
                                    </>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </div>

                {/* Usage Alert (if over limit) */}
                {subscription?.is_over_limit && (
                    <Card className="border-destructive bg-destructive/5">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-medium text-destructive">Free Trial Exhausted</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        You have used all your free trial minutes. Upgrade to continue conducting interviews.
                                    </p>
                                </div>
                                <Link href="/subscription">
                                    <Button size="sm" variant="destructive">Upgrade Now</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Recent Activity</CardTitle>
                                <Link
                                    href="/interviews/logs"
                                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                                >
                                    View all
                                    <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentActivity.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="rounded-full bg-muted p-4 mb-4">
                                        <Activity className="h-10 w-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-1">No activity yet</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        Start your first interview to see updates here.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentActivity.map((activity, index) => (
                                        <div key={activity.id}>
                                            <div className="flex items-start gap-4 group">
                                                <Avatar className={activity.status === 'completed' ? 'bg-primary/10' : 'bg-secondary'}>
                                                    <AvatarFallback className={activity.status === 'completed' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'}>
                                                        {activity.session_type === 'phone' ? (
                                                            <Phone className="h-4 w-4" />
                                                        ) : (
                                                            <Globe className="h-4 w-4" />
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium leading-none mb-1">
                                                                {activity.title}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                                {activity.description}
                                                            </p>
                                                        </div>
                                                        <Link
                                                            href={activity.link}
                                                            className={buttonVariants({
                                                                variant: "ghost",
                                                                size: "icon",
                                                                className: "shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            })}
                                                        >
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Link>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDate(activity.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {index < recentActivity.length - 1 && (
                                                <Separator className="mt-4" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Link href="/interviews/create">
                                <Button variant="outline" className="w-full justify-start h-auto py-3 px-4 hover:bg-accent hover:border-primary/50 transition-all group">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="rounded-md bg-primary/10 p-2 shrink-0">
                                            <Plus className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <span className="font-medium block">Create Interview</span>
                                            <span className="text-xs text-muted-foreground">Configure a new interview session</span>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Button>
                            </Link>
                            <Link href="/job-descriptions/create">
                                <Button variant="outline" className="w-full justify-start h-auto py-3 px-4 hover:bg-accent hover:border-primary/50 transition-all group">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="rounded-md bg-primary/10 p-2 shrink-0">
                                            <Briefcase className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <span className="font-medium block">Upload JD</span>
                                            <span className="text-xs text-muted-foreground">Import job requirements from PDF/Text</span>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Button>
                            </Link>
                            <Link href="/candidates">
                                <Button variant="outline" className="w-full justify-start h-auto py-3 px-4 hover:bg-accent hover:border-primary/50 transition-all group">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="rounded-md bg-primary/10 p-2 shrink-0">
                                            <Users className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <span className="font-medium block">Candidates</span>
                                            <span className="text-xs text-muted-foreground">Manage candidate directory & history</span>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Button>
                            </Link>
                            <Link href="/schedules">
                                <Button variant="outline" className="w-full justify-start h-auto py-3 px-4 hover:bg-accent hover:border-primary/50 transition-all group">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="rounded-md bg-primary/10 p-2 shrink-0">
                                            <Calendar className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <span className="font-medium block">Schedule</span>
                                            <span className="text-xs text-muted-foreground">Manage interview calendar & availability</span>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Button>
                            </Link>
                            <Link href="/interviews/logs">
                                <Button variant="outline" className="w-full justify-start h-auto py-3 px-4 hover:bg-accent hover:border-primary/50 transition-all group">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="rounded-md bg-primary/10 p-2 shrink-0">
                                            <Mic className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <span className="font-medium block">Interview Logs</span>
                                            <span className="text-xs text-muted-foreground">View transcripts, audio & analysis</span>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Button>
                            </Link>
                            <Link href="/applications">
                                <Button variant="outline" className="w-full justify-start h-auto py-3 px-4 hover:bg-accent hover:border-primary/50 transition-all group">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="rounded-md bg-primary/10 p-2 shrink-0">
                                            <FileText className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <span className="font-medium block">Applications</span>
                                            <span className="text-xs text-muted-foreground">Review & screen new job applicants</span>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Button>
                            </Link>
                        </CardContent>
                        <CardContent className="pt-6">
                            <Alert>
                                <TrendingUp className="h-4 w-4" />
                                <AlertTitle>Pro Tip</AlertTitle>
                                <AlertDescription>
                                    Use the "Analyze" feature on completed interviews to get detailed insights into candidate performance.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
