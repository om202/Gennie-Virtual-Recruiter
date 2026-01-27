import DocsLayout from './DocsLayout';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from '@inertiajs/react';
import { Building2, Bell, CreditCard, Users, Palette, Globe } from 'lucide-react';

export default function Settings() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
                    Settings & Administration
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Manage your company profile, branding, team members, and account preferences.
                </p>
            </div>

            <Separator />

            <div className="space-y-8">
                {/* Company Profile */}
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-md border flex-shrink-0">
                        <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-4 flex-1">
                        <div>
                            <h3 className="font-semibold text-lg">Company Profile</h3>
                            <p className="text-muted-foreground">
                                Your logo and name appear on all candidate-facing pages (interview screens, emails, careers page).
                            </p>
                        </div>

                        <Card className="max-w-md">
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src="/placeholder-logo.png" />
                                        <AvatarFallback>AC</AvatarFallback>
                                    </Avatar>
                                    <Button variant="outline">Upload Logo</Button>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Organization Name</label>
                                    <Input defaultValue="Acme Corp" disabled />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Separator />

                {/* Team Management */}
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-md border flex-shrink-0">
                        <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Team Members</h3>
                        <p className="text-muted-foreground">
                            Invite colleagues to your Gennie workspace. Team members can view candidates,
                            listen to interviews, and help with the hiring process. Assign roles like Admin or Viewer.
                        </p>
                    </div>
                </div>

                {/* Branding */}
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-md border flex-shrink-0">
                        <Palette className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Branding & Customization</h3>
                        <p className="text-muted-foreground">
                            Customize the look and feel of your public pages. Choose accent colors that match
                            your brand identity for a cohesive candidate experience.
                        </p>
                    </div>
                </div>

                {/* Careers Page */}
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-md border flex-shrink-0">
                        <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Careers Page</h3>
                        <p className="text-muted-foreground">
                            Configure your public careers page URL and customize the landing page content.
                            All public job descriptions are automatically listed here.
                        </p>
                    </div>
                </div>

                <Separator />

                {/* Notifications */}
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-md border flex-shrink-0">
                        <Bell className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Notifications</h3>
                        <p className="text-muted-foreground">
                            Choose how you want to be alerted when a candidate completes an interview.
                            We support Email and Slack notifications. Configure per-job or global settings.
                        </p>
                    </div>
                </div>

                {/* Billing */}
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-md border flex-shrink-0">
                        <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Billing & Plans</h3>
                        <p className="text-muted-foreground">
                            Manage your subscription tier, payment methods, and view invoices.
                            Enterprise plans include unlimited seats, custom integrations, and priority support.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
                <p className="text-muted-foreground mb-4">
                    If you can't find what you're looking for in the documentation, our support team is here to help.
                </p>
                <div className="flex gap-3">
                    <Button>Contact Support</Button>
                    <Link href="/docs/faq">
                        <Button variant="outline">View FAQ</Button>
                    </Link>
                </div>
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
                <Link href="/docs/analytics" className="text-sm text-muted-foreground hover:text-primary">
                    ← Analytics
                </Link>
                <Link href="/docs/faq">
                    <Button variant="outline" className="gap-2">
                        Next: FAQ
                    </Button>
                </Link>
            </div>
        </div>
    );
}

Settings.layout = (page: any) => <DocsLayout>{page}</DocsLayout>;
