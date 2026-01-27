import DocsLayout from './DocsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Settings, Briefcase, Mic, Send } from 'lucide-react';

export default function GettingStarted() {
    const steps = [
        {
            title: "Configure Your Organization",
            description: "Set up your company branding and interview preferences.",
            icon: Settings,
            content: "Navigate to Settings > Profile to upload your company logo and set your organization name. This branding will appear on all public candidate-facing pages."
        },
        {
            title: "Create a Job Description",
            description: "Define the role you are hiring for.",
            icon: Briefcase,
            content: "Go to 'Job Descriptions' and click 'New Job'. You can paste an existing JD or write one from scratch. Gennie uses this context to understand what skills to look for."
        },
        {
            title: "Set Up the Interview",
            description: "Design the screening questions.",
            icon: Mic,
            content: "In the 'Interviews' section, create a new interview linked to your Job Description. You can customize the specific questions Gennie should ask, or let AI generate them based on the role."
        },
        {
            title: "Invite Candidates",
            description: "Start screening efficiently.",
            icon: Send,
            content: "Once published, you'll get a unique link for the interview. You can share this globally or invite specific candidates via email/SMS from the 'Candidates' tab."
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

            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Pro Tip</AlertTitle>
                <AlertDescription>
                    You can try the candidate experience yourself by using the "Try Gennie" button on the landing page!
                </AlertDescription>
            </Alert>

            <div className="grid gap-6">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <Card key={index} className="relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                    {index + 1}
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">{step.title}</CardTitle>
                                    <CardDescription>{step.description}</CardDescription>
                                </div>
                                <Icon className="ml-auto w-5 h-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="pl-16 text-muted-foreground">
                                {step.content}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}

GettingStarted.layout = (page: any) => <DocsLayout>{page}</DocsLayout>;
