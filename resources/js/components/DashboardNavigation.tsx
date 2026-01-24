import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Mic, Briefcase, ClipboardList, Users } from 'lucide-react';

type NavigationTab = 'interviews' | 'job-descriptions' | 'logs' | 'candidates';

interface DashboardNavigationProps {
    activeTab: NavigationTab;
}

export default function DashboardNavigation({ activeTab }: DashboardNavigationProps) {
    return (
        <div className="bg-background border border-zinc-200 dark:border-zinc-700 p-1 rounded-lg flex w-full divide-x divide-zinc-200 dark:divide-zinc-700">
            <Link
                href="/dashboard"
                className={cn(
                    "flex-1 px-3 py-2 text-xs md:text-sm rounded-l-md transition-colors flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2",
                    activeTab === 'interviews'
                        ? "bg-primary/10 text-primary shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
                )}
            >
                <Mic className="h-5 w-5 md:h-4 md:w-4" strokeWidth={activeTab === 'interviews' ? 2.5 : 2} />
                <span>Interviews</span>
            </Link>
            <Link
                href="/interviews/logs"
                className={cn(
                    "flex-1 px-3 py-2 text-xs md:text-sm transition-colors flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2",
                    activeTab === 'logs'
                        ? "bg-primary/10 text-primary shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
                )}
            >
                <ClipboardList className="h-5 w-5 md:h-4 md:w-4" strokeWidth={activeTab === 'logs' ? 2.5 : 2} />
                <span className="md:hidden">Logs</span>
                <span className="hidden md:inline">Interview Logs</span>
            </Link>
            <Link
                href="/job-descriptions"
                className={cn(
                    "flex-1 px-3 py-2 text-xs md:text-sm transition-colors flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2",
                    activeTab === 'job-descriptions'
                        ? "bg-primary/10 text-primary shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
                )}
            >
                <Briefcase className="h-5 w-5 md:h-4 md:w-4" strokeWidth={activeTab === 'job-descriptions' ? 2.5 : 2} />
                <span className="md:hidden">Jobs</span>
                <span className="hidden md:inline">Job Descriptions</span>
            </Link>
            <Link
                href="/candidates"
                className={cn(
                    "flex-1 px-3 py-2 text-xs md:text-sm rounded-r-md transition-colors flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2",
                    activeTab === 'candidates'
                        ? "bg-primary/10 text-primary shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
                )}
            >
                <Users className="h-5 w-5 md:h-4 md:w-4" strokeWidth={activeTab === 'candidates' ? 2.5 : 2} />
                <span>Candidates</span>
            </Link>
        </div>
    );
}
