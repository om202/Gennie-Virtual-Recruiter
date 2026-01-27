import DocsLayout from './DocsLayout';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowRight, Mic, Users, Calendar, Briefcase, BarChart3, Settings2, HelpCircle, LayoutDashboard, Globe, Mail, Sparkles } from 'lucide-react';

export default function DocsIndex() {
    const quickLinks = [
        { title: "Dashboard", href: "/docs/dashboard", icon: LayoutDashboard, description: "Your central command center" },
        { title: "Job Descriptions", href: "/docs/jobs", icon: Briefcase, description: "Create and manage job postings" },
        { title: "Interviews", href: "/docs/interviews", icon: Mic, description: "Configure AI interviewer settings" },
        { title: "Candidates", href: "/docs/candidates", icon: Users, description: "Track applicants and resumes" },
        { title: "Scheduling", href: "/docs/scheduling", icon: Calendar, description: "Self-scheduling and rescheduling" },
        { title: "Public Pages", href: "/docs/public-pages", icon: Globe, description: "Careers portal and application forms" },
        { title: "Email Communications", href: "/docs/emails", icon: Mail, description: "Automated candidate emails" },
        { title: "Analytics", href: "/docs/analytics", icon: BarChart3, description: "Review scores and transcripts" },
        { title: "AI Features", href: "/docs/ai-features", icon: Sparkles, description: "Voice, parsing, and analysis" },
        { title: "Settings", href: "/docs/settings", icon: Settings2, description: "Company branding and preferences" },
        { title: "FAQ", href: "/docs/faq", icon: HelpCircle, description: "Common questions answered" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Welcome to Gennie
                </h1>
                <p className="leading-7 [&:not(:first-child)]:mt-6 text-xl text-muted-foreground">
                    Your AI-powered recruiting assistant designed to streamline your hiring process.
                </p>
            </div>

            <Separator />

            <div className="prose prose-slate dark:prose-invert max-w-none">
                <p>
                    Gennie allows you to automate screening interviews using advanced AI voice technology.
                    By handling the initial screening process, Gennie saves you hours of time and ensures
                    every candidate gets a fair, consistent, and instant interview experience.
                </p>

                <h3>How It Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                                <span className="font-bold">1</span>
                            </div>
                            <CardTitle>Create Interviews</CardTitle>
                            <CardDescription>
                                Define questions and criteria for the AI to assess based on your Job Description.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                                <span className="font-bold">2</span>
                            </div>
                            <CardTitle>Invite Candidates</CardTitle>
                            <CardDescription>
                                Share a public link or invite specific candidates via email. They self-schedule at their convenience.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                                <span className="font-bold">3</span>
                            </div>
                            <CardTitle>Review Results</CardTitle>
                            <CardDescription>
                                Get instant transcripts, audio recordings, and AI scores to make faster decisions.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>

            <div className="flex justify-start pt-4">
                <Link href="/docs/getting-started">
                    <Button size="lg" className="gap-2">
                        Get Started <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>

            <Separator className="my-8" />

            <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-6">Explore the Documentation</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link key={link.href} href={link.href} className="block group">
                                <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/50">
                                    <CardHeader className="pb-2">
                                        <Icon className="w-5 h-5 text-primary mb-1" />
                                        <CardTitle className="text-base group-hover:text-primary transition-colors">
                                            {link.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <p className="text-sm text-muted-foreground">{link.description}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

DocsIndex.layout = (page: any) => <DocsLayout>{page}</DocsLayout>;
