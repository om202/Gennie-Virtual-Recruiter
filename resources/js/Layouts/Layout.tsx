import { PropsWithChildren } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Toaster } from '@/components/ui/sonner'
import { usePage } from '@inertiajs/react'

type NavigationTab = 'interviews' | 'job-descriptions' | 'logs' | 'candidates';

interface PageProps {
    activeTab?: NavigationTab;
    [key: string]: unknown;
}

export default function Layout({ children }: PropsWithChildren) {
    const { props } = usePage<PageProps>();
    const activeTab = props.activeTab;

    return (
        <div className="min-h-screen bg-background">
            <Header />
            {activeTab && <Sidebar activeTab={activeTab} />}
            <main className={activeTab ? "md:pl-60 pb-16 md:pb-0" : ""}>
                {children}
            </main>
            <Toaster position="top-right" richColors closeButton />
        </div>
    )
}
