import DocsLayout from './DocsLayout';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import {
    Mic,
    Brain,
    FileText,
    Sparkles,
    Gauge,
    MessageSquare,
    ArrowRight
} from 'lucide-react';

export default function AIFeatures() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
                    AI Features
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Advanced AI capabilities that power Gennie's intelligent screening interviews.
                </p>
            </div>

            <Separator />

            {/* Voice Selection */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Mic className="w-5 h-5 text-primary" />
                    AI Voice Selection
                </h2>
                <p className="text-muted-foreground">
                    Choose the voice personality for your AI interviewer. Different voices suit different
                    company cultures and interview styles.
                </p>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Professional</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            Clear, neutral tone. Best for corporate and enterprise roles.
                        </CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Friendly</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            Warm and approachable. Great for startup and creative roles.
                        </CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Technical</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            Precise and methodical. Ideal for engineering and technical positions.
                        </CardContent>
                    </Card>
                </div>
                <p className="text-sm text-muted-foreground">
                    Configure in: <strong>Settings → Interview Preferences → AI Voice</strong>
                </p>
            </div>

            <Separator />

            {/* Question Generation */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Question Generation
                </h2>
                <p className="text-muted-foreground">
                    When you create an interview, Gennie analyzes your job description and automatically
                    generates relevant screening questions.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">How It Works</h3>
                        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                            <li>Upload or paste your job description</li>
                            <li>AI extracts key requirements and skills</li>
                            <li>Behavioral and technical questions are generated</li>
                            <li>Review and edit questions as needed</li>
                        </ol>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Question Types</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>Experience verification</li>
                            <li>Technical competency</li>
                            <li>Behavioral/situational</li>
                            <li>Culture fit</li>
                        </ul>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Document Parsing */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Resume & JD Parsing
                </h2>
                <p className="text-muted-foreground">
                    Gennie uses AI to extract structured information from unstructured documents.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Resume Parsing</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>Extracts from uploaded resumes:</p>
                            <ul className="list-disc list-inside">
                                <li>Name, contact info</li>
                                <li>Skills and technologies</li>
                                <li>Years of experience</li>
                                <li>Education and certifications</li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Job Description Parsing</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>Extracts from job descriptions:</p>
                            <ul className="list-disc list-inside">
                                <li>Title and department</li>
                                <li>Required skills</li>
                                <li>Experience requirements</li>
                                <li>Key responsibilities</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator />

            {/* Analysis Pipeline */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-primary" />
                    Post-Interview Analysis
                </h2>
                <p className="text-muted-foreground">
                    After each interview, Gennie runs a comprehensive analysis pipeline:
                </p>
                <div className="grid gap-4">
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">1</div>
                        <div>
                            <h3 className="font-medium">Transcription</h3>
                            <p className="text-sm text-muted-foreground">Convert speech to text with high accuracy</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">2</div>
                        <div>
                            <h3 className="font-medium">Sentiment Analysis</h3>
                            <p className="text-sm text-muted-foreground">Evaluate candidate confidence, enthusiasm, and clarity</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">3</div>
                        <div>
                            <h3 className="font-medium">Keyword Matching</h3>
                            <p className="text-sm text-muted-foreground">Check for job-relevant terms and required skills</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">4</div>
                        <div>
                            <h3 className="font-medium">Composite Scoring</h3>
                            <p className="text-sm text-muted-foreground">Generate 1-10 score based on all factors</p>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            {/* RAG / Knowledge Base */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Contextual Understanding (RAG)
                </h2>
                <p className="text-muted-foreground">
                    The AI interviewer uses Retrieval-Augmented Generation (RAG) to maintain context:
                </p>
                <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/50">
                    <MessageSquare className="w-6 h-6 text-primary flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold">Interview Memory</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            During the interview, the AI remembers previous answers and can ask intelligent
                            follow-up questions based on what the candidate has said. This creates a natural,
                            conversational experience rather than a rigid Q&A session.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>Important:</strong> AI scoring is a screening tool, not a hiring decision.
                    Always review transcripts and use human judgment for final decisions.
                </p>
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
                <Link href="/docs/settings" className="text-sm text-muted-foreground hover:text-primary">
                    ← Settings
                </Link>
                <Link href="/docs/faq">
                    <Button variant="outline" className="gap-2">
                        Next: FAQ <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

AIFeatures.layout = (page: any) => <DocsLayout>{page}</DocsLayout>;
