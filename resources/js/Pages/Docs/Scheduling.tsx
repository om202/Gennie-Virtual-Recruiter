import DocsLayout from './DocsLayout';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    User,
    CalendarX,
    RefreshCw,
    ArrowRight
} from 'lucide-react';

export default function Scheduling() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
                    Interview Scheduling
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Manage interview schedules, enable candidate self-scheduling, and handle rescheduling/cancellations.
                </p>
            </div>

            <Separator />

            {/* Two Ways to Schedule */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Scheduling Options</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-primary/50">
                        <CardHeader>
                            <User className="w-8 h-8 text-primary mb-2" />
                            <CardTitle>Recruiter Scheduling</CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground space-y-3">
                            <p>
                                As a recruiter, you can manually schedule interviews for specific candidates:
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>Go to <strong>Candidates</strong> and select a candidate</li>
                                <li>Click <strong>Schedule Interview</strong></li>
                                <li>Select date, time, and timezone</li>
                                <li>An email is automatically sent to the candidate</li>
                            </ol>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/50">
                        <CardHeader>
                            <Calendar className="w-8 h-8 text-primary mb-2" />
                            <CardTitle>Candidate Self-Scheduling</CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground space-y-3">
                            <p>
                                Let candidates pick their own time slot:
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>When a candidate applies, they receive a scheduling link</li>
                                <li>They select from available time slots (7 AM - 10 PM)</li>
                                <li>Slots are offered in 5-minute increments</li>
                                <li>Confirmation email sent automatically</li>
                            </ol>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator />

            {/* Schedule Workflow */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Scheduling Workflow</h2>
                <div className="grid gap-4">
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">1</div>
                        <div>
                            <h3 className="font-medium">Interview Created</h3>
                            <p className="text-sm text-muted-foreground">
                                A scheduling link is generated when you create or invite a candidate to an interview.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">2</div>
                        <div>
                            <h3 className="font-medium">Candidate Picks Time</h3>
                            <p className="text-sm text-muted-foreground">
                                The candidate clicks the link and sees a calendar with available slots in their local timezone.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">3</div>
                        <div>
                            <h3 className="font-medium">Confirmation Sent</h3>
                            <p className="text-sm text-muted-foreground">
                                Both you and the candidate receive confirmation emails with calendar invites (.ics files).
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">4</div>
                        <div>
                            <h3 className="font-medium">Interview Access</h3>
                            <p className="text-sm text-muted-foreground">
                                At the scheduled time, the candidate can access the interview via a secure OTP-protected link.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Rescheduling & Cancellation */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Managing Schedule Changes</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                        <RefreshCw className="w-6 h-6 text-amber-500 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold">Rescheduling</h3>
                            <p className="text-sm text-muted-foreground">
                                Both recruiters and candidates can reschedule. The other party receives an email
                                notification with the new time. Old calendar invites are replaced.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                        <CalendarX className="w-6 h-6 text-red-500 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold">Cancellation</h3>
                            <p className="text-sm text-muted-foreground">
                                Interviews can be cancelled by the recruiter. The candidate receives a
                                professional cancellation email. The interview link expires immediately.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Timezone Handling */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Timezone Support</h2>
                <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/50">
                    <Clock className="w-6 h-6 text-primary flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold">Automatic Timezone Detection</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Gennie automatically detects the candidate's timezone and displays all times
                            in their local time. You can set your organization's default timezone in Settings.
                            All emails include clear timezone indicators to prevent confusion.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Pro Tip:</strong> Enable self-scheduling for high-volume roles to reduce
                    back-and-forth emails. Candidates appreciate the flexibility of choosing their own time.
                </p>
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
                <Link href="/docs/candidates" className="text-sm text-muted-foreground hover:text-primary">
                    ← Candidates
                </Link>
                <Link href="/docs/candidate-experience">
                    <Button variant="outline" className="gap-2">
                        Next: Candidate Experience <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

Scheduling.layout = (page: any) => <DocsLayout>{page}</DocsLayout>;
