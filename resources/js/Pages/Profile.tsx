import { Head, Link } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Building2, Phone, Mail } from 'lucide-react'

interface ProfileProps {
    auth: {
        user: {
            name: string
            email: string
            avatar: string
            company_name: string
            phone: string
        }
    }
}

export default function Profile({ auth }: ProfileProps) {
    return (
        <div className="min-h-screen bg-muted/50">
            <Head title="Profile Settings" />

            <div className="container mx-auto py-8 px-4 space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                        <p className="text-muted-foreground">
                            Manage your account and company information
                        </p>
                    </div>
                </div>

                {/* Welcome Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome to your profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* User Info Display */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                                    {auth.user.avatar ? (
                                        <img
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                            className="h-full w-full rounded-full"
                                        />
                                    ) : (
                                        <User className="h-8 w-8" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">{auth.user.name}</h2>
                                    <p className="text-sm text-muted-foreground">Account holder</p>
                                </div>
                            </div>

                            <div className="grid gap-4 pt-4">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Company</div>
                                        <div className="font-medium">{auth.user.company_name}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Email</div>
                                        <div className="font-medium">{auth.user.email}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Phone</div>
                                        <div className="font-medium">{auth.user.phone}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground pt-4 border-t">
                            Profile editing and management features will be available soon.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
