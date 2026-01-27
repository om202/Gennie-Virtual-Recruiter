import DocsLayout from './DocsLayout';
import { Separator } from '@/components/ui/separator';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
    const faqCategories = [
        {
            category: "Getting Started",
            faqs: [
                {
                    question: "How long does it take to set up Gennie?",
                    answer: "Most users complete the initial setup in under 10 minutes. Simply upload your job description, configure your interview questions, and you're ready to invite candidates."
                },
                {
                    question: "Do I need any technical skills to use Gennie?",
                    answer: "Not at all! Gennie is designed for recruiters and HR professionals. The interface is intuitive and requires no coding or technical knowledge."
                },
            ]
        },
        {
            category: "Interviews",
            faqs: [
                {
                    question: "Can I customize the interview questions?",
                    answer: "Yes! When you create an interview, you can either let Gennie generate questions based on your Job Description or manually input your own specific questions. You can also edit AI-generated questions before publishing."
                },
                {
                    question: "How long is a typical AI interview?",
                    answer: "You control the duration! Most screening interviews are set between 10-20 minutes. The AI will pace the conversation to cover all key topics within your specified time limit."
                },
                {
                    question: "Can Gennie ask follow-up questions?",
                    answer: "Yes. Gennie is designed to ask intelligent follow-up questions if a candidate gives a vague or incomplete answer. This ensures you get the depth of information you need."
                },
            ]
        },
        {
            category: "Candidates",
            faqs: [
                {
                    question: "How do candidates access the interview?",
                    answer: "Gennie provides a unique, secure link for each interview. You can email this link directly to candidates or publish it on your careers page for high-volume applications."
                },
                {
                    question: "What happens if a candidate has a bad internet connection?",
                    answer: "Gennie is designed to handle network fluctuations. If a drop occurs, the candidate can reconnect and resume the interview from where they left off. All progress is saved automatically."
                },
                {
                    question: "Can candidates reschedule their interview?",
                    answer: "Yes, candidates can reschedule via the link in their confirmation email, subject to the time slots you have made available."
                },
            ]
        },
        {
            category: "Technology & Security",
            faqs: [
                {
                    question: "Can I change the AI interviewer's voice?",
                    answer: "Currently, Gennie uses a standardized professional voice optimized for clarity and natural conversation. Voice customization options are on our roadmap for future updates."
                },
                {
                    question: "Is the candidate data secure?",
                    answer: "Absolutely. All recordings and transcripts are encrypted in transit and at rest. Only authorized members of your organization can access candidate data. We comply with industry-standard security practices."
                },
                {
                    question: "What devices can candidates use?",
                    answer: "Candidates can take the interview from any modern web browser on a laptop, tablet, or smartphone. No app installation is required."
                },
            ]
        },
        {
            category: "Results & Analytics",
            faqs: [
                {
                    question: "How accurate is the AI scoring?",
                    answer: "AI scores are generated based on keyword matching, answer relevance, and sentiment analysis against your job description criteria. They are meant to be a helpful guide, not a final decision. We always recommend human review for the final hiring decision."
                },
                {
                    question: "Can I share interview results with my team?",
                    answer: "Yes! You can invite team members to your Gennie workspace. They will be able to view candidate profiles, listen to recordings, and read transcripts."
                },
            ]
        },
        {
            category: "Scheduling",
            faqs: [
                {
                    question: "How does self-scheduling work?",
                    answer: "After a candidate applies, they receive an email with a 'Schedule Your Interview' button. They can pick any available 5-minute slot between 7 AM and 10 PM in their timezone. Gennie will call them at the scheduled time."
                },
                {
                    question: "Can candidates change their scheduled time?",
                    answer: "Yes, candidates can reschedule or cancel via links in their confirmation email. You can also reschedule on their behalf from the candidate management screen."
                },
                {
                    question: "What time zones are supported?",
                    answer: "Gennie supports all global time zones. Candidates see available slots in their local time, and all scheduled times are converted automatically for both parties."
                },
            ]
        },
        {
            category: "Billing & Plans",
            faqs: [
                {
                    question: "What plans are available?",
                    answer: "We offer Starter, Professional, and Enterprise plans. Each tier includes more interviews per month, team seats, and features like priority support and custom integrations."
                },
                {
                    question: "Can I upgrade or downgrade my plan?",
                    answer: "Yes, you can change your plan at any time from Settings → Billing. Changes take effect on your next billing cycle, and upgrades are pro-rated."
                },
                {
                    question: "Is there a free trial?",
                    answer: "Yes! New accounts get 14 days of full access to explore all features. No credit card required to start your trial."
                },
            ]
        },
        {
            category: "Troubleshooting",
            faqs: [
                {
                    question: "The candidate says the call never came",
                    answer: "Check if the phone number is correctly formatted with country code. Ensure the interview was scheduled for the correct timezone. You can resend the interview invitation or manually trigger a call from the candidate page."
                },
                {
                    question: "Audio quality issues during the interview",
                    answer: "Gennie uses high-quality VoIP. If candidates report issues, ask them to: 1) Move to a quieter location, 2) Use a headset if available, 3) For web interviews, try Chrome browser for best compatibility."
                },
                {
                    question: "Interview was cut short unexpectedly",
                    answer: "Check the Session Log for error details. Common causes: candidate lost signal, call duration exceeded plan limits, or candidate said 'end interview' which triggers early completion. You can invite them to re-interview if needed."
                },
            ]
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
                    Frequently Asked Questions
                </h1>
                <p className="mt-4 text-muted-foreground">
                    Everything you need to know about using Gennie for your recruiting process.
                </p>
            </div>

            <div className="space-y-8">
                {faqCategories.map((category, catIndex) => (
                    <div key={catIndex}>
                        <h2 className="text-lg font-semibold mb-3 text-foreground/90">{category.category}</h2>
                        <Accordion type="single" collapsible className="w-full">
                            {category.faqs.map((faq, index) => (
                                <AccordionItem key={index} value={`cat-${catIndex}-item-${index}`}>
                                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                        {catIndex < faqCategories.length - 1 && <Separator className="mt-6" />}
                    </div>
                ))}
            </div>

            <div className="mt-8 p-6 rounded-lg border bg-muted/50">
                <h3 className="font-semibold mb-2">Still have questions?</h3>
                <p className="text-sm text-muted-foreground">
                    If you can't find the answer you're looking for, reach out to our support team and we'll get back to you within 24 hours.
                </p>
            </div>
        </div>
    );
}

FAQ.layout = (page: any) => <DocsLayout>{page}</DocsLayout>;
