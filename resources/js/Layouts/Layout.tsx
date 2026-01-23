import { PropsWithChildren } from 'react'
import Header from '@/components/Header'
import { Toaster } from '@/components/ui/sonner'

export default function Layout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main>{children}</main>
            <Toaster position="top-right" richColors closeButton />
        </div>
    )
}
