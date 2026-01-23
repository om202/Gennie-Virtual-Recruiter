import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, Plus, Trash2, Briefcase, GraduationCap, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CandidateFormProps {
    onClose: () => void;
}

export default function CandidateForm({ onClose }: CandidateFormProps) {
    const [activeTab, setActiveTab] = useState('manual');
    const [isParsing, setIsParsing] = useState(false);

    // Form Sections State for UI organization (optional, but good for long forms)
    // We already use the hook, so we just stick to one huge form state.

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

                setActiveTab('manual');
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
            transform: (data) => ({
                ...data,
                skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
            }),
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0">
            <DialogHeader className="px-6 py-4 border-b">
                <DialogTitle>Add Candidate Profile</DialogTitle>
                <DialogDescription>
                    Complete the full candidate profile or upload a resume to auto-fill.
                </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 pt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">Profile Details</TabsTrigger>
                        <TabsTrigger value="upload">Upload Resume</TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <TabsContent value="upload" className="h-full">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-64 hover:bg-muted/50 transition-colors">
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
                    </TabsContent>

                    <TabsContent value="manual" className="space-y-8 pb-10">
                        <form id="candidate-form" onSubmit={submit} className="space-y-8">

                            {/* Personal Info */}
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold border-b pb-2">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Full Name *</Label>
                                        <Input value={data.name} onChange={e => setData('name', e.target.value)} required />
                                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email *</Label>
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
                            </div>

                            {/* Professional Info */}
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold border-b pb-2">Professional Summary</h3>
                                <div className="space-y-2">
                                    <Label>Summary</Label>
                                    <Textarea className="h-24" value={data.experience_summary} onChange={e => setData('experience_summary', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Skills (Comma separated)</Label>
                                    <Input value={data.skills} onChange={e => setData('skills', e.target.value)} placeholder="Java, Python, AWS..." />
                                </div>
                            </div>

                            {/* Work History */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="text-base font-semibold">Work History</h3>
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
                            </div>

                            {/* Education */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="text-base font-semibold">Education</h3>
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
                            </div>

                            {/* Additional Info */}
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold border-b pb-2">Additional Details</h3>
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
                            </div>

                        </form>
                    </TabsContent>
                </div>
            </Tabs>

            <DialogFooter className="px-6 py-4 border-t bg-muted/20">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                {activeTab === 'manual' && (
                    <Button type="submit" form="candidate-form" disabled={processing}>
                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Profile
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
    );
}
