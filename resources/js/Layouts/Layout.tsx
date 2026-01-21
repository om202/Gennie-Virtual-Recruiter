import { PropsWithChildren } from 'react'
import Header from '@/components/Header'

export default function Layout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main>{children}</main>
        </div>
    )
}
