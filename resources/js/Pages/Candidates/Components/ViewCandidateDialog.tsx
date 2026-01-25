import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, MapPin, Linkedin, Briefcase, GraduationCap, Award, DollarSign, FileCheck, Copy, Check, ExternalLink, FileText, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

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

interface ViewCandidateDialogProps {
    candidate: Candidate | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
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

// Helper to format skills (handles both array and string formats)
const formatSkills = (skills: string[] | string | null): string | null => {
    if (!skills) return null;
    if (Array.isArray(skills)) return skills.join(', ');
    const trimmed = skills.trim();
    // Handle legacy JSON array format: ["React", "Python"] -> React, Python
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

export default function ViewCandidateDialog({ candidate, open, onOpenChange }: ViewCandidateDialogProps) {
    if (!candidate) return null;

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <DialogHeader className="px-6 pt-6 pb-4">
                    <DialogTitle>Candidate Profile</DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[calc(90vh-100px)] px-6 pb-6">
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
                                            <Check className="h-4 w-4 text-green-600" />
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
                                                <Check className="h-4 w-4 text-green-600" />
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
                                                <Check className="h-4 w-4 text-green-600" />
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
                                            className="flex items-center gap-2 text-sm flex-1 text-blue-600 hover:underline"
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
                                                <Check className="h-4 w-4 text-green-600" />
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
                            <>
                                <Separator className="my-6" />
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-purple-500" />
                                        <h3 className="text-lg font-semibold">AI Extracted Data</h3>
                                        <Badge variant="secondary" className="text-xs">
                                            From Interview
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        This data was automatically extracted from interview conversations.
                                        {candidate.ai_profile_data.extracted_at && (
                                            <> Extracted on {new Date(candidate.ai_profile_data.extracted_at).toLocaleDateString()}.</>
                                        )}
                                    </p>

                                    {/* AI Skills */}
                                    {candidate.ai_profile_data.skills && candidate.ai_profile_data.skills.length > 0 && (
                                        <Card className="border-purple-200 bg-purple-50/30">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm flex items-center gap-2">
                                                    <Sparkles className="h-3 w-3 text-purple-500" />
                                                    Skills Mentioned
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap gap-2">
                                                    {candidate.ai_profile_data.skills.map((skill, i) => (
                                                        <Badge key={i} variant="outline" className="bg-white">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* AI Experience Summary */}
                                    {candidate.ai_profile_data.experience_summary && (
                                        <Card className="border-purple-200 bg-purple-50/30">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm flex items-center gap-2">
                                                    <Sparkles className="h-3 w-3 text-purple-500" />
                                                    Experience Summary
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {candidate.ai_profile_data.experience_summary}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* AI Work History */}
                                    {candidate.ai_profile_data.work_history && candidate.ai_profile_data.work_history.length > 0 && (
                                        <Card className="border-purple-200 bg-purple-50/30">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm flex items-center gap-2">
                                                    <Sparkles className="h-3 w-3 text-purple-500" />
                                                    <Briefcase className="h-3 w-3" />
                                                    Work Experience Mentioned
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {candidate.ai_profile_data.work_history.map((job, i) => (
                                                    <div key={i} className="text-sm">
                                                        <p className="font-medium">{job.title || 'Role'} at {job.company}</p>
                                                        {job.description && (
                                                            <p className="text-muted-foreground text-xs mt-1">{job.description}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* AI Education */}
                                    {candidate.ai_profile_data.education && candidate.ai_profile_data.education.length > 0 && (
                                        <Card className="border-purple-200 bg-purple-50/30">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm flex items-center gap-2">
                                                    <Sparkles className="h-3 w-3 text-purple-500" />
                                                    <GraduationCap className="h-3 w-3" />
                                                    Education Mentioned
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                {candidate.ai_profile_data.education.map((edu, i) => (
                                                    <div key={i} className="text-sm">
                                                        <p className="font-medium">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                                                        <p className="text-muted-foreground text-xs">{edu.institution}</p>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* AI Certificates */}
                                    {candidate.ai_profile_data.certificates && candidate.ai_profile_data.certificates.length > 0 && (
                                        <Card className="border-purple-200 bg-purple-50/30">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm flex items-center gap-2">
                                                    <Sparkles className="h-3 w-3 text-purple-500" />
                                                    <Award className="h-3 w-3" />
                                                    Certifications Mentioned
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap gap-2">
                                                    {candidate.ai_profile_data.certificates.map((cert, i) => (
                                                        <Badge key={i} variant="outline" className="bg-white">
                                                            {cert.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* AI Location & Other */}
                                    {(candidate.ai_profile_data.city || candidate.ai_profile_data.salary_expectation || candidate.ai_profile_data.work_authorization) && (
                                        <Card className="border-purple-200 bg-purple-50/30">
                                            <CardContent className="pt-4">
                                                <div className="flex flex-wrap gap-4 text-sm">
                                                    {candidate.ai_profile_data.city && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                                            <span>{candidate.ai_profile_data.city}{candidate.ai_profile_data.state && `, ${candidate.ai_profile_data.state}`}</span>
                                                        </div>
                                                    )}
                                                    {candidate.ai_profile_data.salary_expectation && (
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                                                            <span>{candidate.ai_profile_data.salary_expectation}</span>
                                                        </div>
                                                    )}
                                                    {candidate.ai_profile_data.work_authorization && (
                                                        <div className="flex items-center gap-2">
                                                            <FileCheck className="h-3 w-3 text-muted-foreground" />
                                                            <span>{candidate.ai_profile_data.work_authorization}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog >
    );
}
