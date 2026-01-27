import DocsLayout from './DocsLayout';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import {
    TrendingUp,
    Activity,
    Users,
    Briefcase,
    Calendar,
    Plus,
    ArrowRight,
    Phone,
    Globe
} from 'lucide-react';

export default function DashboardDoc() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
                    Dashboard Overview
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Your central command center for managing the entire recruiting pipeline at a glance.
                </p>
            </div>

            <Separator />

            {/* Stats Overview */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Key Metrics</h2>
                <p className="text-muted-foreground">
                    The dashboard displays real-time statistics about your recruiting activity. Here's what each metric means:
                </p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <Users className="w-5 h-5 text-primary mb-1" />
                            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">156</p>
                            <p className="text-xs text-muted-foreground">All candidates in your pipeline</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <Briefcase className="w-5 h-5 text-primary mb-1" />
                            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">8</p>
                            <p className="text-xs text-muted-foreground">Open positions accepting applications</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <Phone className="w-5 h-5 text-primary mb-1" />
                            <CardTitle className="text-sm font-medium">Interviews Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">42</p>
                            <p className="text-xs text-muted-foreground">This month's screening sessions</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <TrendingUp className="w-5 h-5 text-primary mb-1" />
                            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">7.2</p>
                            <p className="text-xs text-muted-foreground">Average AI screening score</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator />

            {/* Recent Activity */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Recent Activity Feed</h2>
                <p className="text-muted-foreground">
                    The activity feed shows the latest events in your recruiting pipeline:
                </p>

                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <Activity className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                            <p className="font-medium">Interview Completed</p>
                            <p className="text-sm text-muted-foreground">John Smith completed screening for Senior Developer - Score: 8.5</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                            <p className="font-medium">New Application</p>
                            <p className="text-sm text-muted-foreground">Sarah Johnson applied for Product Manager role</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <Calendar className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                            <p className="font-medium">Interview Scheduled</p>
                            <p className="text-sm text-muted-foreground">Mike Chen scheduled for tomorrow at 2:00 PM</p>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Quick Actions */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Quick Actions</h2>
                <p className="text-muted-foreground">
                    Common tasks are accessible directly from the dashboard:
                </p>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex flex-col gap-2 p-4 border rounded-lg bg-card">
                        <Plus className="w-6 h-6 text-primary" />
                        <h3 className="font-semibold">Create New Interview</h3>
                        <p className="text-sm text-muted-foreground">Set up a screening interview for a role</p>
                    </div>
                    <div className="flex flex-col gap-2 p-4 border rounded-lg bg-card">
                        <Globe className="w-6 h-6 text-primary" />
                        <h3 className="font-semibold">View Careers Page</h3>
                        <p className="text-sm text-muted-foreground">Preview your public job listings</p>
                    </div>
                    <div className="flex flex-col gap-2 p-4 border rounded-lg bg-card">
                        <Activity className="w-6 h-6 text-primary" />
                        <h3 className="font-semibold">View All Logs</h3>
                        <p className="text-sm text-muted-foreground">Browse all interview recordings</p>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Pro Tip:</strong> The dashboard updates in real-time. Keep it open in a browser tab
                    to monitor incoming applications and completed interviews throughout the day.
                </p>
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
                <Link href="/docs/getting-started" className="text-sm text-muted-foreground hover:text-primary">
                    ← Getting Started
                </Link>
                <Link href="/docs/jobs">
                    <Button variant="outline" className="gap-2">
                        Next: Job Descriptions <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

DashboardDoc.layout = (page: any) => <DocsLayout>{page}</DocsLayout>;
