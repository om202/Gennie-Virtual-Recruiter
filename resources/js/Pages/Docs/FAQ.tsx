import DocsLayout from './DocsLayout';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
    const faqs = [
        {
            question: "Can I customize the interview questions?",
            answer: "Yes! When you create an interview, you can either let Gennie generate questions based on your Job Description or manually input your own specific questions."
        },
        {
            question: "How do candidates access the interview?",
            answer: "Gennie provides a unique, secure link for each interview. You can email this link directly to candidates or include it in your automated email sequences."
        },
        {
            question: "What happens if a candidate has a bad internet connection?",
            answer: "Gennie is designed to handle network fluctuations. If a drop occurs, the candidate can reconnect and resume the interview from where they left off."
        },
        {
            question: "Can I change the AI interviewer's voice?",
            answer: "Currently, Gennie uses a standardized professional voice optimized for clarity. We are working on voice customization options for future updates."
        },
        {
            question: "Is the candidate data secure?",
            answer: "Absolutely. All recordings and transcripts are encrypted and stored securely. Only authorized members of your organization can access candidate data."
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
                    Frequently Asked Questions
                </h1>
                <p className="mt-4 text-muted-foreground">
                    Common questions about using Gennie for your recruiting process.
                </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}

FAQ.layout = (page: any) => <DocsLayout>{page}</DocsLayout>;
