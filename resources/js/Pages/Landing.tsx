import { Head } from '@inertiajs/react'

import { Button } from '@/components/ui/button'
import { Sparkles, Check, ArrowRight, Mic, BarChart3, Users, Globe, ChevronLeft, ChevronRight } from 'lucide-react'
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
            image: "/images/phone_interview.webp",
            title: "Phone Interviews",
            description: "Candidates can interview via phone call at their convenience, anytime and anywhere. No app downloads or technical setup required. Just a simple phone call to get started with their screening interview."
        },
        {
            image: "/images/web_interview.webp",
            title: "Web Interviews",
            description: "Browser-based interviews with no downloads or installations required. Candidates can complete their screening directly from any modern web browser, making the process seamless and accessible from any device."
        },
        {
            image: "/images/smart_followup_interview.webp",
            title: "Smart Follow-ups",
            description: "AI probes deeper when answers are unclear or incomplete, asking intelligent follow-up questions based on the candidate's responses. This creates a natural, conversational experience that reveals true competency and communication skills."
        },
        {
            image: "/images/transcript_interview.webp",
            title: "Full Transcripts",
            description: "Every word captured, searchable, and reviewable in detail. Complete transcripts are generated automatically for every interview, allowing you to review conversations at your own pace and search for specific keywords or topics."
        },
        {
            image: "/images/score_interview.webp",
            title: "AI Scoring",
            description: "Automatic scoring on skills, communication, and fit with instant results. Our AI analyzes each interview using a consistent rubric, evaluating technical competency, behavioral responses, and overall candidate quality to help you make faster, data-driven decisions."
        },
        {
            image: "/images/dashboard_interview.webp",
            title: "Unified Dashboard",
            description: "Manage all candidates and interviews from one central location. Track application status, review scores, compare candidates side-by-side, and access complete interview history all in a clean, intuitive interface designed for recruiting teams."
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
                                            </p>
                                            <p className="text-base text-white/60 max-w-xs">
                                                Step into the candidate's shoes. Take a live screening for a Software Engineer role.
                                            </p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature Tabs Section */}
                <section className="py-20 px-4 bg-muted/40 border-b border-border">
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
                        <div className="flex justify-center mb-8">
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
                        <div className="relative">
                            <div className="grid md:grid-cols-2 gap-8 items-center">
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

                            {/* Navigation Buttons */}
                            <button
                                onClick={() => setActiveFeature((activeFeature - 1 + featureTabs.length) % featureTabs.length)}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-10 h-10 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
                                aria-label="Previous feature"
                            >
                                <ChevronLeft className="w-5 h-5 text-foreground" />
                            </button>
                            <button
                                onClick={() => setActiveFeature((activeFeature + 1) % featureTabs.length)}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-10 h-10 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
                                aria-label="Next feature"
                            >
                                <ChevronRight className="w-5 h-5 text-foreground" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-20 px-4 border-b border-border">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
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

                {/* Capabilities Grid */}
                <section className="py-20 px-4 border-b border-border">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
                                Built for Recruiting at Scale
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {capabilities.map((item, index) => {
                                return (
                                    <div
                                        key={index}
                                        className="text-center"
                                    >
                                        <div className="mb-4 flex justify-center overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-56 h-56 object-cover rounded-lg scale-150 contrast-[1.15]"
                                            />
                                        </div>
                                        <h3 className="font-semibold text-foreground mb-2 text-lg">
                                            {item.title}
                                        </h3>
                                        <p className="text-base text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* Benefits */}
                <section className="py-20 px-4 bg-muted/40 border-b border-border">
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
                        <div className="flex justify-center mb-8">
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
                        <div className="grid md:grid-cols-2 gap-8 items-center">
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
