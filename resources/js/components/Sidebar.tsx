import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Mic, Briefcase, ClipboardList, Users, Calendar, ChevronsLeft, ChevronsRight, LayoutDashboard, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type NavigationTab = 'overview' | 'interviews' | 'job-descriptions' | 'logs' | 'candidates' | 'schedules';

interface SidebarProps {
    activeTab: NavigationTab;
    isCollapsed: boolean;
    onToggle: () => void;
    user?: {
        name: string;
        avatar?: string;
    };
}

export default function Sidebar({ activeTab, isCollapsed, onToggle, user }: SidebarProps) {
    const [imageError, setImageError] = useState(false);

    const handleLogout = () => {
        router.post('/logout');
    };

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
                    "hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-background border-r transition-all duration-300 ease-in-out z-40",
                    isCollapsed ? "md:w-20" : "md:w-60"
                )}
            >
                {/* Toggle Button - Placed outside the scrollable container to prevent clipping */}
                <button
                    onClick={onToggle}
                    className="absolute -right-3 top-2 bg-background border rounded-full p-1 hover:bg-muted transition-colors shadow-sm z-50 hidden md:block"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? (
                        <ChevronsRight className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronsLeft className="h-4 w-4 text-muted-foreground" />
                    )}
                </button>

                <div className="flex flex-col flex-grow overflow-y-auto h-full">
                    {/* Branding */}
                    <Link
                        href="/dashboard"
                        className={cn(
                            "flex items-center border-b transition-all",
                            isCollapsed ? "justify-center py-4" : "px-4 py-4 gap-2"
                        )}
                    >
                        <img
                            src="/gennie.png"
                            alt="Gennie"
                            className={cn(
                                "object-contain transition-all",
                                isCollapsed ? "h-16 w-16" : "h-10 w-10"
                            )}
                        />
                        {!isCollapsed && (
                            <span className="font-extrabold text-lg text-primary leading-tight">
                                Gennie Talent
                            </span>
                        )}
                    </Link>

                    {/* Navigation */}
                    <nav className={cn(
                        "flex-1 py-8 space-y-2",
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
                                        "group flex rounded-md transition-colors",
                                        isCollapsed ? "flex-col items-center justify-center py-2.5 px-1 gap-1" : "flex-row items-center px-3 py-2",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                    title={isCollapsed ? ((item as any).desktopName || item.name) : undefined}
                                >
                                    <Icon
                                        className={cn(
                                            "flex-shrink-0 h-[18px] w-[18px]",
                                            !isCollapsed && "mr-3",
                                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                        )}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    {isCollapsed ? (
                                        <span className="text-[11px] font-medium text-center leading-tight">
                                            {item.name}
                                        </span>
                                    ) : (
                                        <span className="text-sm font-medium truncate">
                                            {(item as any).desktopName || item.name}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile */}
                    {user && (
                        <div className={cn(
                            "border-t p-4",
                            isCollapsed && "flex justify-center"
                        )}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "transition-all",
                                            isCollapsed
                                                ? "h-12 w-12 rounded-full p-0"
                                                : "w-full justify-start h-auto py-2 px-3"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex items-center",
                                            isCollapsed ? "" : "gap-3 w-full"
                                        )}>
                                            <div className="flex-shrink-0">
                                                {user.avatar && !imageError ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        className="h-8 w-8 rounded-full"
                                                        onError={() => setImageError(true)}
                                                        referrerPolicy="no-referrer"
                                                    />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="h-4 w-4 text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                            {!isCollapsed && (
                                                <div className="flex-1 text-left min-w-0">
                                                    <p className="text-sm font-medium truncate">{user.name}</p>
                                                </div>
                                            )}
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="cursor-pointer">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
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
