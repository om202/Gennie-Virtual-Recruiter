import { PropsWithChildren } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Toaster } from '@/components/ui/sonner'
import { usePage } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

type NavigationTab = 'overview' | 'interviews' | 'job-descriptions' | 'logs' | 'candidates';

interface PageProps {
    activeTab?: NavigationTab;
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    [key: string]: unknown;
}

export default function Layout({ children }: PropsWithChildren) {
    const { props, url } = usePage<PageProps>();
    const activeTab = props.activeTab;
    const user = props.auth?.user;
    const currentPath = typeof url === 'string' ? url : window.location.pathname;
    const isHomePage = currentPath === '/';

    // Show sidebar for authenticated users on non-home pages
    const showSidebar = user && !isHomePage;

    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar-collapsed');
            return saved === null ? true : saved === 'true'; // Default to collapsed if no preference saved
        }
        return true; // Default to collapsed
    });

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', String(isCollapsed));
    }, [isCollapsed]);

    return (
        <div className="min-h-screen bg-background">
            {isHomePage && <Header />}
            {showSidebar && (
                <Sidebar
                    activeTab={activeTab}
                    isCollapsed={isCollapsed}
                    onToggle={() => setIsCollapsed(!isCollapsed)}
                    user={user}
                />
            )}
            <main
                className={cn(
                    "pb-16 md:pb-0",
                    showSidebar && "transition-all duration-300 ease-in-out",
                    showSidebar ? (isCollapsed ? "md:pl-20" : "md:pl-60") : ""
                )}
            >
                {children}
            </main>
            <Toaster position="top-right" richColors closeButton />
        </div>
    )
}
