import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

type NavigationTab = 'interviews' | 'job-descriptions' | 'logs' | 'candidates';

interface DashboardNavigationProps {
    activeTab: NavigationTab;
}

export default function DashboardNavigation({ activeTab }: DashboardNavigationProps) {
    return (
        <div className="border-b">
            <div className="flex gap-6">
                <Link
                    href="/dashboard"
                    className={cn(
                        "pb-3 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'interviews'
                            ? "text-primary border-primary"
                            : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                    )}
                >
                    Your Interviews
                </Link>
                <Link
                    href="/job-descriptions"
                    className={cn(
                        "pb-3 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'job-descriptions'
                            ? "text-primary border-primary"
                            : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                    )}
                >
                    Job Descriptions
                </Link>
                <Link
                    href="/interviews/logs"
                    className={cn(
                        "pb-3 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'logs'
                            ? "text-primary border-primary"
                            : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                    )}
                >
                    Interview Logs
                </Link>
                <Link
                    href="/candidates"
                    className={cn(
                        "pb-3 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'candidates'
                            ? "text-primary border-primary"
                            : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                    )}
                >
                    Candidates
                </Link>
            </div>
        </div>
    );
}
