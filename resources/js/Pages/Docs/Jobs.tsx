import DocsLayout from './DocsLayout';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Globe, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export default function Jobs() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
                    Job Descriptions
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    The foundation of your recruiting process. Gennie uses your Job Descriptions (JDs)
                    to understand the role and generate relevant interview questions.
                </p>
            </div>

            <Separator />

            {/* Step by step */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Creating a Job Description</h2>
                <div className="grid gap-4">
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">1</div>
                        <div>
                            <h3 className="font-medium">Navigate to Job Descriptions</h3>
                            <p className="text-sm text-muted-foreground">Click "Job Descriptions" in the sidebar, then click the "New Job" button.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">2</div>
                        <div>
                            <h3 className="font-medium">Enter Job Details</h3>
                            <p className="text-sm text-muted-foreground">Provide the job title, company (if different from default), and paste or type the full job description text.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">3</div>
                        <div>
                            <h3 className="font-medium">AI Parsing (Automatic)</h3>
                            <p className="text-sm text-muted-foreground">Gennie automatically analyzes the text to extract key skills, requirements, and responsibilities. This context is used for interview question generation.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">4</div>
                        <div>
                            <h3 className="font-medium">Save & Publish</h3>
                            <p className="text-sm text-muted-foreground">Save the JD. You can optionally toggle it to "Public" to list it on your branded careers page.</p>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            AI-Powered Parsing
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                        Simply paste your existing JD text. Gennie identifies keywords, required experience levels, and technical skills automatically.
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-primary" />
                            Public Careers Page
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                        Toggle "Public" on any JD to instantly list it on your company's branded careers page. Candidates can apply directly through this portal.
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
                    Key Features
                </h2>
                <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span><strong>Rich Text Support:</strong> Format your JD with headers, bullet points, and styled text.</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span><strong>Public Link:</strong> Each public job has a unique shareable URL for social media.</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span><strong>Status Management:</strong> Mark jobs as Active, Draft, or Closed to control visibility.</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span><strong>Application Tracking:</strong> See how many candidates applied via each JD.</span>
                    </li>
                </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg border border-blue-100 dark:border-blue-900">
                <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">Pro Tip: Context Matters</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    The more detailed your job description, the better Gennie can screen candidates.
                    Include specific technical requirements, soft skills, and "nice-to-haves" for best results.
                </p>
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
                <Link href="/docs/getting-started" className="text-sm text-muted-foreground hover:text-primary">
                    ← Getting Started
                </Link>
                <Link href="/docs/interviews">
                    <Button variant="outline" className="gap-2">
                        Next: Interviews <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

Jobs.layout = (page: any) => <DocsLayout>{page}</DocsLayout>;
