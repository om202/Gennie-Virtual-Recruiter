import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Mic, Briefcase, ClipboardList, Users, Calendar, LayoutDashboard, User, LogOut, Settings, BookOpen, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type NavigationTab = 'overview' | 'interviews' | 'job-descriptions' | 'logs' | 'candidates' | 'schedules' | 'subscription' | 'docs';

interface SidebarProps {
    activeTab?: NavigationTab;
    user?: {
        name: string;
        avatar?: string;
    };
}

export default function Sidebar({ activeTab, user }: SidebarProps) {
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
        {
            name: 'Docs',
            href: '/docs',
            icon: BookOpen,
            tab: 'docs' as NavigationTab,
            hideOnMobile: true,
        },
        {
            name: 'Subscription',
            href: '/subscription',
            icon: CreditCard,
            tab: 'subscription' as NavigationTab,
            hideOnMobile: true,
        },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-background border-r md:w-20 z-40">
                <div className="flex flex-col flex-grow overflow-y-auto h-full">
                    {/* Branding */}
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center pt-6 pb-0"
                    >
                        <img
                            src="/gennie.png"
                            alt="Gennie"
                            className="h-16 w-16 object-contain"
                        />
                    </Link>

                    {/* Navigation */}
                    <nav className="flex-1 pt-2 pb-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.tab;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "group flex flex-col items-center justify-center py-2.5 gap-1 transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-foreground hover:bg-muted/50"
                                    )}
                                    title={(item as any).desktopName || item.name}
                                >
                                    <Icon
                                        className={cn(
                                            "flex-shrink-0 h-[22px] w-[22px]",
                                            isActive ? "text-primary" : "text-foreground"
                                        )}
                                        strokeWidth={isActive ? 2 : 1.5}
                                    />
                                    <span className="text-[10px] font-medium text-center leading-tight">
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile */}
                    {user && (
                        <div className="border-t p-4 flex justify-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="h-12 w-12 rounded-full p-0"
                                    >
                                        <div className="flex items-center">
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
                    {navItems.filter(item => !item.hideOnMobile).map((item) => {
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
                                        : "text-foreground"
                                )}
                            >
                                <Icon
                                    className="h-[20px] w-[20px]"
                                    strokeWidth={isActive ? 2 : 1.5}
                                />
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
