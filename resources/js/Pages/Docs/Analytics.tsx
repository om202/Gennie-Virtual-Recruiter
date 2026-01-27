import DocsLayout from './DocsLayout';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { PlayCircle, FileText, Activity, Search, Share, ArrowRight } from 'lucide-react';

export default function Analytics() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
                    Analytics & Interview Logs
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Review candidate performance with AI-generated insights, transcripts, and audio playback.
                </p>
            </div>

            <Separator />

            {/* Mock Dashboard */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Sample Report Dashboard</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Score</CardTitle>
                            <div className="text-4xl font-bold">8.5/10</div>
                        </CardHeader>
                        <CardContent>
                            <Progress value={85} className="h-2 mt-2" />
                            <p className="text-xs text-muted-foreground mt-2">
                                AI composite score based on relevance, clarity, and keyword matching.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
                            <div className="text-4xl font-bold">12m 30s</div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <Activity className="w-4 h-4" />
                                <span>Full session recording available</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Sentiment</CardTitle>
                            <div className="text-2xl font-bold text-green-600">Positive</div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground mt-2">
                                Candidate showed enthusiasm and confidence throughout the call.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator />

            <div className="space-y-6">
                <h2 className="text-xl font-semibold">Report Features</h2>

                <div className="grid gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-muted rounded-md border">
                            <PlayCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Audio Playback</h3>
                            <p className="text-muted-foreground text-sm">
                                Listen to the entire interview or jump to specific answers.
                                The player is synchronized with the transcript so you can read along.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-muted rounded-md border">
                            <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Full Transcript</h3>
                            <p className="text-muted-foreground text-sm">
                                Every word is transcribed. You can read through the full conversation
                                or copy text to share with hiring managers.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-muted rounded-md border">
                            <Search className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Keyword Highlighting</h3>
                            <p className="text-muted-foreground text-sm">
                                Key skills and requirements from the job description are highlighted in the transcript
                                when mentioned by the candidate.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-muted rounded-md border">
                            <Share className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Share with Team</h3>
                            <p className="text-muted-foreground text-sm">
                                Generate a shareable link to the report so hiring managers can review candidates
                                without needing a Gennie account.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 border rounded-lg p-6 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900 border-yellow-200">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Understanding Scores</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                    Scores are meant to be a guide, not a final decision. Gennie evaluates answers based on the
                    job description criteria, but human intuition is always recommended for the final hiring decision.
                </p>
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
                <Link href="/docs/candidate-experience" className="text-sm text-muted-foreground hover:text-primary">
                    ← Candidate Experience
                </Link>
                <Link href="/docs/settings">
                    <Button variant="outline" className="gap-2">
                        Next: Settings <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

Analytics.layout = (page: any) => <DocsLayout>{page}</DocsLayout>;
