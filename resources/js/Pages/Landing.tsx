import { Head, Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Sparkles, Clock, Scale, MessageSquare } from 'lucide-react'
import type { PageProps } from '@/types'

export default function Landing({ }: PageProps) {
    return (
        <>
            <Head>
                <title>Gennie - AI Virtual Recruiter</title>
                <meta
                    name="description"
                    content="Experience fair, intelligent, and efficient recruiting with Gennie - your AI-powered virtual recruiter available 24/7."
                />
            </Head>

            <div className="bg-background text-foreground min-h-screen">
                {/* Hero Section */}
                <section className="flex items-center justify-center min-h-screen px-4 py-20">
                    <div className="max-w-4xl text-center space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary">
                                Meet Gennie
                            </h1>
                            <p className="text-2xl md:text-3xl text-foreground">
                                Your AI Recruiting Assistant
                            </p>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                                Experience fair, intelligent, and efficient recruiting. Available 24/7 to screen candidates with consistency and without bias.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                            <Link href="/gennie">
                                <Button size="lg" className="text-lg px-8">
                                    <Sparkles className="h-5 w-5 mr-2" />
                                    Try Gennie Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-muted/50 py-20 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
                            Why Choose Gennie?
                        </h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {/* Feature 1 */}
                            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Sparkles className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-card-foreground">
                                    AI-Powered Screening
                                </h3>
                                <p className="text-muted-foreground">
                                    Advanced AI evaluates candidates consistently, asking the right questions every time.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
                                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-secondary" />
                                </div>
                                <h3 className="text-xl font-semibold text-card-foreground">
                                    24/7 Availability
                                </h3>
                                <p className="text-muted-foreground">
                                    Interview candidates any time, anywhere. No scheduling conflicts or delays.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
                                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                                    <Scale className="h-6 w-6 text-accent-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold text-card-foreground">
                                    Fair & Unbiased
                                </h3>
                                <p className="text-muted-foreground">
                                    Every candidate gets the same fair evaluation, eliminating unconscious bias.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <MessageSquare className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-card-foreground">
                                    Instant Feedback
                                </h3>
                                <p className="text-muted-foreground">
                                    Candidates receive immediate responses and clear communication throughout.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-20 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12">
                            {/* For Recruiters */}
                            <div className="space-y-6">
                                <h3 className="text-2xl md:text-3xl font-bold text-primary">
                                    For Recruiters
                                </h3>
                                <ul className="space-y-4 text-muted-foreground">
                                    <li className="flex items-start">
                                        <span className="text-secondary mr-3 mt-1">✓</span>
                                        <span>Save hours on initial screening interviews</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-secondary mr-3 mt-1">✓</span>
                                        <span>Reduce unconscious bias in hiring decisions</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-secondary mr-3 mt-1">✓</span>
                                        <span>Scale your hiring process effortlessly</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-secondary mr-3 mt-1">✓</span>
                                        <span>Get consistent, structured candidate insights</span>
                                    </li>
                                </ul>
                            </div>

                            {/* For Candidates */}
                            <div className="space-y-6">
                                <h3 className="text-2xl md:text-3xl font-bold text-primary">
                                    For Candidates
                                </h3>
                                <ul className="space-y-4 text-muted-foreground">
                                    <li className="flex items-start">
                                        <span className="text-secondary mr-3 mt-1">✓</span>
                                        <span>Interview on your schedule, any time</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-secondary mr-3 mt-1">✓</span>
                                        <span>Fair evaluation without human bias</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-secondary mr-3 mt-1">✓</span>
                                        <span>Comfortable, pressure-free experience</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-secondary mr-3 mt-1">✓</span>
                                        <span>Instant feedback and clear next steps</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-primary/5 py-20 px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary">
                            Ready to Experience AI Recruiting?
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Start your conversation with Gennie now. It's fast, fair, and available 24/7.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/gennie">
                                <Button size="lg" className="text-lg px-8">
                                    <Sparkles className="h-5 w-5 mr-2" />
                                    Start Interview
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}
