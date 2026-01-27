import DocsLayout from './DocsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Lightbulb, Settings, Briefcase, Mic, Send, BarChart3, ArrowRight } from 'lucide-react';

export default function GettingStarted() {
    const steps = [
        {
            title: "Configure Your Organization",
            description: "Set up your company branding.",
            icon: Settings,
            content: "Navigate to Settings > Profile to upload your company logo and set your organization name. This branding will appear on all candidate-facing pages and emails.",
            linkText: "Learn more about Settings",
            linkHref: "/docs/settings"
        },
        {
            title: "Create a Job Description",
            description: "Define the role you are hiring for.",
            icon: Briefcase,
            content: "Go to 'Job Descriptions' and click 'New Job'. You can paste an existing JD or write one from scratch. Gennie parses the text to understand skills and requirements.",
            linkText: "Learn more about Job Descriptions",
            linkHref: "/docs/jobs"
        },
        {
            title: "Set Up the Interview",
            description: "Design the screening questions.",
            icon: Mic,
            content: "In the 'Interviews' section, create a new interview linked to your Job Description. Customize the questions Gennie should ask, or let AI generate them based on the role.",
            linkText: "Learn more about Interviews",
            linkHref: "/docs/interviews"
        },
        {
            title: "Invite Candidates",
            description: "Start screening efficiently.",
            icon: Send,
            content: "Once published, you'll get a unique link for the interview. Share this globally or invite specific candidates via email from the 'Candidates' tab. Candidates can self-schedule at their convenience.",
            linkText: "Learn more about Candidates",
            linkHref: "/docs/candidates"
        },
        {
            title: "Review Results",
            description: "Analyze AI-generated insights.",
            icon: BarChart3,
            content: "After each interview, Gennie provides a detailed report: full transcript, audio playback, sentiment analysis, and a composite score. Use these insights to shortlist top candidates quickly.",
            linkText: "Learn more about Analytics",
            linkHref: "/docs/analytics"
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
                    Getting Started with Gennie
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Follow this quick guide to launch your first AI-driven recruiting campaign in minutes.
                </p>
            </div>

            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
                <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-200">Pro Tip</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                    You can try the candidate experience yourself by using the "Try Gennie" button on the landing page!
                </AlertDescription>
            </Alert>

            <div className="grid gap-6">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <Card key={index} className="relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/30" />
                            <CardHeader className="flex flex-row items-start gap-4 pb-2">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg flex-shrink-0">
                                    {index + 1}
                                </div>
                                <div className="space-y-1 flex-1">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        {step.title}
                                        <Icon className="w-4 h-4 text-muted-foreground" />
                                    </CardTitle>
                                    <CardDescription>{step.description}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="pl-[4.5rem] text-muted-foreground space-y-3">
                                <p>{step.content}</p>
                                <Link href={step.linkHref} className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                                    {step.linkText} <ArrowRight className="w-3 h-3" />
                                </Link>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="pt-6 border-t">
                <h3 className="font-semibold mb-2">What's Next?</h3>
                <p className="text-muted-foreground mb-4">
                    Explore specific features in detail or check out our FAQ for common questions.
                </p>
                <div className="flex gap-3">
                    <Link href="/docs/candidate-experience">
                        <Button variant="outline">Candidate Experience</Button>
                    </Link>
                    <Link href="/docs/faq">
                        <Button variant="outline">FAQ</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

GettingStarted.layout = (page: any) => <DocsLayout>{page}</DocsLayout>;
