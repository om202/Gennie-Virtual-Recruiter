import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Mic, Briefcase, ClipboardList, Users, Calendar } from 'lucide-react';

type NavigationTab = 'interviews' | 'job-descriptions' | 'logs' | 'candidates' | 'schedules';

interface SidebarProps {
    activeTab: NavigationTab;
}

export default function Sidebar({ activeTab }: SidebarProps) {
    const navItems = [
        {
            name: 'Interviews',
            href: '/dashboard',
            icon: Mic,
            tab: 'interviews' as NavigationTab,
        },
        {
            name: 'Logs',
            desktopName: 'Interview Logs',
            href: '/interviews/logs',
            icon: ClipboardList,
            tab: 'logs' as NavigationTab,
        },
        {
            name: 'Jobs',
            desktopName: 'Job Descriptions',
            href: '/job-descriptions',
            icon: Briefcase,
            tab: 'job-descriptions' as NavigationTab,
        },
        {
            name: 'Candidates',
            href: '/candidates',
            icon: Users,
            tab: 'candidates' as NavigationTab,
        },
        {
            name: 'Schedule',
            href: '/schedules',
            icon: Calendar,
            tab: 'schedules' as NavigationTab,
        },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 md:top-16 bg-background border-r">
                <div className="flex flex-col flex-grow overflow-y-auto">
                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.tab;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center px-3 py-2.5 text-base font-medium rounded-md transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "mr-3 flex-shrink-0 h-5 w-5",
                                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                        )}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    {(item as any).desktopName || item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 inset-x-0 bg-background border-t z-50">
                <nav className="flex justify-around items-center h-16 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.tab;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                <Icon
                                    className="h-5 w-5"
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span className="text-xs font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
