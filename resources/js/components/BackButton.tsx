import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
    /** Fallback URL if no history exists (first page visit) */
    fallback?: string;
    /** Custom label - defaults to "Back" */
    label?: string;
    /** Button variant */
    variant?: 'ghost' | 'outline' | 'default';
    /** Additional className */
    className?: string;
}

/**
 * Smart back button that uses browser history when available,
 * or falls back to a specified URL if this is the first page.
 */
export function BackButton({
    fallback = '/dashboard',
    label = 'Back',
    variant = 'ghost',
    className
}: BackButtonProps) {
    const handleBack = () => {
        // Check if we have history to go back to
        // window.history.length > 1 means there's a previous page
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // No history - use fallback
            router.visit(fallback);
        }
    };

    return (
        <Button
            variant={variant}
            onClick={handleBack}
            className={cn(
                "gap-2",
                variant === 'ghost' && "pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground",
                className
            )}
        >
            <ArrowLeft className="h-5 w-5" />
            {label}
        </Button>
    );
}
