import DocsLayout from './DocsLayout';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Lock, Smartphone, Timer, CheckCheck, Headphones, ArrowRight } from 'lucide-react';

export default function CandidateExperience() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
                    The Candidate Experience
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    What your candidates see when they apply and take an interview using Gennie.
                </p>
            </div>

            <Separator />

            {/* Journey steps */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">The Candidate Journey</h2>
                <div className="grid gap-4">
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">1</div>
                        <div>
                            <h3 className="font-medium">Receive Invitation</h3>
                            <p className="text-sm text-muted-foreground">Candidates receive a branded email with a secure link to their interview.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">2</div>
                        <div>
                            <h3 className="font-medium">Verify Identity (OTP)</h3>
                            <p className="text-sm text-muted-foreground">A 6-digit code is sent to their email/phone to verify access.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">3</div>
                        <div>
                            <h3 className="font-medium">System Check</h3>
                            <p className="text-sm text-muted-foreground">Gennie tests microphone and browser compatibility before the interview starts.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">4</div>
                        <div>
                            <h3 className="font-medium">Complete the Interview</h3>
                            <p className="text-sm text-muted-foreground">The AI asks questions aloud; the candidate responds naturally using their voice.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">5</div>
                        <div>
                            <h3 className="font-medium">Confirmation</h3>
                            <p className="text-sm text-muted-foreground">Candidate receives a thank-you message and knows their interview has been submitted.</p>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Access & Verification</h2>
                    <p className="text-muted-foreground">
                        Candidates access the interview via a secure link sent to their email.
                        To ensure security, we use a One-Time Password (OTP) verification system.
                    </p>
                    <Card className="bg-muted/50 border-dashed">
                        <CardContent className="pt-6 flex flex-col items-center gap-2 text-center">
                            <Lock className="w-8 h-8 text-primary/60" />
                            <p className="font-mono text-sm">Enter 6-digit code: 123-456</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">System Check</h2>
                    <p className="text-muted-foreground">
                        Before starting, Gennie checks the candidate's microphone and browser compatibility
                        to ensure a smooth technical experience.
                    </p>
                    <Card className="bg-muted/50 border-dashed">
                        <CardContent className="pt-6 flex flex-col items-center gap-2 text-center">
                            <CheckCheck className="w-8 h-8 text-green-500/60" />
                            <p className="font-mono text-sm tracking-tight text-green-600">Microphone Connected</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator />

            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold">The AI Interview</h2>
                    <p className="mt-2 text-muted-foreground leading-relaxed">
                        The interview interface is clean and distraction-free. The AI assistant asks questions audibly,
                        and the candidate responds naturally using their voice.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex flex-col gap-2 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <Smartphone className="w-6 h-6 text-primary mb-2" />
                        <h3 className="font-semibold">Mobile Friendly</h3>
                        <p className="text-sm text-muted-foreground">Candidates can interview from any device—laptop, tablet, or phone.</p>
                    </div>
                    <div className="flex flex-col gap-2 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <Timer className="w-6 h-6 text-primary mb-2" />
                        <h3 className="font-semibold">Timed Sessions</h3>
                        <p className="text-sm text-muted-foreground">A visible timer keeps the candidate on track without adding stress.</p>
                    </div>
                    <div className="flex flex-col gap-2 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <Headphones className="w-6 h-6 text-primary mb-2" />
                        <h3 className="font-semibold">Natural Conversation</h3>
                        <p className="text-sm text-muted-foreground">Clear audio and real-time transcription make the experience seamless.</p>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Pro Tip:</strong> We recommend taking a "Demo Interview" yourself to experience exactly what your candidates will go through.
                    Use the "Try Gennie" button on your dashboard.
                </p>
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
                <Link href="/docs/candidates" className="text-sm text-muted-foreground hover:text-primary">
                    ← Candidates
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

CandidateExperience.layout = (page: any) => <DocsLayout>{page}</DocsLayout>;
