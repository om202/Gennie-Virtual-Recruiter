import DocsLayout from './DocsLayout';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { FileText, UserPlus, Filter, Mail, Calendar, ArrowRight, Eye } from 'lucide-react';

export default function Candidates() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
                    Candidate Management
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    A centralized hub for all your applicants and their screening results.
                </p>
            </div>

            <Separator />

            {/* Step by step */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Managing Candidates</h2>
                <div className="grid gap-4">
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">1</div>
                        <div>
                            <h3 className="font-medium">View Your Candidate List</h3>
                            <p className="text-sm text-muted-foreground">Click "Candidates" in the sidebar to see all applicants across all job listings.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">2</div>
                        <div>
                            <h3 className="font-medium">Filter by Job or Status</h3>
                            <p className="text-sm text-muted-foreground">Use filters to narrow down by specific job listing, application status (New, Invited, Completed), or AI score range.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">3</div>
                        <div>
                            <h3 className="font-medium">Invite to Interview</h3>
                            <p className="text-sm text-muted-foreground">Select a candidate and click "Schedule Interview" to send them an email with a secure interview link.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">4</div>
                        <div>
                            <h3 className="font-medium">Review Results</h3>
                            <p className="text-sm text-muted-foreground">After the interview, click on a candidate to view their full report: transcript, audio, and AI scores.</p>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="grid gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <UserPlus className="w-5 h-5 text-primary" />
                            Adding Candidates
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm">
                        Candidates enter the system automatically via public application forms. You can also manually add candidates or bulk upload via CSV (enterprise plans).
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileText className="w-5 h-5 text-primary" />
                            Resume Parsing
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm">
                        Upload a PDF resume to any candidate profile. Gennie automatically extracts contact info, work history, and education to populate their profile.
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Mail className="w-5 h-5 text-primary" />
                            Email Invitations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm">
                        Send professional, branded emails to candidates with their interview link. They can self-schedule at a time that works for them.
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Eye className="w-5 h-5 text-primary" />
                            Detailed Profiles
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm">
                        Each candidate has a profile page showing their resume details, interview history, and all past screening results in one place.
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Understanding Statuses</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col gap-1 p-3 border rounded-lg">
                        <Badge variant="secondary" className="w-fit">New</Badge>
                        <span className="text-sm text-muted-foreground">Just applied, no action taken yet.</span>
                    </div>
                    <div className="flex flex-col gap-1 p-3 border rounded-lg">
                        <Badge variant="outline" className="border-blue-500 text-blue-600 w-fit">Invited</Badge>
                        <span className="text-sm text-muted-foreground">Interview link has been sent.</span>
                    </div>
                    <div className="flex flex-col gap-1 p-3 border rounded-lg">
                        <Badge variant="outline" className="border-amber-500 text-amber-600 w-fit">Scheduled</Badge>
                        <span className="text-sm text-muted-foreground">Candidate picked a time slot.</span>
                    </div>
                    <div className="flex flex-col gap-1 p-3 border rounded-lg">
                        <Badge className="bg-green-500 hover:bg-green-600 w-fit">Completed</Badge>
                        <span className="text-sm text-muted-foreground">Screening done, report ready.</span>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
                <Link href="/docs/interviews" className="text-sm text-muted-foreground hover:text-primary">
                    ← Interviews
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

Candidates.layout = (page: any) => <DocsLayout>{page}</DocsLayout>;
