import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardNavigation from '@/components/DashboardNavigation';
import { Plus, Search, MapPin, Linkedin, Trash2, Mail, Phone as PhoneIcon, Eye, Pencil } from 'lucide-react';
import ViewCandidateDialog from './Components/ViewCandidateDialog';

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

interface Candidate {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    linkedin_url: string | null;
    skills: string | null;
    experience_summary: string | null;
    city: string | null;
    state: string | null;
    resume_path: string | null;
    created_at: string;
    address: string | null;
    zip: string | null;
    work_authorization: string | null;
    salary_expectation: string | null;
    work_history: WorkHistory[];
    education: Education[];
    certificates: Certificate[];
}

// Helper to derive location from city+state
const getLocation = (candidate: Candidate): string | null => {
    const parts = [candidate.city, candidate.state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
};

interface IndexProps {
    auth: any;
    candidates: {
        data: Candidate[];
        links: any[];
        total: number;
    };
    filters: {
        search?: string;
    };
}

// Helper to get display text below name (summary or skills as fallback)
const getSubtitle = (candidate: Candidate): string | null => {
    if (candidate.experience_summary) return candidate.experience_summary;
    if (candidate.skills) return candidate.skills;
    return null;
};

export default function CandidatesIndex({ candidates, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/candidates', { search }, { preserveState: true });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this candidate?')) {
            router.delete(`/candidates/${id}`);
        }
    };

    const handleView = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title="Candidates - Gennie AI Recruiter" />

            <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
                {/* Navigation Tabs - Consistent with Dashboard */}
                <DashboardNavigation activeTab="candidates" />

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
                        <p className="text-muted-foreground">
                            Manage your talent pool and view candidate profiles.
                        </p>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by name, email, or skills..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                setSearch(newValue);
                                // If search is cleared (empty), reset the search
                                if (newValue === '') {
                                    router.get('/candidates', {}, { preserveState: true });
                                }
                            }}
                        />
                    </form>

                    <Link href="/candidates/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Candidate
                        </Button>
                    </Link>
                </div>

                {/* Candidates List */}
                {candidates.data.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                {search ? (
                                    <Search className="h-6 w-6 text-muted-foreground" />
                                ) : (
                                    <Plus className="h-6 w-6 text-muted-foreground" />
                                )}
                            </div>
                            <h3 className="text-lg font-medium mb-2">
                                {search ? `No results for "${search}"` : 'No candidates found'}
                            </h3>
                            <p className="text-muted-foreground text-center mb-6 max-w-sm">
                                {search
                                    ? 'Try adjusting your search terms or clear the search to see all candidates.'
                                    : 'Get started by adding candidates manually or uploading their resumes.'
                                }
                            </p>
                            {search ? (
                                <Button variant="outline" onClick={() => { setSearch(''); router.get('/candidates'); }}>
                                    Clear Search
                                </Button>
                            ) : (
                                <Link href="/candidates/create">
                                    <Button>
                                        Add Candidate
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead className="hidden md:table-cell">Location</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {candidates.data.map((candidate) => (
                                    <TableRow key={candidate.id}>
                                        <TableCell>
                                            <div className="font-medium">{candidate.name}</div>
                                            {getSubtitle(candidate) && (
                                                <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs" title={getSubtitle(candidate) || undefined}>
                                                    {getSubtitle(candidate)}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                                    {candidate.email}
                                                </div>
                                                {candidate.phone && (
                                                    <div className="flex items-center gap-1.5">
                                                        <PhoneIcon className="h-3 w-3 text-muted-foreground" />
                                                        {candidate.phone}
                                                    </div>
                                                )}
                                                {candidate.linkedin_url && (
                                                    <a href={candidate.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                                                        <Linkedin className="h-3 w-3" />
                                                        LinkedIn
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {getLocation(candidate) && (
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <MapPin className="h-3 w-3" />
                                                    {getLocation(candidate)}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleView(candidate)}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>
                                                <Link href={`/candidates/${candidate.id}/edit`}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Pencil className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(candidate.id)}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}

                {/* View Candidate Dialog */}
                <ViewCandidateDialog
                    candidate={selectedCandidate}
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                />
            </div>
        </div>
    );
}
