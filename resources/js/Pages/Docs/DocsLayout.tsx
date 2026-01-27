import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { cn } from '@/lib/utils';

interface DocsLayoutProps {
    children: React.ReactNode;
}

const sidebarNavItems = [
    {
        category: "Guide",
        items: [
            { title: "Introduction", href: "/docs" },
            { title: "Getting Started", href: "/docs/getting-started" },
        ]
    },
    {
        category: "Recruiting",
        items: [
            { title: "Job Descriptions", href: "/docs/jobs" },
            { title: "Interviews", href: "/docs/interviews" },
            { title: "Candidates", href: "/docs/candidates" },
        ]
    },
    {
        category: "Operations",
        items: [
            { title: "Candidate Experience", href: "/docs/candidate-experience" },
            { title: "Analytics & Logs", href: "/docs/analytics" },
        ]
    },
    {
        category: "Admin",
        items: [
            { title: "Settings", href: "/docs/settings" },
            { title: "FAQ", href: "/docs/faq" },
        ]
    }
];

export default function DocsLayout({ children }: DocsLayoutProps) {
    const { url } = usePage();
    const currentPath = typeof url === 'string' ? url : window.location.pathname;

    return (
        <Layout activeTab="docs">
            <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
                {/* Docs Sidebar */}
                <aside className="hidden md:block w-64 flex-shrink-0 border-r bg-background/50 backdrop-blur-sm sticky top-0 h-screen overflow-y-auto">
                    <div className="py-6 px-4 space-y-6">
                        {sidebarNavItems.map((group, groupIndex) => (
                            <div key={groupIndex}>
                                <h4 className="mb-2 text-sm font-semibold tracking-tight text-foreground/70 uppercase px-2">
                                    {group.category}
                                </h4>
                                <nav className="grid gap-1 text-sm">
                                    {group.items.map((item, index) => {
                                        const isActive = currentPath === item.href;
                                        return (
                                            <Link
                                                key={index}
                                                href={item.href}
                                                className={cn(
                                                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                                                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                                )}
                                            >
                                                {item.title}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Mobile Nav (Simple top bar implementation if needed, skipping for MVP or relying on list at top) */}

                {/* Main Content */}
                <main className="flex-1 relative py-8 px-6 md:px-12 max-w-5xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </Layout>
    );
}
