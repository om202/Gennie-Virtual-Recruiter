import { Head, Link } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    Activity,
    Users,
    Briefcase,
    Plus,
    ArrowRight,
    Clock,
    CheckCircle2,
    Calendar,
    Mic,
    TrendingUp,
    LayoutDashboard
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
        created_at: string
        link: string
    }>
}

export default function Dashboard({ auth, stats, recentActivity }: DashboardProps) {
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
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
                        <LayoutDashboard className="h-7 w-7 text-primary/80" />
                        Welcome, {auth.user.name.split(' ')[0]}
                    </h2>
                    <p className="text-muted-foreground">
                        Here's what's happening with your recruiting pipeline today.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Interviews
                            </CardTitle>
                            <div className="rounded-full bg-primary/10 p-2">
                                <Briefcase className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeInterviews}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently accepting candidates
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Candidates
                            </CardTitle>
                            <div className="rounded-full bg-primary/10 p-2">
                                <Users className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
                            <p className="text-xs text-muted-foreground">
                                Across all roles
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Sessions
                            </CardTitle>
                            <div className="rounded-full bg-primary/10 p-2">
                                <Mic className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalSessions}</div>
                            <p className="text-xs text-muted-foreground">
                                Completed screening calls
                            </p>
                        </CardContent>
                    </Card>
                </div>

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
                                                <div className="shrink-0">
                                                    {activity.status === 'completed' ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                    ) : (
                                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
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
                                <Button variant="outline" className="w-full justify-start h-auto py-3 hover:bg-accent">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-md bg-primary/10 p-2">
                                            <Plus className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium">Create New Interview</span>
                                    </div>
                                </Button>
                            </Link>
                            <Separator />
                            <Link href="/job-descriptions/create">
                                <Button variant="outline" className="w-full justify-start h-auto py-3 hover:bg-accent">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-md bg-primary/10 p-2">
                                            <Briefcase className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium">Upload Job Description</span>
                                    </div>
                                </Button>
                            </Link>
                            <Separator />
                            <Link href="/candidates">
                                <Button variant="outline" className="w-full justify-start h-auto py-3 hover:bg-accent">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-md bg-primary/10 p-2">
                                            <Users className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium">Manage Candidates</span>
                                    </div>
                                </Button>
                            </Link>
                            <Separator />
                            <Link href="/schedules">
                                <Button variant="outline" className="w-full justify-start h-auto py-3 hover:bg-accent">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-md bg-primary/10 p-2">
                                            <Calendar className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium">Schedule Interview</span>
                                    </div>
                                </Button>
                            </Link>
                        </CardContent>
                        <Separator />
                        <CardContent className="pt-6">
                            <div className="rounded-lg border bg-card p-4">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-md bg-primary/10 p-2">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium">Pro Tip</p>
                                        <p className="text-sm text-muted-foreground">
                                            Use the "Analyze" feature on completed interviews to get detailed insights into candidate performance.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
