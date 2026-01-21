import { Head, Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CircleDot, Sparkles, Clock, Scale, MessageSquare, Check } from 'lucide-react'
import type { PageProps } from '@/types'
import { useVantaEffect } from '@/hooks/useVantaEffect'

export default function Landing({ }: PageProps) {
    const vantaRef = useVantaEffect()

    const features = [
        {
            icon: Sparkles,
            title: "AI-Powered Screening",
            description: "Advanced AI evaluates candidates consistently, asking the right questions every time."
        },
        {
            icon: Clock,
            title: "24/7 Availability",
            description: "Interview candidates any time, anywhere. No scheduling conflicts or delays."
        },
        {
            icon: Scale,
            title: "Fair & Unbiased",
            description: "Every candidate gets the same fair evaluation, eliminating unconscious bias."
        },
        {
            icon: MessageSquare,
            title: "Instant Feedback",
            description: "Candidates receive immediate responses and clear communication throughout."
        }
    ]

    const recruiterBenefits = [
        "Save hours on initial screening interviews",
        "Reduce unconscious bias in hiring decisions",
        "Scale your hiring process effortlessly",
        "Get consistent, structured candidate insights"
    ]

    const candidateBenefits = [
        "Interview on your schedule, any time",
        "Fair evaluation without human bias",
        "Comfortable, pressure-free experience",
        "Instant feedback and clear next steps"
    ]

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
                <section ref={vantaRef} className="relative flex items-center justify-center h-[500px] px-4 py-20 overflow-hidden">
                    <div className="max-w-4xl text-center space-y-8 relative z-10">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                                Meet Gennie
                            </h1>
                            <p className="text-2xl md:text-3xl text-white/90">
                                Your AI Recruiting Assistant
                            </p>
                            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
                                Experience fair, intelligent, and efficient recruiting. Available 24/7 to screen candidates with consistency and without bias.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                            <Link href="/gennie">
                                <Button size="lg" className="text-xl px-10 py-6 bg-white text-[#1e1b4b] hover:bg-white/90">
                                    <CircleDot className="h-6 w-6 mr-2" />
                                    Try Gennie Now
                                </Button>
                            </Link>
                        </div>
                    </div>

                </section>

                {/* Features Section */}
                <section className="bg-muted/50 py-20 px-4 border-t border-primary/20">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
                            Why Choose Gennie?
                        </h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, index) => {
                                const Icon = feature.icon
                                return (
                                    <Card key={index} className="border-border">
                                        <CardHeader>
                                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <CardTitle className="text-xl">
                                                {feature.title}
                                            </CardTitle>
                                            <CardDescription className="pt-2">
                                                {feature.description}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="bg-muted/50 py-20 px-4 border-t border-primary/20">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12">
                            {/* For Recruiters */}
                            <div className="space-y-6">
                                <h3 className="text-2xl md:text-3xl font-bold text-primary">
                                    For Recruiters
                                </h3>
                                <ul className="space-y-4">
                                    {recruiterBenefits.map((benefit, index) => (
                                        <li key={index} className="flex items-start text-muted-foreground">
                                            <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* For Candidates */}
                            <div className="space-y-6">
                                <h3 className="text-2xl md:text-3xl font-bold text-primary">
                                    For Candidates
                                </h3>
                                <ul className="space-y-4">
                                    {candidateBenefits.map((benefit, index) => (
                                        <li key={index} className="flex items-start text-muted-foreground">
                                            <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-muted/50 py-20 px-4 border-t border-primary/20">
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
                                    <CircleDot className="h-5 w-5 mr-2" />
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
