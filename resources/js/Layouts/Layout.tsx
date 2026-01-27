import { PropsWithChildren } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Toaster } from '@/components/ui/sonner'
import { usePage } from '@inertiajs/react'
import { cn } from '@/lib/utils'

type NavigationTab = 'overview' | 'interviews' | 'job-descriptions' | 'logs' | 'candidates' | 'docs';

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

interface LayoutProps extends PropsWithChildren {
    activeTab?: NavigationTab;
}

export default function Layout({ children, activeTab: propActiveTab }: LayoutProps) {
    const { props, url } = usePage<PageProps>();
    const activeTab = propActiveTab || props.activeTab;
    const user = props.auth?.user;
    const currentPath = typeof url === 'string' ? url : window.location.pathname;
    const isHomePage = currentPath === '/';

    // Show sidebar for authenticated users on non-home pages
    const showSidebar = user && !isHomePage;

    return (
        <div className="min-h-screen bg-background">
            {isHomePage && <Header />}
            {showSidebar && (
                <Sidebar
                    activeTab={activeTab}
                    user={user}
                />
            )}
            <main
                className={cn(
                    "pb-16 md:pb-0",
                    showSidebar && "md:pl-20"
                )}
            >
                {children}
            </main>
            <Toaster position="top-right" richColors closeButton />
        </div>
    )
}
