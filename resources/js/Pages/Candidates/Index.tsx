import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MapPin, Trash2, Mail, Phone as PhoneIcon, Eye, Pencil, ClipboardList, X, Users, FileText } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
    job_applications_count: number;
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



export default function CandidatesIndex({ candidates, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
    const [highlightedCandidateId, setHighlightedCandidateId] = useState<string | null>(null);
    const [displayedCandidates, setDisplayedCandidates] = useState<Candidate[]>(candidates.data);

    // Check for highlight query parameter on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const highlightId = urlParams.get('highlight');
        if (highlightId) {
            setHighlightedCandidateId(highlightId);
            // Filter to show only the highlighted candidate
            const filtered = candidates.data.filter(c => c.id === highlightId);
            if (filtered.length > 0) {
                setDisplayedCandidates(filtered);
            }
        } else {
            setDisplayedCandidates(candidates.data);
        }
    }, [candidates.data]);

    const clearFilter = () => {
        setHighlightedCandidateId(null);
        setDisplayedCandidates(candidates.data);
        router.visit('/candidates', { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/candidates', { search }, { preserveState: true });
    };

    const confirmDelete = (candidate: Candidate) => {
        setCandidateToDelete(candidate);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (!candidateToDelete) return;
        router.delete(`/candidates/${candidateToDelete.id}`);
        setDeleteDialogOpen(false);
        setCandidateToDelete(null);
    };

    return (
        <div className="min-h-screen bg-muted/50">
            <Head title="Candidates" />

            <div className="max-w-7xl mx-auto py-8 md:pt-12 px-4 md:px-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
                            <Users className="h-7 w-7 text-primary/80" />
                            Candidates
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your talent pool and view candidate profiles.
                        </p>
                    </div>
                    {displayedCandidates.length > 0 && (
                        <Link href="/candidates/create">
                            <Button className="w-full md:w-auto">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Candidate
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Search Bar */}
                {displayedCandidates.length > 10 && (
                    <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by name, email, or skills..."
                            className="pl-9 bg-white"
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
                )}

                {/* Filter Indicator */}
                {highlightedCandidateId && (
                    <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">Filtered</Badge>
                            <span className="text-sm text-muted-foreground">
                                Showing 1 candidate from interview logs
                            </span>
                        </div>
                        <Button variant="outline" size="sm" onClick={clearFilter}>
                            <X className="h-4 w-4 mr-2" />
                            Clear Filter
                        </Button>
                    </div>
                )}

                {/* Candidates List */}
                {displayedCandidates.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            {search ? (
                                <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            ) : (
                                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            )}
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
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Candidate
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedCandidates.map((candidate) => (
                            <Card key={candidate.id} className="hover:shadow-md transition-shadow flex flex-col">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1 flex-1 min-w-0">
                                            <CardTitle className="text-lg leading-tight truncate">
                                                {candidate.name}
                                            </CardTitle>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Link href={`/candidates/${candidate.id}/edit`}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0"
                                                    title="Edit Candidate"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                                onClick={() => confirmDelete(candidate)}
                                                title="Delete Candidate"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col">
                                    {/* Contact Information */}
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <span className="truncate">{candidate.email}</span>
                                        </div>
                                        {candidate.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <PhoneIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                <span>{candidate.phone}</span>
                                            </div>
                                        )}
                                        {getLocation(candidate) && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">{getLocation(candidate)}</span>
                                            </div>
                                        )}

                                        {/* Job Applications Badge */}
                                        {candidate.job_applications_count > 0 && (
                                            <Link href={`/candidates/${candidate.id}`} className="pt-1 block">
                                                <Badge variant="secondary" className="gap-1 text-xs cursor-pointer hover:bg-primary/10">
                                                    <FileText className="h-3 w-3" />
                                                    {candidate.job_applications_count} Application{candidate.job_applications_count !== 1 ? 's' : ''}
                                                </Badge>
                                            </Link>
                                        )}
                                    </div>

                                    {/* Action Buttons - Pushed to bottom */}
                                    <div className="flex gap-2 mt-4">
                                        <Link href={`/candidates/${candidate.id}`} className="flex-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                        </Link>
                                        <Link href={`/interviews/logs?candidate=${candidate.id}`} className="flex-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                            >
                                                <ClipboardList className="h-4 w-4 mr-2" />
                                                Interviews
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the candidate "{candidateToDelete?.name}".
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
