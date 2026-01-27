import { Head } from '@inertiajs/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, MessageSquare, Check, Phone, ArrowRight, Mic, BarChart3, Users, FileText, Calendar, Shield, Zap, Globe, Brain, Clock } from 'lucide-react'
import type { PageProps } from '@/types'
import { useVantaEffect } from '@/hooks/useVantaEffect'
import { VoiceVisualizer } from '@/components/VoiceVisualizer'
import Footer from '@/components/Footer'
import { useState } from 'react'

export default function Landing({ }: PageProps) {
    const vantaRef = useVantaEffect()
    const [activeFeature, setActiveFeature] = useState(0)

    const howItWorks = [
        {
            step: "1",
            title: "Create Your Interview",
            description: "Paste your job description and let Gennie generate tailored screening questions."
        },
        {
            step: "2",
            title: "Share the Link",
            description: "Candidates self-schedule and interview via phone or browser."
        },
        {
            step: "3",
            title: "AI Conducts Interviews",
            description: "Natural voice conversations with intelligent follow-up questions."
        },
        {
            step: "4",
            title: "Review Top Candidates",
            description: "Get transcripts, AI scores, and rankings delivered instantly."
        }
    ]

    const featureTabs = [
        {
            id: 'screen',
            label: 'Screen',
            icon: Mic,
            title: 'Voice AI That Interviews Like You Would',
            description: 'Gennie conducts natural voice conversations via phone or browser. It asks your questions, listens to responses, and probes deeper when answers are vague. Every candidate gets a consistent, professional experience.',
            highlights: ['Phone & browser interviews', 'Smart follow-up questions', 'Consistent for every candidate']
        },
        {
            id: 'evaluate',
            label: 'Evaluate',
            icon: BarChart3,
            title: 'Instant Scoring and Transcripts',
            description: 'Every interview produces a complete transcript, audio recording, and AI-generated score. Review a 20-minute interview in 3 minutes of reading. Compare candidates objectively with standardized rubrics.',
            highlights: ['Full transcripts & recordings', 'AI-powered scoring', 'Side-by-side comparison']
        },
        {
            id: 'scale',
            label: 'Scale',
            icon: Globe,
            title: 'Interview 100 Candidates Simultaneously',
            description: 'No more scheduling bottlenecks. Gennie interviews every applicant the moment they are ready, day or night. Handle hiring surges without adding headcount or burning out your team.',
            highlights: ['24/7 availability', 'Unlimited concurrent interviews', 'Zero scheduling friction']
        }
    ]

    const capabilities = [
        {
            icon: Phone,
            title: "Phone & Web",
            description: "Candidates choose their preferred interview method."
        },
        {
            icon: MessageSquare,
            title: "Smart Follow-ups",
            description: "AI probes deeper when answers are unclear."
        },
        {
            icon: FileText,
            title: "Full Transcripts",
            description: "Every word captured, searchable, and reviewable."
        },
        {
            icon: Shield,
            title: "Fair Evaluation",
            description: "Same questions and rubric for every candidate."
        },
        {
            icon: Brain,
            title: "AI Scoring",
            description: "Automatic scoring on skills and communication."
        },
        {
            icon: Clock,
            title: "Instant Results",
            description: "Scores ready the moment the interview ends."
        }
    ]

    return (
        <>
            <Head>
                <title>Gennie - AI Voice Recruiter | Automated Screening Interviews</title>
                <meta
                    name="description"
                    content="Transform your hiring with Gennie, the AI-powered voice recruiter. Automated candidate screening, live voice interviews, and instant AI scoring. Available 24/7."
                />
                <meta
                    name="keywords"
                    content="AI recruiter, AI recruitment software, voice AI interviewing, automated candidate screening, AI-powered hiring, AI interview assistant, 24/7 AI interviewing"
                />
                <meta property="og:title" content="Gennie - AI Voice Recruiter | Automated Screening Interviews" />
                <meta property="og:description" content="Transform your hiring with Gennie. Automated AI screening interviews, natural voice conversations, and instant AI scoring. Available 24/7." />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Gennie - AI Voice Recruiter | Automated Screening Interviews" />
                <meta name="twitter:description" content="Transform your hiring with Gennie. Automated AI screening interviews and instant scoring. Available 24/7." />
            </Head>

            <div className="bg-background text-foreground min-h-screen">
                {/* Hero Section */}
                <section ref={vantaRef} className="relative flex items-center justify-center min-h-[680px] px-4 py-24 overflow-hidden">
                    <div className="max-w-6xl mx-auto w-full relative z-10">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8 text-center md:text-left">
                                <div className="flex justify-center md:justify-start">
                                    <img
                                        src="/gennie.png"
                                        alt="Gennie AI Logo"
                                        className="h-44 w-44 object-contain -mb-8"
                                    />
                                </div>
                                <div className="space-y-5">
                                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
                                        Gennie Talent
                                    </h1>
                                    <p className="text-2xl md:text-3xl text-white/90 font-medium">
                                        Scale Your Hiring, Not Your HR Team
                                    </p>
                                    <p className="text-lg text-white/70 max-w-xl leading-relaxed">
                                        Cut your time-to-hire in half. Gennie conducts live voice interviews for every applicant and delivers qualified candidates directly to your dashboard.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center">
                                <a href="/try-gennie" className="inline-block group">
                                    <div className="flex flex-col items-center gap-5 transition-transform duration-200 group-hover:scale-[1.02]">
                                        <VoiceVisualizer speakingState="listening" type='hero' />
                                        <div className="text-center space-y-1">
                                            <p className="text-2xl font-semibold text-white flex items-center gap-2 justify-center">
                                                Start Live Interview
                                                <ArrowRight className="h-5 w-5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                                            </p>
                                            <p className="text-sm text-white/60 max-w-xs">
                                                Step into the candidate's shoes. Take a live screening for a Software Engineer role.
                                            </p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-20 px-4 border-b border-border">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-14">
                            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
                                How It Works
                            </h2>
                            <p className="text-muted-foreground">
                                From job posting to qualified candidates in four simple steps.
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row items-stretch justify-between gap-4">
                            {howItWorks.map((item, index) => {
                                return (
                                    <div key={index} className="flex items-center flex-1">
                                        <div className="flex-1 bg-card border border-border/60 rounded-xl p-6 text-center">
                                            <div className="flex items-center justify-center mb-4">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                                                    {item.step}
                                                </div>
                                            </div>
                                            <h3 className="font-semibold text-foreground mb-2">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>

                                        {index < howItWorks.length - 1 && (
                                            <div className="hidden md:flex items-center justify-center w-8 flex-shrink-0">
                                                <svg
                                                    className="w-5 h-5 text-muted-foreground/50"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* Feature Tabs Section */}
                <section className="py-24 px-4 bg-muted/40">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
                                Everything You Need to Hire Faster
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                From first contact to final decision, Gennie handles the heavy lifting.
                            </p>
                        </div>

                        {/* Tab Buttons */}
                        <div className="flex justify-center mb-10">
                            <div className="inline-flex bg-background border border-border rounded-lg p-1">
                                {featureTabs.map((tab, index) => {
                                    const Icon = tab.icon
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveFeature(index)}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all ${activeFeature === index
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {tab.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                                    {featureTabs[activeFeature].title}
                                </h3>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    {featureTabs[activeFeature].description}
                                </p>
                                <div className="space-y-3 pt-2">
                                    {featureTabs[activeFeature].highlights.map((highlight, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <Check className="h-3 w-3 text-primary" />
                                            </div>
                                            <span className="text-foreground">{highlight}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-center">
                                {activeFeature === 0 && (
                                    <img
                                        src="/images/story-solution.webp"
                                        alt="AI voice interview"
                                        className="w-full max-w-lg object-cover"
                                    />
                                )}
                                {activeFeature === 1 && (
                                    <img
                                        src="/images/story-results.webp"
                                        alt="Candidate dashboard"
                                        className="w-full max-w-lg object-cover"
                                    />
                                )}
                                {activeFeature === 2 && (
                                    <img
                                        src="/images/story-problem.webp"
                                        alt="Scale hiring"
                                        className="w-full max-w-lg object-cover"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Capabilities Grid */}
                <section className="py-20 px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
                                Built for Recruiting at Scale
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {capabilities.map((item, index) => {
                                const Icon = item.icon
                                return (
                                    <Card
                                        key={index}
                                        className="border-border/60 bg-card text-center"
                                    >
                                        <CardContent className="pt-6 pb-6">
                                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="font-semibold text-foreground mb-2">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {item.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* Benefits */}
                <section className="py-20 px-4 bg-muted/40">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
                                Built for Everyone
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Gennie transforms the hiring experience for both teams and candidates.
                            </p>
                        </div>

                        {/* Tab Buttons */}
                        <div className="flex justify-center mb-10">
                            <div className="inline-flex bg-background border border-border rounded-lg p-1">
                                <button
                                    onClick={() => setActiveFeature(0)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all ${activeFeature === 0
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <Users className="h-4 w-4" />
                                    For Your Team
                                </button>
                                <button
                                    onClick={() => setActiveFeature(1)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all ${activeFeature === 1
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <Mic className="h-4 w-4" />
                                    For Candidates
                                </button>
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                {activeFeature === 0 ? (
                                    <>
                                        <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                                            Reclaim Your Time, Scale Your Hiring
                                        </h3>
                                        <p className="text-muted-foreground text-lg leading-relaxed">
                                            Stop spending hours on initial screenings. Gennie interviews every candidate with the same rubric, delivering consistent evaluations backed by full transcripts and AI scoring.
                                        </p>
                                        <div className="space-y-3 pt-2">
                                            {[
                                                "Reclaim 20+ hours per week spent on screening",
                                                "Evaluate every candidate with the same rubric",
                                                "Handle hiring surges without adding headcount",
                                                "Make decisions backed by transcripts and scores"
                                            ].map((benefit, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <Check className="h-3 w-3 text-primary" />
                                                    </div>
                                                    <span className="text-foreground">{benefit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                                            A Fair, Flexible Interview Experience
                                        </h3>
                                        <p className="text-muted-foreground text-lg leading-relaxed">
                                            Interview on your own schedule, any time of day. Gennie conducts natural conversations focused on your skills, not stressful quizzes, ensuring every candidate gets a fair evaluation.
                                        </p>
                                        <div className="space-y-3 pt-2">
                                            {[
                                                "Interview on your schedule, anytime",
                                                "Fair, consistent process focused on skills",
                                                "Natural conversation, not stressful quizzes",
                                                "Faster feedback on your application"
                                            ].map((benefit, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <Check className="h-3 w-3 text-primary" />
                                                    </div>
                                                    <span className="text-foreground">{benefit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex justify-center">
                                {activeFeature === 0 ? (
                                    <img
                                        src="/images/team.webp"
                                        alt="Team collaboration"
                                        className="w-full max-w-lg object-contain"
                                    />
                                ) : (
                                    <img
                                        src="/images/candidate.webp"
                                        alt="Candidate experience"
                                        className="w-full max-w-lg object-contain"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20 px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <div className="flex justify-center mb-4">
                            <img
                                src="/gennie.png"
                                alt="Gennie AI Logo"
                                className="h-32 w-32 object-contain"
                            />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-primary">
                            Ready to Transform Your Hiring?
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                            Join recruiting teams who save hours every week with automated AI interviews.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <a href="/login">
                                <Button size="lg" className="text-base px-8 h-12 w-full sm:w-auto">
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </a>
                            <a href="/try-gennie">
                                <Button size="lg" variant="outline" className="text-base px-8 h-12 w-full sm:w-auto">
                                    Try a Demo Interview
                                </Button>
                            </a>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            No credit card required. Set up in 5 minutes.
                        </p>
                    </div>
                </section>
            </div>

            <Footer />
        </>
    )
}
