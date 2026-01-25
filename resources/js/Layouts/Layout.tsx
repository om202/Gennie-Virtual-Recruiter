import { PropsWithChildren } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Toaster } from '@/components/ui/sonner'
import { usePage } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

type NavigationTab = 'interviews' | 'job-descriptions' | 'logs' | 'candidates';

interface PageProps {
    activeTab?: NavigationTab;
    [key: string]: unknown;
}

export default function Layout({ children }: PropsWithChildren) {
    const { props } = usePage<PageProps>();
    const activeTab = props.activeTab;

    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar-collapsed');
            return saved === 'true';
        }
        return false;
    });

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', String(isCollapsed));
    }, [isCollapsed]);

    return (
        <div className="min-h-screen bg-background">
            <Header />
            {activeTab && (
                <Sidebar
                    activeTab={activeTab}
                    isCollapsed={isCollapsed}
                    onToggle={() => setIsCollapsed(!isCollapsed)}
                />
            )}
            <main
                className={cn(
                    "pb-16 md:pb-0",
                    activeTab && "transition-all duration-300 ease-in-out",
                    activeTab ? (isCollapsed ? "md:pl-16" : "md:pl-60") : ""
                )}
            >
                {children}
            </main>
            <Toaster position="top-right" richColors closeButton />
        </div>
    )
}
