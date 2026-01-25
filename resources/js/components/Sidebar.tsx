import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Mic, Briefcase, ClipboardList, Users, Calendar, ChevronsLeft, ChevronsRight, LayoutDashboard } from 'lucide-react';

type NavigationTab = 'overview' | 'interviews' | 'job-descriptions' | 'logs' | 'candidates' | 'schedules';

interface SidebarProps {
    activeTab: NavigationTab;
    isCollapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ activeTab, isCollapsed, onToggle }: SidebarProps) {

    const navItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            tab: 'overview' as NavigationTab,
        },
        {
            name: 'Interviews',
            href: '/interviews',
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
            <aside
                className={cn(
                    "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:top-16 bg-background border-r transition-all duration-300 ease-in-out z-40",
                    isCollapsed ? "md:w-16" : "md:w-60"
                )}
            >
                {/* Toggle Button - Placed outside the scrollable container to prevent clipping */}
                <button
                    onClick={onToggle}
                    className="absolute -right-3 top-4 bg-background border rounded-full p-1 hover:bg-muted transition-colors shadow-sm z-50 hidden md:block"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? (
                        <ChevronsRight className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronsLeft className="h-4 w-4 text-muted-foreground" />
                    )}
                </button>

                <div className="flex flex-col flex-grow overflow-y-auto h-full">
                    {/* Navigation */}
                    <nav className={cn(
                        "flex-1 py-6 space-y-2",
                        isCollapsed ? "px-2" : "px-4"
                    )}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.tab;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center rounded-md transition-colors",
                                        isCollapsed ? "justify-center py-2.5" : "px-3 py-2",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    <Icon
                                        className={cn(
                                            "flex-shrink-0 h-[18px] w-[18px]",
                                            !isCollapsed && "mr-3",
                                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                        )}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    {!isCollapsed && (
                                        <span className="text-sm font-medium truncate">
                                            {(item as any).desktopName || item.name}
                                        </span>
                                    )}
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
                                    className="h-[18px] w-[18px]"
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span className="text-[11px] font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
