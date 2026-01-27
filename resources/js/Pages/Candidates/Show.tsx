import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/BackButton';
import { Mail, Phone, MapPin, Linkedin, Briefcase, GraduationCap, Award, DollarSign, FileCheck, Copy, Check, ExternalLink, FileText, Sparkles, Pencil } from 'lucide-react';
import { useState } from 'react';

interface WorkHistory {
    company: string;
    title: string;
    start_date: string | null;
    end_date: string | null;
    description: string;
}

interface Education {
    institution: string;
    degree: string;
    field: string;
    start_date: string | null;
    end_date: string | null;
}

interface Certificate {
    name: string;
    issuer: string;
    date: string | null;
}

interface AiProfileData {
    skills?: string[] | null;
    experience_summary?: string | null;
    work_history?: WorkHistory[];
    education?: Education[];
    certificates?: Certificate[];
    work_authorization?: string | null;
    salary_expectation?: string | null;
    city?: string | null;
    state?: string | null;
    linkedin_url?: string | null;
    extracted_at?: string;
    source?: string;
}

interface Candidate {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    linkedin_url: string | null;
    skills: string[] | null;
    experience_summary: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    resume_path: string | null;
    zip: string | null;
    work_authorization: string | null;
    salary_expectation: string | null;
    work_history: WorkHistory[];
    education: Education[];
    certificates: Certificate[];
    ai_profile_data?: AiProfileData | null;
}

interface JobApplication {
    id: string;
    job_title: string;
    company_name: string;
    status: string;
    status_label: string;
    applied_at: string;
}

interface ShowProps {
    candidate: Candidate;
    jobApplications: JobApplication[];
}

const formatDate = (date: string | null) => {
    if (!date) return 'Present';
    const d = new Date(date + '-01');
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const workAuthLabels: Record<string, string> = {
    'us_citizen': 'US Citizen',
    'green_card': 'Green Card Holder',
    'h1b': 'H-1B Visa',
    'opt': 'OPT',
    'cpt': 'CPT',
    'need_sponsorship': 'Need Sponsorship',
};

const formatSkills = (skills: string[] | string | null): string | null => {
    if (!skills) return null;
    if (Array.isArray(skills)) return skills.join(', ');
    const trimmed = skills.trim();
    if (trimmed.startsWith('[')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed.join(', ');
        } catch {
            // Not valid JSON, fall through
        }
    }
    return trimmed;
};

export default function Show({ candidate, jobApplications }: ShowProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const fullAddress = [
        candidate.address,
        [candidate.city, candidate.state].filter(Boolean).join(', '),
        candidate.zip
    ].filter(Boolean).join(', ');

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title={candidate.name} />

            <div className="max-w-4xl mx-auto py-8 md:pt-12 px-4 space-y-6">
                {/* Back Button */}
                <div className="flex items-center justify-between">
                    <BackButton fallback="/candidates" label="Back" />
                    <Link href={`/candidates/${candidate.id}/edit`}>
                        <Button variant="outline" className="gap-2">
                            <Pencil className="h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                </div>

                <div className="space-y-6">
                    {/* Header Card */}
                    <Card>
                        <CardHeader className="text-center pb-4">
                            <CardTitle className="text-2xl">{candidate.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {/* Email */}
                            <div className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors">
                                <a
                                    href={`mailto:${candidate.email}`}
                                    className="flex items-center gap-2 text-sm flex-1 hover:text-primary"
                                >
                                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span>{candidate.email}</span>
                                </a>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleCopy(candidate.email, 'email')}
                                >
                                    {copiedField === 'email' ? (
                                        <Check className="h-4 w-4 text-success" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            {/* Phone */}
                            {candidate.phone && (
                                <div className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors">
                                    <a
                                        href={`tel:${candidate.phone}`}
                                        className="flex items-center gap-2 text-sm flex-1 hover:text-primary"
                                    >
                                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <span>{candidate.phone}</span>
                                    </a>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleCopy(candidate.phone!, 'phone')}
                                    >
                                        {copiedField === 'phone' ? (
                                            <Check className="h-4 w-4 text-success" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* Address */}
                            {fullAddress && (
                                <div className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors">
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 text-sm flex-1 hover:text-primary"
                                    >
                                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <span className="text-muted-foreground">{fullAddress}</span>
                                    </a>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleCopy(fullAddress, 'address')}
                                    >
                                        {copiedField === 'address' ? (
                                            <Check className="h-4 w-4 text-success" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* LinkedIn */}
                            {candidate.linkedin_url && (
                                <div className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors">
                                    <a
                                        href={candidate.linkedin_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 text-sm flex-1 text-primary hover:underline"
                                    >
                                        <Linkedin className="h-4 w-4 flex-shrink-0" />
                                        <span>LinkedIn Profile</span>
                                    </a>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleCopy(candidate.linkedin_url!, 'linkedin')}
                                    >
                                        {copiedField === 'linkedin' ? (
                                            <Check className="h-4 w-4 text-success" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Resume Download */}
                    {candidate.resume_path && (
                        <Card className="bg-muted/30 border-dashed">
                            <CardContent className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-background rounded-full flex items-center justify-center border shadow-sm">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Original Resume</p>
                                        <p className="text-xs text-muted-foreground">Document on file</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => window.open(`/candidates/${candidate.id}/resume`, '_blank')}>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Resume
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Job Applications */}
                    {jobApplications && jobApplications.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Job Applications
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {jobApplications.map((app) => (
                                    <div key={app.id} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md">
                                        <div>
                                            <p className="font-medium text-sm">{app.job_title}</p>
                                            <p className="text-xs text-muted-foreground">{app.company_name} • Applied {app.applied_at}</p>
                                        </div>
                                        <Badge variant="outline" className={`text-xs ${app.status === 'shortlisted' ? 'bg-success/10 text-success' : app.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                                            {app.status_label}
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Work Authorization & Salary */}
                    {(candidate.work_authorization || candidate.salary_expectation) && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-wrap gap-6">
                                    {candidate.work_authorization && (
                                        <div className="flex items-center gap-2">
                                            <FileCheck className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Work Authorization</p>
                                                <p className="font-medium text-sm">
                                                    {workAuthLabels[candidate.work_authorization] || candidate.work_authorization}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {candidate.salary_expectation && (
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Salary Expectation</p>
                                                <p className="font-medium text-sm">{candidate.salary_expectation}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Experience Summary */}
                    {candidate.experience_summary && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Professional Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {candidate.experience_summary}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Skills */}
                    {formatSkills(candidate.skills) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Skills</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {formatSkills(candidate.skills)}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Work History */}
                    {candidate.work_history && candidate.work_history.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    Work Experience
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {candidate.work_history.map((job, i) => (
                                    <div key={i}>
                                        {i > 0 && <Separator className="my-4" />}
                                        <div className="space-y-2">
                                            <div>
                                                <h4 className="font-semibold">{job.title}</h4>
                                                <p className="text-sm text-muted-foreground">{job.company}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(job.start_date)} - {formatDate(job.end_date)}
                                                </p>
                                            </div>
                                            {job.description && (
                                                <p className="text-sm whitespace-pre-wrap">{job.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Education */}
                    {candidate.education && candidate.education.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    Education
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {candidate.education.map((edu, i) => (
                                    <div key={i}>
                                        {i > 0 && <Separator className="my-4" />}
                                        <div className="space-y-1">
                                            <h4 className="font-semibold">{edu.degree} in {edu.field}</h4>
                                            <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Certificates */}
                    {candidate.certificates && candidate.certificates.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Award className="h-4 w-4" />
                                    Certifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {candidate.certificates.map((cert, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{cert.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {cert.issuer} {cert.date && `• ${formatDate(cert.date)}`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* AI Extracted Data Section */}
                    {candidate.ai_profile_data && (
                        <div className="bg-primary/5 rounded-[--radius] p-6 space-y-6">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-primary">AI Extracted Data</span>
                                <Badge variant="secondary" className="text-xs font-normal">From Interview</Badge>
                            </div>

                            {/* AI Experience Summary */}
                            {candidate.ai_profile_data.experience_summary && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Professional Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {candidate.ai_profile_data.experience_summary}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* AI Skills */}
                            {candidate.ai_profile_data.skills && candidate.ai_profile_data.skills.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Skills</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            {candidate.ai_profile_data.skills.join(', ')}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* AI Work History */}
                            {candidate.ai_profile_data.work_history && candidate.ai_profile_data.work_history.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" />
                                            Work Experience
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {candidate.ai_profile_data.work_history.map((job, i) => (
                                            <div key={i}>
                                                {i > 0 && <Separator className="my-4" />}
                                                <div className="space-y-2">
                                                    <div>
                                                        <h4 className="font-semibold">{job.title || 'Role'}</h4>
                                                        <p className="text-sm text-muted-foreground">{job.company}</p>
                                                    </div>
                                                    {job.description && (
                                                        <p className="text-sm whitespace-pre-wrap">{job.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* AI Education */}
                            {candidate.ai_profile_data.education && candidate.ai_profile_data.education.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4" />
                                            Education
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {candidate.ai_profile_data.education.map((edu, i) => (
                                            <div key={i}>
                                                {i > 0 && <Separator className="my-4" />}
                                                <div className="space-y-1">
                                                    <h4 className="font-semibold">{edu.degree} {edu.field && `in ${edu.field}`}</h4>
                                                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* AI Certificates */}
                            {candidate.ai_profile_data.certificates && candidate.ai_profile_data.certificates.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Award className="h-4 w-4" />
                                            Certifications
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {candidate.ai_profile_data.certificates.map((cert, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{cert.name}</p>
                                                    {cert.issuer && (
                                                        <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* AI Other Info */}
                            {(candidate.ai_profile_data.city || candidate.ai_profile_data.salary_expectation || candidate.ai_profile_data.work_authorization) && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex flex-wrap gap-6">
                                            {candidate.ai_profile_data.work_authorization && (
                                                <div className="flex items-center gap-2">
                                                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Work Authorization</p>
                                                        <p className="font-medium text-sm">{candidate.ai_profile_data.work_authorization}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {candidate.ai_profile_data.salary_expectation && (
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Salary Expectation</p>
                                                        <p className="font-medium text-sm">{candidate.ai_profile_data.salary_expectation}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {candidate.ai_profile_data.city && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Location</p>
                                                        <p className="font-medium text-sm">{candidate.ai_profile_data.city}{candidate.ai_profile_data.state && `, ${candidate.ai_profile_data.state}`}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
