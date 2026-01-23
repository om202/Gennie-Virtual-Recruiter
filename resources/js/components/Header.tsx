import { Link, usePage, router } from '@inertiajs/react'
import { useState } from 'react'
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageProps {
    auth: {
        user: {
            name: string
            avatar?: string
        } | null
    }
    [key: string]: unknown
}

export default function Header() {
    const { auth, url } = usePage<PageProps>().props
    const user = auth?.user
    const currentPath = typeof url === 'string' ? url : window.location.pathname
    const [imageError, setImageError] = useState(false)

    const handleLogout = () => {
        router.post('/logout')
    }

    const isOnDashboard = currentPath.startsWith('/dashboard')
    const isOnHome = currentPath === '/'

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo/Brand */}
                <Link href={user ? '/dashboard' : '/'} className="flex items-center space-x-2">
                    <img src="/gennie.png" alt="Gennie" className="h-8" />
                    <span className="font-extrabold text-2xl text-primary">Gennie</span>
                </Link>

                {/* Navigation Menu */}
                <div className="flex items-center gap-4">
                    <NavigationMenu>
                        <NavigationMenuList>
                            {!isOnHome && !user && (
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <Link href="/">Home</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            )}
                            {user && !isOnDashboard && (
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <Link href="/dashboard">Dashboard</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            )}
                        </NavigationMenuList>
                    </NavigationMenu>

                    {/* Auth Section */}
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    {user.avatar && !imageError ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="h-8 w-8 rounded-full"
                                            onError={() => setImageError(true)}
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <User className="h-5 w-5" />
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <div className="px-2 py-1.5 text-sm font-medium">{user.name}</div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard" className="cursor-pointer">
                                        Dashboard
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <a href="/auth/google">
                            <Button size="lg">
                                Sign in with Google
                            </Button>
                        </a>
                    )}
                </div>
            </div>
        </header>
    )
}

