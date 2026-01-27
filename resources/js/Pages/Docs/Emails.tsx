import DocsLayout from './DocsLayout';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import {
    Mail,
    CheckCircle,
    Calendar,
    RefreshCw,
    XCircle,
    Key,
    ArrowRight
} from 'lucide-react';

export default function Emails() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
                    Email Communications
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Gennie automatically sends professional emails to candidates at key stages of the interview process.
                </p>
            </div>

            <Separator />

            {/* Email Types */}
            <div className="space-y-6">
                <h2 className="text-xl font-semibold">Automated Emails</h2>

                <div className="grid gap-4">
                    {/* Application Received */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                <div>
                                    <CardTitle className="text-base">Application Received</CardTitle>
                                    <Badge variant="secondary" className="mt-1">Trigger: Candidate submits application</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <p>Confirms receipt of the candidate's application. Includes:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Company name and job title</li>
                                <li>Application confirmation number</li>
                                <li>Next steps information</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Interview Scheduled */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-6 h-6 text-blue-500" />
                                <div>
                                    <CardTitle className="text-base">Interview Scheduled</CardTitle>
                                    <Badge variant="secondary" className="mt-1">Trigger: Candidate picks a time slot</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <p>Confirms the scheduled interview time. Includes:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Date, time, and timezone</li>
                                <li>Calendar invite (.ics file)</li>
                                <li>Interview access link</li>
                                <li>System requirements (browser, microphone)</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* OTP Verification */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <Key className="w-6 h-6 text-purple-500" />
                                <div>
                                    <CardTitle className="text-base">OTP Verification</CardTitle>
                                    <Badge variant="secondary" className="mt-1">Trigger: Candidate accesses scheduled interview</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <p>Secure access code for scheduled interviews. Includes:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>6-digit verification code</li>
                                <li>Code expiration time (10 minutes)</li>
                                <li>Security reminder</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Interview Rescheduled */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <RefreshCw className="w-6 h-6 text-amber-500" />
                                <div>
                                    <CardTitle className="text-base">Interview Rescheduled</CardTitle>
                                    <Badge variant="secondary" className="mt-1">Trigger: Time is changed</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <p>Notifies the candidate of the new time. Includes:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Old time (cancelled)</li>
                                <li>New time with timezone</li>
                                <li>Updated calendar invite</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Interview Cancelled */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <XCircle className="w-6 h-6 text-red-500" />
                                <div>
                                    <CardTitle className="text-base">Interview Cancelled</CardTitle>
                                    <Badge variant="secondary" className="mt-1">Trigger: Recruiter cancels</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <p>Professional cancellation notice. Includes:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Clear cancellation statement</li>
                                <li>Optional: Reason (if provided)</li>
                                <li>Calendar cancellation update</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator />

            {/* Customization */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Branding & Customization</h2>
                <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/50">
                    <Mail className="w-6 h-6 text-primary flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold">Custom Email Appearance</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            All emails are branded with your company logo and colors. You can customize
                            the "Thank You" message shown after interviews in Settings → Branding.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Note:</strong> Emails are sent automatically. You don't need to configure anything
                    beyond your company profile. Recruiters also receive copies of scheduling-related emails.
                </p>
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
                <Link href="/docs/public-pages" className="text-sm text-muted-foreground hover:text-primary">
                    ← Public Pages
                </Link>
                <Link href="/docs/analytics">
                    <Button variant="outline" className="gap-2">
                        Next: Analytics <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

Emails.layout = (page: any) => <DocsLayout>{page}</DocsLayout>;
