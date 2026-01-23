import { Head } from '@inertiajs/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, Clock, Scale, MessageSquare, Check, Phone } from 'lucide-react'
import type { PageProps } from '@/types'
import { useVantaEffect } from '@/hooks/useVantaEffect'
import { VoiceVisualizer } from '@/components/VoiceVisualizer'
import Footer from '@/components/Footer'

export default function Landing({ }: PageProps) {
    const vantaRef = useVantaEffect()

    const features = [
        {
            icon: MessageSquare,
            title: "Dynamic Contextual Screening",
            description: "Gennie goes beyond the script. Our agent adapts to candidate answers in real-time, digging deeper to verify true technical knowledge."
        },
        {
            icon: Clock,
            title: "Zero Scheduling Friction",
            description: "Eliminate the calendar ping-pong. Candidates interview the moment they apply, shortening your time-to-hire by days or weeks."
        },
        {
            icon: Scale,
            title: "Standardized Evaluation",
            description: "Stop comparing apples to oranges. Every candidate is assessed against the exact same technical rubric for total consistency."
        },
        {
            icon: Sparkles,
            title: "Automated Shortlisting",
            description: "Don't review every interview. Gennie ranks candidates by performance, surfacing the top 10% directly to your dashboard."
        }
    ]

    const hiringManagerBenefits = [
        {
            title: "Eliminate the Screening Bottleneck",
            description: "Stop reviewing resumes. Start reviewing qualified talent. Reclaim 20+ hours per week."
        },
        {
            title: "Standardized Merit Scoring",
            description: "Evaluate every applicant on strictly defined criteria. Ensure consistency across the board."
        },
        {
            title: "Infinite Scalability",
            description: "Process hiring surges instantly. Handle 50 or 500 applicants without adding headcount."
        },
        {
            title: "Data-Backed Confidence",
            description: "Move candidates forward based on detailed transcripts and technical scores, not just gut feeling."
        }
    ]

    const candidateBenefits = [
        {
            title: "Zero-Wait Scheduling",
            description: "Interview the moment inspiration strikes. No email tag, no calendar conflicts."
        },
        {
            title: "Merit-First Opportunity",
            description: "A dedicated space to demonstrate actual skills and knowledge, strictly on the facts."
        },
        {
            title: "Low-Stress Environment",
            description: "An adaptive, conversational assessment that lets candidates focus on their answers, not their nerves."
        },
        {
            title: "Faster Hiring Decisions",
            description: "Automated initial screenings mean faster feedback loops and less time spent in \"hiring limbo.\""
        }
    ]

    return (
        <>
            <Head>
                <title>Gennie - AI Virtual Recruiter | Voice-Powered Hiring Automation</title>
                <meta
                    name="description"
                    content="Transform your hiring with Gennie, the AI-powered virtual recruiter. Automated candidate screening, voice interviews, and bias-free evaluation available 24/7. Experience intelligent recruitment automation."
                />
                <meta
                    name="keywords"
                    content="AI recruiter, AI recruitment software, voice AI interviewing, automated candidate screening, AI-powered hiring, conversational AI recruiting, AI interview assistant, bias-free recruitment, 24/7 AI interviewing, intelligent hiring automation"
                />

                {/* Open Graph */}
                <meta property="og:title" content="Gennie - AI Virtual Recruiter | Voice-Powered Hiring Automation" />
                <meta property="og:description" content="Transform your hiring with Gennie. Automated AI candidate screening, voice interviews, and bias-free evaluation available 24/7." />
                <meta property="og:type" content="website" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Gennie - AI Virtual Recruiter | Voice-Powered Hiring Automation" />
                <meta name="twitter:description" content="Transform your hiring with Gennie. Automated AI candidate screening, voice interviews, and bias-free evaluation available 24/7." />
            </Head>

            <div className="bg-background text-foreground min-h-screen">
                {/* Hero Section */}
                <section ref={vantaRef} className="relative flex items-center justify-center min-h-[640px] px-4 py-20 overflow-hidden">
                    <div className="max-w-5xl mx-auto w-full relative z-10">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            {/* Left Column - Content */}
                            <div className="space-y-6 text-center md:text-left">
                                {/* Gennie Logo */}
                                <div className="flex justify-center md:justify-start">
                                    <img
                                        src="/gennie.png"
                                        alt="Gennie AI Logo"
                                        className="h-48 w-48 object-contain -mb-10"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                                        Gennie Talent
                                    </h1>
                                    <p className="text-2xl md:text-[27px] text-white/90 font-medium">
                                        Scale Your Hiring, Not Your HR Team
                                    </p>
                                    <p className="text-lg md:text-xl text-white/70 max-w-2xl">
                                        Cut your time-to-hire in half. Gennie conducts live voice interviews for every applicant and instantly delivers the top candidates to your dashboard.
                                    </p>
                                </div>
                            </div>

                            {/* Right Column - CTA */}
                            <div className="flex flex-col items-center justify-center">
                                <a href="/try-gennie" className="inline-block group cursor-pointer">
                                    <div className="flex flex-col items-center gap-4 transition-transform hover:scale-105">
                                        <VoiceVisualizer speakingState="listening" type='hero' />
                                        <p className="text-2xl font-semibold text-white group-hover:text-white/90 transition-colors">
                                            Start Live Interview
                                        </p>
                                        <p className="text-sm text-white/60 max-w-xs text-center -mt-2">
                                            Step into the candidate's shoes. Take a live screening for a Software Engineer role.
                                        </p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                </section>

                {/* Stats Section */}
                <section className="bg-background py-12 px-4 border-y border-primary/20">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-4 gap-8 text-center">
                            <div className="space-y-2">
                                <div className="text-4xl md:text-5xl font-bold text-primary">24/7</div>
                                <p className="text-sm text-muted-foreground">Always Available</p>
                            </div>
                            <div className="space-y-2">
                                <div className="text-4xl md:text-5xl font-bold text-primary">10x</div>
                                <p className="text-sm text-muted-foreground">Faster Screening</p>
                            </div>
                            <div className="space-y-2">
                                <div className="text-4xl md:text-5xl font-bold text-primary">100%</div>
                                <p className="text-sm text-muted-foreground">Consistent Evaluation</p>
                            </div>
                            <div className="space-y-2">
                                <div className="text-4xl md:text-5xl font-bold text-primary">∞</div>
                                <p className="text-sm text-muted-foreground">Concurrent Interviews</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core Features Section */}
                <section className="bg-muted/50 py-20 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                                Built for High-Velocity Hiring
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Transform your hiring funnel from a manual bottleneck into an automated engine.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, index) => {
                                const Icon = feature.icon
                                return (
                                    <Card key={index} className="border-border hover:shadow-md transition-shadow">
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

                {/* Advanced Features for Business */}
                <section className="bg-background py-20 px-4 border-t border-primary/20">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                                Enterprise-Grade Infrastructure
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                A robust suite of tools designed to standardize, document, and accelerate your entire hiring process.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Omnichannel Accessibility */}
                            <Card className="border-border">
                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <Phone className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <MessageSquare className="h-5 w-5 text-primary" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg">Omnichannel Accessibility</CardTitle>
                                    <CardDescription className="pt-2">
                                        Engage candidates where they are. Conduct interviews seamlessly via direct phone call or high-fidelity web audio. Zero friction. No apps required.
                                    </CardDescription>
                                    <div className="pt-3">
                                        <Badge variant="outline" className="text-primary border-primary/50">
                                            Zero friction. No apps required.
                                        </Badge>
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* Intelligent Transcription */}
                            <Card className="border-border">
                                <CardHeader>
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                                        <Clock className="h-5 w-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">Intelligent Transcription</CardTitle>
                                    <CardDescription className="pt-2">
                                        Every second is recorded, transcribed, and indexed. Review a 45-minute interview in 3 minutes of reading. Total recall. Searchable text.
                                    </CardDescription>
                                    <div className="pt-3">
                                        <Badge variant="outline" className="text-primary border-primary/50">
                                            Total recall. Searchable text.
                                        </Badge>
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* Precision Scoring Engine */}
                            <Card className="border-border">
                                <CardHeader>
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">Precision Scoring Engine</CardTitle>
                                    <CardDescription className="pt-2">
                                        Replace "gut feelings" with data. Get instant, rubric-based scores on technical skills and communication. Quantifiable results, instantly.
                                    </CardDescription>
                                    <div className="pt-3">
                                        <Badge variant="outline" className="text-primary border-primary/50">
                                            Quantifiable results, instantly
                                        </Badge>
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* Scalable Interview Blueprints */}
                            <Card className="border-border">
                                <CardHeader>
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                                        <MessageSquare className="h-5 w-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">Scalable Interview Blueprints</CardTitle>
                                    <CardDescription className="pt-2">
                                        Design complex interview workflows for any role—from Junior Dev to VP—and deploy them across your organization. Build once. Hire endlessly.
                                    </CardDescription>
                                    <div className="pt-3">
                                        <Badge variant="outline" className="text-primary border-primary/50">
                                            Build once. Hire endlessly.
                                        </Badge>
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* Dynamic Resume Analysis */}
                            <Card className="border-border">
                                <CardHeader>
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">Dynamic Resume Analysis</CardTitle>
                                    <CardDescription className="pt-2">
                                        The AI doesn't just ask questions; it cross-references the candidate's resume with your job description to probe specific gaps. Deeply personalized. Never generic.
                                    </CardDescription>
                                    <div className="pt-3">
                                        <Badge variant="outline" className="text-primary border-primary/50">
                                            Deeply personalized. Never generic.
                                        </Badge>
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* Recruitment Command Center */}
                            <Card className="border-border">
                                <CardHeader>
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                                        <Scale className="h-5 w-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">Recruitment Command Center</CardTitle>
                                    <CardDescription className="pt-2">
                                        Visualize your entire funnel. Track pass rates, average scores, and volume metrics to identify your best sources of talent. Optimize your pipeline in real-time.
                                    </CardDescription>
                                    <div className="pt-3">
                                        <Badge variant="outline" className="text-primary border-primary/50">
                                            Optimize your pipeline in real-time
                                        </Badge>
                                    </div>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Benefits Section - Streamlined */}
                <section className="bg-muted/50 py-20 px-4 border-t border-primary/20">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                                A Better Experience for Both Sides of the Table
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Optimizing the workflow for teams while respecting the candidate's time.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                            {/* For Hiring Managers */}
                            <Card className="border-border">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-primary">
                                        For Hiring Managers
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Focus: Efficiency, Control, and Data.
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {hiringManagerBenefits.map((benefit, index) => (
                                            <div key={index} className="space-y-1">
                                                <div className="flex items-start">
                                                    <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-semibold text-foreground">{benefit.title}</h4>
                                                        <p className="text-sm text-muted-foreground mt-1">{benefit.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* For Candidates */}
                            <Card className="border-border">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-primary">
                                        For Candidates
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Focus: Autonomy, Speed, and Fairness.
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {candidateBenefits.map((benefit, index) => (
                                            <div key={index} className="space-y-1">
                                                <div className="flex items-start">
                                                    <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-semibold text-foreground">{benefit.title}</h4>
                                                        <p className="text-sm text-muted-foreground mt-1">{benefit.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-background py-20 px-4 border-t border-primary/20">
                    <div className="max-w-7xl mx-auto text-center space-y-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary">
                            Unlock Infinite Interview Capacity
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Don't let your calendar be the bottleneck. Clear your backlog and process every candidate instantly.
                        </p>
                        <a href="/login" className="inline-block mt-6">
                            <Button size="lg" className="text-lg px-8 py-6">
                                Join Gennie Talent Now
                            </Button>
                        </a>
                    </div>
                </section>
            </div>

            <Footer />
        </>
    )
}
