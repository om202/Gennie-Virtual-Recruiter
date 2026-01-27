import DocsLayout from './DocsLayout';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowRight, Mic, Users, Calendar } from 'lucide-react';

export default function DocsIndex() {
    return (
        <div className="space-y-6">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mt-8">
                    <Card>
                        <CardHeader>
                            <Mic className="w-10 h-10 text-primary mb-2" />
                            <CardTitle>Create Interviews</CardTitle>
                            <CardDescription>
                                Define questions and criteria for the AI to assess.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Calendar className="w-10 h-10 text-primary mb-2" />
                            <CardTitle>Invite Candidates</CardTitle>
                            <CardDescription>
                                Send public links or invite candidates directly via email/SMS.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Users className="w-10 h-10 text-primary mb-2" />
                            <CardTitle>Review Results</CardTitle>
                            <CardDescription>
                                Get instant transcripts, recordings, and AI scores.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>

            <div className="flex justify-start pt-6">
                <Link href="/docs/getting-started">
                    <Button size="lg" className="gap-2">
                        Get Started <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

DocsIndex.layout = (page: any) => <DocsLayout>{page}</DocsLayout>;
