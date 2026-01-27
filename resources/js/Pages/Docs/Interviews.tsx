import DocsLayout from './DocsLayout';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Mic, Zap, Share2, Clock, MessageSquare, ArrowRight } from 'lucide-react';

export default function Interviews() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
                    Interview Management
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Configure the AI interviewer to screen candidates exactly how you want.
                </p>
            </div>

            <Separator />

            {/* Step by step */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Creating an Interview</h2>
                <div className="grid gap-4">
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">1</div>
                        <div>
                            <h3 className="font-medium">Navigate to Interviews</h3>
                            <p className="text-sm text-muted-foreground">Click "Interviews" in the sidebar, then click "New Interview".</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">2</div>
                        <div>
                            <h3 className="font-medium">Link to a Job Description</h3>
                            <p className="text-sm text-muted-foreground">Select the Job Description this interview is for. The AI uses this context to understand what to ask.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">3</div>
                        <div>
                            <h3 className="font-medium">Configure Questions</h3>
                            <p className="text-sm text-muted-foreground">Gennie generates suggested questions. Review, edit, add your own, or remove any you don't need.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">4</div>
                        <div>
                            <h3 className="font-medium">Set Duration & Options</h3>
                            <p className="text-sm text-muted-foreground">Define the interview length (e.g., 15 minutes) and choose Public or Private access.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">5</div>
                        <div>
                            <h3 className="font-medium">Publish & Share</h3>
                            <p className="text-sm text-muted-foreground">Once published, you'll get a unique interview link to share with candidates.</p>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <Mic className="w-8 h-8 text-primary mb-2" />
                        <CardTitle className="text-lg">AI Calibration</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Gennie generates initial questions based on the JD. Review, edit, or add your own custom questions before publishing.
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <MessageSquare className="w-8 h-8 text-primary mb-2" />
                        <CardTitle className="text-lg">Smart Follow-ups</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        If a candidate gives a vague answer, Gennie asks intelligent follow-up questions to get the depth you need.
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Zap className="w-8 h-8 text-primary mb-2" />
                        <CardTitle className="text-lg">Instant Feedback</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        The AI scores candidates immediately after the call, giving you actionable insights right away.
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Configuration Options</h3>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Question Complexity</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            You can set the difficulty level of follow-up questions. The AI will probe deeper if a candidate gives vague answers, ensuring you get substantive responses.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Interview Duration</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            Set a time limit (e.g., 10, 15, or 20 minutes). The AI manages the pace to ensure all key topics are covered within the allocated time.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Public vs Private Access</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            <strong>Public:</strong> Anyone with the link can take the interview. Great for job boards and social media.<br />
                            <strong>Private:</strong> Only invited candidates (via email) can access the session with a secure OTP.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>Self-Scheduling</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            Candidates can pick their own interview time from slots you define. This reduces back-and-forth and improves candidate experience.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            <Separator />

            {/* Phone vs Web Interviews */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Phone vs Web Interviews</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-primary/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Mic className="w-5 h-5 text-primary" />
                                Phone Call Interview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <p>Gennie calls the candidate at their scheduled time. Best for:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Candidates without reliable internet</li>
                                <li>More natural, conversational feel</li>
                                <li>Candidates on mobile devices</li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card className="border-primary/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-primary" />
                                Web-Based Interview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <p>Candidate joins via browser link. Best for:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Immediate access for walk-in screening</li>
                                <li>International candidates (no phone costs)</li>
                                <li>High-volume public links</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator />

            {/* Interview Rounds */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Multi-Round Interviews</h3>
                <p className="text-muted-foreground">
                    Need multiple screening stages? Gennie supports interview rounds:
                </p>
                <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/50">
                    <Clock className="w-6 h-6 text-primary flex-shrink-0" />
                    <div>
                        <h4 className="font-medium">Round-Based Workflow</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                            Create separate interviews for each stage (e.g., "Initial Screen", "Technical Deep-Dive").
                            Review Round 1 results before inviting candidates to Round 2. Each interview tracks
                            sessions independently with its own score and transcript.
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
                <Link href="/docs/jobs" className="text-sm text-muted-foreground hover:text-primary">
                    ← Job Descriptions
                </Link>
                <Link href="/docs/candidates">
                    <Button variant="outline" className="gap-2">
                        Next: Candidates <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

Interviews.layout = (page: any) => <DocsLayout>{page}</DocsLayout>;
