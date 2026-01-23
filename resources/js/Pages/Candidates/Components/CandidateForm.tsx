import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, FileText, CheckCircle } from 'lucide-react';

interface CandidateFormProps {
    onClose: () => void;
}

export default function CandidateForm({ onClose }: CandidateFormProps) {
    const [activeTab, setActiveTab] = useState('manual');
    const [isParsing, setIsParsing] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        linkedin_url: '',
        skills: '', // Displayed as comma-separated string
        experience_summary: '',
        location: '',
        resume_file: null as File | null,
        resume_text: '', // Hidden field to store parsed text if needed
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Set the file in the form state immediately for submission
        setData('resume_file', file);

        // Auto-parse flow
        setIsParsing(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await window.axios.post('/candidates/parse-resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.status === 'success') {
                const extracted = response.data.data;

                // Auto-fill form data
                setData(prev => ({
                    ...prev,
                    resume_file: file, // Ensure file is kept
                    resume_text: response.data.raw_text || '',
                    name: extracted.name || prev.name,
                    email: extracted.email || prev.email,
                    phone: extracted.phone || prev.phone,
                    linkedin_url: extracted.linkedin_url || prev.linkedin_url,
                    skills: Array.isArray(extracted.skills) ? extracted.skills.join(', ') : prev.skills,
                    experience_summary: extracted.experience_summary || prev.experience_summary,
                    location: extracted.location || prev.location,
                }));

                // Switch to manual tab to let user review
                setActiveTab('manual');
            }
        } catch (error) {
            console.error("Parsing failed", error);
            // Even if parsing fails, we keep the file attached
        } finally {
            setIsParsing(false);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert comma-separated skills string back to array if needed by backend, 
        // but our backend validation currently accepts 'skills' as array.
        // Wait, the backend validates accepted 'skills' as nullable|array.
        // But the input is a string. We should probably convert it before sending?
        // Actually, Inertia sends JSON. If I send a string for an array field it might fail validation if I don't cast it.
        // Let's modify the transform.

        // Actually, let's keep it simple. The backend expects an array for 'skills'.
        // I will transform the data before post.

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        if (data.phone) formData.append('phone', data.phone);
        if (data.linkedin_url) formData.append('linkedin_url', data.linkedin_url);
        if (data.experience_summary) formData.append('experience_summary', data.experience_summary);
        if (data.location) formData.append('location', data.location);
        if (data.resume_text) formData.append('resume_text', data.resume_text);
        if (data.resume_file) formData.append('resume_file', data.resume_file);

        // Handle skills
        if (data.skills) {
            const skillsArray = data.skills.split(',').map(s => s.trim()).filter(Boolean);
            skillsArray.forEach((skill, index) => {
                formData.append(`skills[${index}]`, skill);
            });
        }

        // Use Inertia's router manually or the helper. 
        // Since we are using useForm, we can use the post method but useForm handles JSON by default.
        // For file uploads, we need FormData. Inertia useForm handles FormData automatically if there is a file?
        // Yes, Inertia v1+ automatically converts to FormData if a file object is detected in the data.
        // However, 'skills' in `data` is a string, and backend expects array.

        // Let's manually do the transformation.
        const skillsArray = data.skills.split(',').map(s => s.trim()).filter(Boolean);

        post('/candidates', {
            // We need to carefully override the 'skills' field.
            // But useForm `post` sends `data`.
            // Solution: Update the `data` state with the array right before sending? 
            // No, that breaks the UI input.
            // Better: use the transform callback.
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
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>Add Candidate</DialogTitle>
                <DialogDescription>
                    Add a new candidate manually or upload a resume to auto-fill details.
                </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    <TabsTrigger value="upload">Upload Resume</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4 py-4">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 hover:bg-muted/50 transition-colors">
                        {isParsing ? (
                            <div className="text-center space-y-3">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                                <p className="text-sm text-muted-foreground">Parsing resume with AI...</p>
                            </div>
                        ) : (
                            <div className="text-center space-y-3">
                                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                    <Upload className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="resume-upload" className="cursor-pointer text-sm font-medium hover:underline text-primary">
                                        Click to upload
                                    </Label>
                                    <span className="text-sm text-muted-foreground"> or drag and drop</span>
                                    <p className="text-xs text-muted-foreground">PDF or DOCX (max 10MB)</p>
                                </div>
                                <Input
                                    id="resume-upload"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="manual">
                    <form onSubmit={submit} className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="John Doe"
                                    required
                                />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="john@example.com"
                                    required
                                />
                                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={data.location}
                                    onChange={e => setData('location', e.target.value)}
                                    placeholder="San Francisco, CA"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                            <Input
                                id="linkedin_url"
                                value={data.linkedin_url}
                                onChange={e => setData('linkedin_url', e.target.value)}
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="skills">Skills (Comma separated)</Label>
                            <Input
                                id="skills"
                                value={data.skills}
                                onChange={e => setData('skills', e.target.value)}
                                placeholder="React, Laravel, TypeScript, Deepgram"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="experience_summary">Professional Summary</Label>
                            <Textarea
                                id="experience_summary"
                                value={data.experience_summary}
                                onChange={e => setData('experience_summary', e.target.value)}
                                placeholder="Brief summary of candidate's experience..."
                                className="h-24"
                            />
                        </div>

                        {data.resume_file && (
                            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                                <CheckCircle className="h-4 w-4" />
                                <span className="truncate">{data.resume_file.name} attached</span>
                            </div>
                        )}

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Candidate
                            </Button>
                        </DialogFooter>
                    </form>
                </TabsContent>
            </Tabs>
        </DialogContent>
    );
}
