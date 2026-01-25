import { Head, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface OnboardingProps {
    user: {
        name: string
        email: string
        avatar: string
    }
}

export default function Onboarding({ user }: OnboardingProps) {
    const { data, setData, post, processing, errors } = useForm({
        company_name: '',
        phone: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/onboarding')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
            <Head title="Get Started" />

            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Welcome, {user.name}!</CardTitle>
                    <CardDescription>
                        Let's get your account set up so you can start recruiting.
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="company_name">Company Name</Label>
                            <Input
                                id="company_name"
                                placeholder="e.g. Acme Inc."
                                value={data.company_name}
                                onChange={(e) => setData('company_name', e.target.value)}
                                disabled={processing}
                            />
                            {errors.company_name && (
                                <p className="text-sm text-destructive">{errors.company_name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                disabled={processing}
                            />
                            {errors.phone && (
                                <p className="text-sm text-destructive">{errors.phone}</p>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Complete Setup'
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
