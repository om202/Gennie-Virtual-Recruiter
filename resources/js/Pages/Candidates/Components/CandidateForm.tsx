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
import { toast } from '@/components/ui/sonner';

interface CandidateFormProps {
    candidate?: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function CandidateForm({ candidate, onSuccess, onCancel }: CandidateFormProps) {
    const isEditing = !!candidate;
    const [isParsing, setIsParsing] = useState(false);
    const [jdFilename, setJdFilename] = useState<string | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: candidate?.name || '',
        email: candidate?.email || '',
        phone: candidate?.phone || '',
        linkedin_url: candidate?.linkedin_url || '',
        skills: candidate?.skills ? (Array.isArray(candidate.skills) ? candidate.skills.join(', ') : candidate.skills) : '',
        experience_summary: candidate?.experience_summary || '',
        address: candidate?.address || '',
        city: candidate?.city || '',
        state: candidate?.state || '',
        zip: candidate?.zip || '',
        work_authorization: candidate?.work_authorization || '',
        authorized_to_work: candidate?.authorized_to_work || false,
        sponsorship_needed: candidate?.sponsorship_needed || false,

        // Structured Salary Expectation
        salary_type: 'yearly' as 'hourly' | 'yearly',
        salary_min: '',
        salary_max: '',

        // Complex Arrays
        work_history: candidate?.work_history || [] as any[],
        education: candidate?.education || [] as any[],
        certificates: candidate?.certificates || [] as any[],

        resume_file: null as File | null,
        resume_text: candidate?.resume_text || '',
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

                // Simple merge - use extracted values or keep existing
                setData(prev => ({
                    ...prev,
                    resume_file: file,
                    resume_text: response.data.raw_text || '',
                    name: extracted.name?.trim() || prev.name,
                    email: extracted.email?.trim()?.toLowerCase() || prev.email,
                    phone: extracted.phone?.trim() || prev.phone,
                    linkedin_url: extracted.linkedin_url?.trim() || prev.linkedin_url,
                    skills: extracted.skills?.trim() || prev.skills,
                    experience_summary: extracted.experience_summary?.trim() || prev.experience_summary,
                    address: extracted.address?.trim() || prev.address,
                    city: extracted.city?.trim() || prev.city,
                    state: extracted.state?.trim()?.toUpperCase() || prev.state,
                    zip: extracted.zip?.trim() || prev.zip,
                    work_history: Array.isArray(extracted.work_history)
                        ? extracted.work_history.map((job: any) => ({
                            ...job,
                            end_date: /^(present|current|ongoing|now)$/i.test(job.end_date?.trim() || '') ? 'Present' : (job.end_date || '')
                        }))
                        : prev.work_history,
                    education: Array.isArray(extracted.education)
                        ? extracted.education.map((edu: any) => ({
                            ...edu,
                            end_date: /^(present|current|ongoing|now|in progress)$/i.test(edu.end_date?.trim() || '') ? 'Present' : (edu.end_date || '')
                        }))
                        : prev.education,
                    certificates: Array.isArray(extracted.certificates) ? extracted.certificates : prev.certificates,
                    work_authorization: extracted.work_authorization || prev.work_authorization,
                }));

                setJdFilename(file.name);
                toast.success('Resume parsed successfully', {
                    description: `Extracted data from ${file.name}`,
                });
            } else {
                toast.error('Parsing returned no data', {
                    description: 'The resume could not be parsed. Please try again or enter details manually.',
                });
            }
        } catch (error: any) {
            console.error("Parsing failed", error);
            toast.error('Resume parsing failed', {
                description: error?.response?.data?.message || error?.message || 'Please try again or enter details manually.',
            });
        } finally {
            setIsParsing(false);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const url = isEditing ? `/candidates/${candidate.id}` : '/candidates';
        const method = isEditing ? put : post;

        method(url, {
            onSuccess: () => {
                if (!isEditing) {
                    reset();
                }
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
                            <Label>Phone <span className="text-destructive">*</span></Label>
                            <Input
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                placeholder="+1 (555) 123-4567"
                                required
                            />
                            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
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
                            <Label>Address <span className="text-destructive">*</span></Label>
                            <Input
                                type="text"
                                inputMode="text"
                                autoComplete="street-address"
                                value={data.address}
                                onChange={e => setData('address', e.target.value)}
                                placeholder="123 Main St"
                                required
                            />
                            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
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
                                        <Label>Company <span className="text-destructive">*</span></Label>
                                        <Input value={job.company} onChange={e => updateWork(index, 'company', e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Job Title <span className="text-destructive">*</span></Label>
                                        <Input value={job.title} onChange={e => updateWork(index, 'title', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Date <span className="text-destructive">*</span></Label>
                                        <Input type="month" value={job.start_date} onChange={e => updateWork(index, 'start_date', e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>End Date</Label>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id={`current-job-${index}`}
                                                    checked={job.end_date === 'Present'}
                                                    onCheckedChange={(checked) => updateWork(index, 'end_date', checked ? 'Present' : '')}
                                                />
                                                <Label htmlFor={`current-job-${index}`} className="text-xs text-muted-foreground cursor-pointer">Current</Label>
                                            </div>
                                        </div>
                                        {job.end_date !== 'Present' && (
                                            <Input type="month" value={job.end_date} onChange={e => updateWork(index, 'end_date', e.target.value)} />
                                        )}
                                        {job.end_date === 'Present' && (
                                            <p className="text-sm text-muted-foreground italic py-2">Currently working here</p>
                                        )}
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
                                        <Label>Institution <span className="text-destructive">*</span></Label>
                                        <Input value={edu.institution} onChange={e => updateEducation(index, 'institution', e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Degree <span className="text-destructive">*</span></Label>
                                        <Input value={edu.degree} onChange={e => updateEducation(index, 'degree', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Field of Study</Label>
                                        <Input value={edu.field} onChange={e => updateEducation(index, 'field', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>Graduation Date</Label>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id={`current-edu-${index}`}
                                                    checked={edu.end_date === 'Present'}
                                                    onCheckedChange={(checked) => updateEducation(index, 'end_date', checked ? 'Present' : '')}
                                                />
                                                <Label htmlFor={`current-edu-${index}`} className="text-xs text-muted-foreground cursor-pointer">Enrolled</Label>
                                            </div>
                                        </div>
                                        {edu.end_date !== 'Present' && (
                                            <Input type="month" value={edu.end_date} onChange={e => updateEducation(index, 'end_date', e.target.value)} required />
                                        )}
                                        {edu.end_date === 'Present' && (
                                            <p className="text-sm text-muted-foreground italic py-2">Currently enrolled</p>
                                        )}
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
