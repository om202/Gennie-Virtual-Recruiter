import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Plus, Trash2, CheckCircle, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Normalize date strings from AI parsing to YYYY-MM format for month inputs.
 * Handles: "Jan 2020", "January 2020", "2020-01", "2020", "Present", etc.
 */
function normalizeDateToMonth(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const str = dateStr.trim();

    // Handle "Present", "Current", etc. - return empty for ongoing
    if (/^(present|current|ongoing|now)$/i.test(str)) return '';

    // Already in YYYY-MM format
    if (/^\d{4}-\d{2}$/.test(str)) return str;

    // YYYY only - default to January
    if (/^\d{4}$/.test(str)) return `${str}-01`;

    // Month name + Year (e.g., "Jan 2020", "January 2020")
    const monthNames: Record<string, string> = {
        jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03',
        apr: '04', april: '04', may: '05', jun: '06', june: '06',
        jul: '07', july: '07', aug: '08', august: '08', sep: '09', september: '09',
        oct: '10', october: '10', nov: '11', november: '11', dec: '12', december: '12'
    };
    const monthYearMatch = str.match(/^([a-zA-Z]+)\s*(\d{4})$/i);
    if (monthYearMatch) {
        const month = monthNames[monthYearMatch[1].toLowerCase()];
        const year = monthYearMatch[2];
        if (month && year) return `${year}-${month}`;
    }

    // Year + Month name (e.g., "2020 Jan")
    const yearMonthMatch = str.match(/^(\d{4})\s*([a-zA-Z]+)$/i);
    if (yearMonthMatch) {
        const year = yearMonthMatch[1];
        const month = monthNames[yearMonthMatch[2].toLowerCase()];
        if (month && year) return `${year}-${month}`;
    }

    // MM/YYYY or M/YYYY
    const slashMatch = str.match(/^(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
        const month = slashMatch[1].padStart(2, '0');
        const year = slashMatch[2];
        return `${year}-${month}`;
    }

    // Fallback: return empty if we can't parse
    return '';
}

/**
 * Normalize phone number: remove extra chars, format consistently.
 * Handles: "(555) 123-4567", "555.123.4567", "+1 555 123 4567", etc.
 */
function normalizePhone(phone: string | null | undefined): string {
    if (!phone) return '';
    // Remove everything except digits and leading +
    const cleaned = phone.trim().replace(/[^\d+]/g, '');
    if (!cleaned) return '';

    // If it's a 10-digit US number, format it nicely
    if (/^\d{10}$/.test(cleaned)) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    // If it starts with 1 and has 11 digits (US with country code)
    if (/^1\d{10}$/.test(cleaned)) {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    // International or other formats - just clean it up
    return phone.trim();
}

/**
 * Normalize email: lowercase and trim.
 */
function normalizeEmail(email: string | null | undefined): string {
    if (!email) return '';
    return email.trim().toLowerCase();
}

/**
 * Normalize URL: ensure https:// prefix for LinkedIn and other URLs.
 */
function normalizeUrl(url: string | null | undefined): string {
    if (!url) return '';
    let cleaned = url.trim();
    if (!cleaned) return '';

    // Remove trailing slashes
    cleaned = cleaned.replace(/\/+$/, '');

    // Add https:// if missing protocol
    if (!/^https?:\/\//i.test(cleaned)) {
        // Handle linkedin.com/in/... without protocol
        if (cleaned.startsWith('linkedin.com') || cleaned.startsWith('www.linkedin.com')) {
            cleaned = 'https://' + cleaned;
        } else if (cleaned.includes('.')) {
            cleaned = 'https://' + cleaned;
        }
    }

    return cleaned;
}

/**
 * Normalize text: trim and proper title case for names.
 */
function normalizeName(name: string | null | undefined): string {
    if (!name) return '';
    return name.trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Normalize general text: trim whitespace and normalize internal spacing.
 */
function normalizeText(text: string | null | undefined): string {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ');
}

/**
 * Normalize city/state: proper title case.
 */
function normalizeLocation(location: string | null | undefined): string {
    if (!location) return '';
    return location.trim()
        .split(/\s+/)
        .map(word => {
            // Handle state abbreviations (keep uppercase)
            if (word.length === 2 && /^[A-Za-z]+$/.test(word)) {
                return word.toUpperCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}

/**
 * Normalize zip code: extract digits, handle ZIP+4.
 */
function normalizeZip(zip: string | null | undefined): string {
    if (!zip) return '';
    const cleaned = zip.trim();
    // Extract just digits and hyphen for ZIP+4
    const match = cleaned.match(/^(\d{5})(-\d{4})?/);
    if (match) {
        return match[0];
    }
    return cleaned;
}

/**
 * Normalize skills array: trim each, remove empties, dedupe.
 */
function normalizeSkills(skills: string[] | null | undefined): string {
    if (!skills || !Array.isArray(skills)) return '';
    return [...new Set(
        skills
            .map(s => s.trim())
            .filter(Boolean)
    )].join(', ');
}

interface CandidateFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function CandidateForm({ onSuccess, onCancel }: CandidateFormProps) {
    const [isParsing, setIsParsing] = useState(false);
    const [jdFilename, setJdFilename] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        linkedin_url: '',
        skills: '',
        experience_summary: '',
        location: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        work_authorization: '',
        authorized_to_work: false,
        sponsorship_needed: false,

        // Structured Salary Expectation
        salary_type: 'yearly' as 'hourly' | 'yearly',
        salary_min: '',
        salary_max: '',

        // Complex Arrays
        work_history: [] as any[],
        education: [] as any[],
        certificates: [] as any[],

        resume_file: null as File | null,
        resume_text: '',
    });

    // --- Dynamic Field Helpers ---
    const addWork = () => setData('work_history', [...data.work_history, { company: '', title: '', start_date: '', end_date: '', description: '' }]);
    const removeWork = (index: number) => setData('work_history', data.work_history.filter((_, i) => i !== index));
    const updateWork = (index: number, field: string, value: string) => {
        const newHistory = [...data.work_history];
        newHistory[index][field] = value;
        setData('work_history', newHistory);
    };

    const addEducation = () => setData('education', [...data.education, { institution: '', degree: '', field: '', start_date: '', end_date: '' }]);
    const removeEducation = (index: number) => setData('education', data.education.filter((_, i) => i !== index));
    const updateEducation = (index: number, field: string, value: string) => {
        const newEdu = [...data.education];
        newEdu[index][field] = value;
        setData('education', newEdu);
    };

    // --- Resume Parsing ---
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setData('resume_file', file);
        setIsParsing(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await window.axios.post('/candidates/parse-resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.status === 'success') {
                const extracted = response.data.data;

                setData(prev => ({
                    ...prev,
                    resume_file: file,
                    resume_text: response.data.raw_text || '',

                    // Apply normalization to all extracted fields
                    name: normalizeName(extracted.name) || prev.name,
                    email: normalizeEmail(extracted.email) || prev.email,
                    phone: normalizePhone(extracted.phone) || prev.phone,
                    linkedin_url: normalizeUrl(extracted.linkedin_url) || prev.linkedin_url,
                    skills: normalizeSkills(extracted.skills) || prev.skills,
                    experience_summary: normalizeText(extracted.experience_summary) || prev.experience_summary,

                    location: normalizeLocation(extracted.location) || prev.location,
                    address: normalizeText(extracted.address) || prev.address,
                    city: normalizeLocation(extracted.city) || prev.city,
                    state: normalizeLocation(extracted.state) || prev.state,
                    zip: normalizeZip(extracted.zip) || prev.zip,

                    work_history: Array.isArray(extracted.work_history)
                        ? extracted.work_history.map((job: any) => ({
                            ...job,
                            start_date: normalizeDateToMonth(job.start_date),
                            end_date: normalizeDateToMonth(job.end_date),
                        }))
                        : prev.work_history,
                    education: Array.isArray(extracted.education)
                        ? extracted.education.map((edu: any) => ({
                            ...edu,
                            start_date: normalizeDateToMonth(edu.start_date),
                            end_date: normalizeDateToMonth(edu.end_date),
                        }))
                        : prev.education,
                    certificates: Array.isArray(extracted.certificates) ? extracted.certificates : prev.certificates,

                    work_authorization: extracted.work_authorization || prev.work_authorization,
                    // Note: salary is now structured, AI-extracted value would need parsing
                }));

                setJdFilename(file.name);
            }
        } catch (error) {
            console.error("Parsing failed", error);
        } finally {
            setIsParsing(false);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting form data:', data);
        post('/candidates', {
            // @ts-ignore - Inertia's transform callback typing
            transform: (data: any) => {
                const transformed = {
                    ...data,
                    skills: typeof data.skills === 'string'
                        ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
                        : data.skills,
                };
                console.log('Transformed data:', transformed);
                return transformed;
            },
            onSuccess: () => {
                console.log('Form submitted successfully!');
                reset();
                onSuccess();
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">

            {/* Section 1: Upload Resume (Optional) */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Upload Resume (Optional)</CardTitle>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 1</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-48 hover:bg-muted/50 transition-colors">
                        {isParsing ? (
                            <div className="text-center space-y-3">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                                <p className="text-sm text-muted-foreground">Parsing full profile with AI...</p>
                            </div>
                        ) : (
                            <div className="text-center space-y-3">
                                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                    <Upload className="h-6 w-6" />
                                </div>
                                <Label htmlFor="resume-upload" className="cursor-pointer text-sm font-medium hover:underline text-primary">
                                    Click to upload Resume
                                </Label>
                                <Input id="resume-upload" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                                <p className="text-xs text-muted-foreground">PDF or DOCX (max 10MB)</p>
                            </div>
                        )}
                    </div>

                    {jdFilename && (
                        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded w-fit">
                            <CheckCircle className="h-3 w-3" />
                            Imported from: {jdFilename}
                            <button type="button" onClick={() => setJdFilename(null)} className="ml-2 hover:text-green-800">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}

                    <p className="text-[13px] text-muted-foreground">
                        Upload a resume to automatically extract candidate information, or skip to enter details manually.
                    </p>
                </CardContent>
            </Card>

            {/* Section 2: Personal Info */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Personal Information</CardTitle>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 2</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Full Name <span className="text-destructive">*</span></Label>
                            <Input
                                type="text"
                                inputMode="text"
                                autoComplete="name"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Email <span className="text-destructive">*</span></Label>
                            <Input
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>LinkedIn URL</Label>
                            <Input
                                type="url"
                                inputMode="url"
                                autoComplete="url"
                                value={data.linkedin_url}
                                onChange={e => setData('linkedin_url', e.target.value)}
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Input
                                type="text"
                                inputMode="text"
                                autoComplete="street-address"
                                value={data.address}
                                onChange={e => setData('address', e.target.value)}
                                placeholder="123 Main St"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-2">
                                <Label>City</Label>
                                <Input
                                    type="text"
                                    inputMode="text"
                                    autoComplete="address-level2"
                                    value={data.city}
                                    onChange={e => setData('city', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>State</Label>
                                <Input
                                    type="text"
                                    inputMode="text"
                                    autoComplete="address-level1"
                                    maxLength={2}
                                    value={data.state}
                                    onChange={e => setData('state', e.target.value.toUpperCase())}
                                    placeholder="CA"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Zip</Label>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="postal-code"
                                    pattern="[0-9]{5}(-[0-9]{4})?"
                                    maxLength={10}
                                    value={data.zip}
                                    onChange={e => setData('zip', e.target.value)}
                                    placeholder="12345"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 3: Professional Info */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Professional Summary</CardTitle>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 3</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Summary</Label>
                        <Textarea className="h-24" value={data.experience_summary} onChange={e => setData('experience_summary', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Skills (Comma separated)</Label>
                        <Input value={data.skills} onChange={e => setData('skills', e.target.value)} placeholder="Java, Python, AWS..." />
                    </div>
                </CardContent>
            </Card>

            {/* Section 4: Work History */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Work History</CardTitle>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 4</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Add previous work experience</p>
                        <Button type="button" size="sm" variant="outline" onClick={addWork}><Plus className="h-3 w-3 mr-1" /> Add Job</Button>
                    </div>
                    {data.work_history.length === 0 && <p className="text-sm text-muted-foreground italic">No work history added.</p>}
                    {data.work_history.map((job, index) => (
                        <Card key={index} className="relative">
                            <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 text-muted-foreground hover:text-destructive" onClick={() => removeWork(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <CardContent className="pt-4 grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Company</Label>
                                        <Input value={job.company} onChange={e => updateWork(index, 'company', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Job Title</Label>
                                        <Input value={job.title} onChange={e => updateWork(index, 'title', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Input type="month" value={job.start_date} onChange={e => updateWork(index, 'start_date', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Input type="month" value={job.end_date} onChange={e => updateWork(index, 'end_date', e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea value={job.description} onChange={e => updateWork(index, 'description', e.target.value)} className="h-20" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>

            {/* Section 5: Education */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Education</CardTitle>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 5</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Add educational background</p>
                        <Button type="button" size="sm" variant="outline" onClick={addEducation}><Plus className="h-3 w-3 mr-1" /> Add Education</Button>
                    </div>
                    {data.education.length === 0 && <p className="text-sm text-muted-foreground italic">No education history added.</p>}
                    {data.education.map((edu, index) => (
                        <Card key={index} className="relative">
                            <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 text-muted-foreground hover:text-destructive" onClick={() => removeEducation(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <CardContent className="pt-4 grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Institution</Label>
                                        <Input value={edu.institution} onChange={e => updateEducation(index, 'institution', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Degree</Label>
                                        <Input value={edu.degree} onChange={e => updateEducation(index, 'degree', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Field of Study</Label>
                                        <Input value={edu.field} onChange={e => updateEducation(index, 'field', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Input type="month" value={edu.end_date} onChange={e => updateEducation(index, 'end_date', e.target.value)} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>

            {/* Section 6: Additional Details */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Additional Details</CardTitle>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold bg-muted px-2 py-1 rounded">Step 6</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Work Authorization Status</Label>
                            <Select value={data.work_authorization} onValueChange={(val) => setData('work_authorization', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select authorization status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="us_citizen">US Citizen</SelectItem>
                                    <SelectItem value="green_card">Green Card (Permanent Resident)</SelectItem>
                                    <SelectItem value="h1b">H-1B Visa</SelectItem>
                                    <SelectItem value="h1b_transfer">H-1B Transfer</SelectItem>
                                    <SelectItem value="l1">L-1 Visa</SelectItem>
                                    <SelectItem value="opt">OPT (F-1 Student)</SelectItem>
                                    <SelectItem value="opt_stem">OPT STEM Extension</SelectItem>
                                    <SelectItem value="cpt">CPT (Curricular Practical Training)</SelectItem>
                                    <SelectItem value="ead">EAD (Employment Authorization Document)</SelectItem>
                                    <SelectItem value="tn_visa">TN Visa (Canada/Mexico)</SelectItem>
                                    <SelectItem value="e2_treaty">E-2 Treaty Investor</SelectItem>
                                    <SelectItem value="o1">O-1 Visa (Extraordinary Ability)</SelectItem>
                                    <SelectItem value="asylum">Asylee/Refugee</SelectItem>
                                    <SelectItem value="need_sponsorship">Need Sponsorship</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Salary Expectation - Structured */}
                    <div className="space-y-3">
                        <Label>Salary Expectation</Label>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                                <button
                                    type="button"
                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${data.salary_type === 'yearly'
                                        ? 'bg-background shadow-sm font-medium'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    onClick={() => setData('salary_type', 'yearly')}
                                >
                                    Yearly
                                </button>
                                <button
                                    type="button"
                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${data.salary_type === 'hourly'
                                        ? 'bg-background shadow-sm font-medium'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    onClick={() => setData('salary_type', 'hourly')}
                                >
                                    Hourly
                                </button>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <Input
                                        type="number"
                                        inputMode="numeric"
                                        min={0}
                                        value={data.salary_min}
                                        onChange={e => setData('salary_min', e.target.value)}
                                        placeholder={data.salary_type === 'yearly' ? '80,000' : '40'}
                                        className="pl-7"
                                    />
                                </div>
                                <span className="text-muted-foreground">to</span>
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <Input
                                        type="number"
                                        inputMode="numeric"
                                        min={0}
                                        value={data.salary_max}
                                        onChange={e => setData('salary_max', e.target.value)}
                                        placeholder={data.salary_type === 'yearly' ? '120,000' : '65'}
                                        className="pl-7"
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground w-12">
                                    {data.salary_type === 'yearly' ? '/year' : '/hour'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 py-2">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={data.authorized_to_work}
                                onCheckedChange={(c) => setData('authorized_to_work', c)}
                            />
                            <Label>Authorized to work in US?</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={data.sponsorship_needed}
                                onCheckedChange={(c) => setData('sponsorship_needed', c)}
                            />
                            <Label>Needs Sponsorship?</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Footer Actions */}
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="bg-background">
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Profile
                </Button>
            </div>
        </form>
    );
}
