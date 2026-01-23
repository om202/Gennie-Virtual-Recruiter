import { Link } from '@inertiajs/react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t bg-background">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 justify-center md:justify-start">
                            <img src="/gennie.png" alt="Gennie" className="h-8" />
                            <span className="font-extrabold text-xl text-primary">Gennie Talent</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Scale Your Hiring, Not Your HR Team
                        </p>
                    </div>

                    {/* Product Links */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm">Product</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/gennie" className="hover:text-foreground transition-colors">
                                    Try Gennie
                                </Link>
                            </li>
                            <li>
                                <Link href="/#features" className="hover:text-foreground transition-colors">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/#benefits" className="hover:text-foreground transition-colors">
                                    Benefits
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a href="#" className="hover:text-foreground transition-colors">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-foreground transition-colors">
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-foreground transition-colors">
                                    Privacy
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm">Resources</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a href="#" className="hover:text-foreground transition-colors">
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-foreground transition-colors">
                                    Support
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-foreground transition-colors">
                                    FAQ
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t">
                    <p className="text-center text-sm text-muted-foreground">
                        © {currentYear} Gennie. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
