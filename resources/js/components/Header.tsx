import { Link } from '@inertiajs/react'
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { CircleDot, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Logo/Brand */}
                <Link href="/" className="flex items-center space-x-2">
                    <CircleDot className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl">Gennie</span>
                </Link>

                {/* Navigation Menu */}
                <div className="flex items-center gap-4">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <Link href="/">
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Home
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/gennie">
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Try Gennie
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>

                    {/* Google Sign In */}
                    <a href="/auth/google">
                        <Button variant="outline" size="sm">
                            <LogIn className="h-4 w-4 mr-2" />
                            Sign In
                        </Button>
                    </a>
                </div>
            </div>
        </header>
    )
}
