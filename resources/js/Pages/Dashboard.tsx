import { Head, Link } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Activity,
    Users,
    Briefcase,
    Plus,
    ArrowRight,
    Clock,
    CheckCircle2,
    Calendar,
    Mic
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
            case 'in_progress': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
            case 'failed': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
            default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400'
        }
    }

    return (
        <div className="min-h-screen bg-muted/30 pb-20">
            <Head title="Dashboard" />

            <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-8">
                {/* Welcome Component */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Welcome back, {auth.user.name.split(' ')[0]}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Here's what's happening with your recruiting pipeline today.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/interviews/create" className={buttonVariants()}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Interview
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Interviews</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeInterviews}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Currently accepting candidates
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Across all roles
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                            <Mic className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalSessions}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Completed screening calls
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Activity Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
                            <Link href="/interviews/logs" className="text-sm text-primary hover:underline flex items-center">
                                View Full Logs <ArrowRight className="h-3 w-3 ml-1" />
                            </Link>
                        </div>

                        {recentActivity.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <Activity className="h-10 w-10 mb-3 opacity-20" />
                                    <p>No activity yet.</p>
                                    <p className="text-sm">Start your first interview to see updates here.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <Card key={activity.id} className="overflow-hidden hover:shadow-sm transition-shadow">
                                        <CardContent className="p-0">
                                            <div className="flex items-center gap-4 p-4">
                                                <div className={`flex h-9 w-9 items-center justify-center rounded-full border ${activity.status === 'completed' ? 'bg-green-50 border-green-200 text-green-600' :
                                                        'bg-gray-50 border-gray-200 text-gray-500'
                                                    }`}>
                                                    {activity.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {activity.title}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {activity.description}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <Badge variant="secondary" className={`text-xs capitalize ${getStatusColor(activity.status)}`}>
                                                        {activity.status.replace('_', ' ')}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(activity.created_at).split(',')[0]}
                                                    </span>
                                                </div>
                                                <div className="pl-2 border-l">
                                                    <Link href={activity.link} className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })}>
                                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Quick Actions / Tips */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href="/interviews/create">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create New Interview
                                    </Button>
                                </Link>
                                <Link href="/job-descriptions/create">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Briefcase className="h-4 w-4 mr-2" />
                                        Upload Job Description
                                    </Button>
                                </Link>
                                <Link href="/candidates">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Users className="h-4 w-4 mr-2" />
                                        Manage Candidates
                                    </Button>
                                </Link>
                                <Link href="/schedules">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Schedule Interview
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-primary">Pro Tip</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Use the "Analyze" feature on completed interviews to get detailed insights into candidate performance before making a decision.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
