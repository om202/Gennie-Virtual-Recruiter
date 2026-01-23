import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Plus, Trash2, CheckCircle, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

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
        salary_expectation: '',

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

                    name: extracted.name || prev.name,
                    email: extracted.email || prev.email,
                    phone: extracted.phone || prev.phone,
                    linkedin_url: extracted.linkedin_url || prev.linkedin_url,
                    skills: Array.isArray(extracted.skills) ? extracted.skills.join(', ') : prev.skills,
                    experience_summary: extracted.experience_summary || prev.experience_summary,

                    location: extracted.location || prev.location,
                    address: extracted.address || prev.address,
                    city: extracted.city || prev.city,
                    state: extracted.state || prev.state,
                    zip: extracted.zip || prev.zip,

                    work_history: Array.isArray(extracted.work_history) ? extracted.work_history : prev.work_history,
                    education: Array.isArray(extracted.education) ? extracted.education : prev.education,
                    certificates: Array.isArray(extracted.certificates) ? extracted.certificates : prev.certificates,

                    work_authorization: extracted.work_authorization || prev.work_authorization,
                    salary_expectation: extracted.salary_expectation || prev.salary_expectation,
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
        post('/candidates', {
            // @ts-ignore - Inertia's transform callback typing
            transform: (data: any) => ({
                ...data,
                skills: data.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
            }),
            onSuccess: () => {
                reset();
                onSuccess();
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
                            <Input value={data.name} onChange={e => setData('name', e.target.value)} required />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Email <span className="text-destructive">*</span></Label>
                            <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required />
                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={data.phone} onChange={e => setData('phone', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>LinkedIn URL</Label>
                            <Input value={data.linkedin_url} onChange={e => setData('linkedin_url', e.target.value)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Input value={data.address} onChange={e => setData('address', e.target.value)} placeholder="123 Main St" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-2">
                                <Label>City</Label>
                                <Input value={data.city} onChange={e => setData('city', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>State</Label>
                                <Input value={data.state} onChange={e => setData('state', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Zip</Label>
                                <Input value={data.zip} onChange={e => setData('zip', e.target.value)} />
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
                                        <Input value={job.start_date} onChange={e => updateWork(index, 'start_date', e.target.value)} placeholder="YYYY-MM" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Input value={job.end_date} onChange={e => updateWork(index, 'end_date', e.target.value)} placeholder="YYYY-MM or Present" />
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
                                        <Label>End Year</Label>
                                        <Input value={edu.end_date} onChange={e => updateEducation(index, 'end_date', e.target.value)} placeholder="YYYY" />
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
                            <Input value={data.work_authorization} onChange={e => setData('work_authorization', e.target.value)} placeholder="e.g. US Citizen, Green Card" />
                        </div>
                        <div className="space-y-2">
                            <Label>Salary Expectation</Label>
                            <Input value={data.salary_expectation} onChange={e => setData('salary_expectation', e.target.value)} placeholder="e.g. $120k - $150k" />
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
