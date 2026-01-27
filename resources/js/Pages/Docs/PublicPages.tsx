import DocsLayout from './DocsLayout';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import {
    Globe,
    FileText,
    Calendar,
    Lock,
    Mic,
    ArrowRight
} from 'lucide-react';

export default function PublicPages() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
                    Public Pages
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Gennie provides branded public pages for candidates to apply, schedule, and complete interviews.
                </p>
            </div>

            <Separator />

            {/* Careers Page */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Public Careers Page
                </h2>
                <p className="text-muted-foreground">
                    A branded job board that lists all your public job openings. Candidates can browse
                    and apply directly from this page.
                </p>
                <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-sm font-mono">yourcompany.gennie.ai/careers/[token]</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p><strong>Features:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Your company logo and branding</li>
                            <li>List of all public job descriptions</li>
                            <li>Direct "Apply" buttons for each role</li>
                            <li>Mobile-responsive design</li>
                        </ul>
                        <p className="pt-2">
                            <strong>Enable:</strong> Go to Settings → Company → Enable Careers Page
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Job Application Page */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Job Application Form
                </h2>
                <p className="text-muted-foreground">
                    When a candidate clicks "Apply", they're taken to a form where they can submit their
                    information and resume.
                </p>
                <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-sm font-mono">/apply/[company]/[job]/[token]</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p><strong>Form Fields:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Name, Email, Phone</li>
                            <li>Resume upload (PDF, DOCX)</li>
                            <li>AI-powered resume parsing (auto-fills fields)</li>
                            <li>Cover letter (optional)</li>
                        </ul>
                        <p className="pt-2">
                            After submission, candidates receive a confirmation email and can be automatically
                            invited to schedule/take an interview.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Self-Scheduling Page */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Self-Scheduling Page
                </h2>
                <p className="text-muted-foreground">
                    Candidates can pick their preferred interview time from available slots.
                </p>
                <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-sm font-mono">/schedule/[company]/[job]/[token]</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p><strong>Features:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Calendar view with available time slots</li>
                            <li>Automatic timezone detection</li>
                            <li>5-minute interval scheduling (7 AM - 10 PM)</li>
                            <li>Instant confirmation email with .ics calendar invite</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Interview Page */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Mic className="w-5 h-5 text-primary" />
                    Public Interview Page
                </h2>
                <p className="text-muted-foreground">
                    The actual AI interview screen where candidates answer questions.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="bg-muted/50">
                        <CardHeader>
                            <CardTitle className="text-sm">Instant Access</CardTitle>
                            <p className="text-xs text-muted-foreground font-mono">/i/[company]/[job]/[token]</p>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            For walk-in or bulk screening links. No scheduling required.
                            Candidate clicks and starts immediately.
                        </CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                        <CardHeader>
                            <CardTitle className="text-sm">Scheduled Access</CardTitle>
                            <p className="text-xs text-muted-foreground font-mono">/s/[company]/[job]/[token]</p>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            For scheduled interviews. OTP verification required.
                            Candidate must verify with a 6-digit code sent to their email.
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/50">
                <Lock className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                    <h3 className="font-semibold">Security & Privacy</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        All public pages use unique, unguessable tokens. Links expire after the interview is
                        completed. Scheduled interviews require OTP verification to prevent unauthorized access.
                    </p>
                </div>
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
                <Link href="/docs/candidate-experience" className="text-sm text-muted-foreground hover:text-primary">
                    ← Candidate Experience
                </Link>
                <Link href="/docs/emails">
                    <Button variant="outline" className="gap-2">
                        Next: Email Communications <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

PublicPages.layout = (page: any) => <DocsLayout>{page}</DocsLayout>;
