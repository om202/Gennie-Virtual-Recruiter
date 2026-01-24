# Gennie - Virtual Recruiter: Analysis & Gap Report

## 1. The "Recruiter" Experience Today
Currently, Gennie feels more like a **"Voice Interview Utility"** than a full "Virtual Recruiter" or ATS (Applicant Tracking System).
The app excels at the specific task of *configuring and running an AI interview*, but it lacks the contextual wrapper that a real recruiter needs to manage their day-to-day workflow.

### The Current Flow
1.  **Create JD** → **Create Interview Helper** → **Schedule** → **Run Voice AI** → **Check Logs**.
2.  **Pros:** The core mechanic (AI Interview) is front-and-center.
3.  **Cons:** It's disconnected. Candidates are just "cards" in a list. There's no sense of "progress" or "funnel."

---

## 2. Critical Missing Pieces (The "Must Haves")

### A. The "Pipeline" View (Kanban Board)
Recruiters don't think in "Lists"; they think in "Stages."
*   **Gap:** You have `Candidates` and `Interviews`, but no visual way to see who is where.
*   **Need:** A generic pipeline for every Job/Interview:
    *   `New Application` -> `Screening (AI)` -> `Review Required` -> `Manager Interview` -> `Offer`.
*   **Why:** Without this, if I have 50 candidates, I am lost.

### B. "Job-Centric" Navigation
*   **Gap:** The Dashboard shows *Interviews*.
*   **Real World:** Recruiters manage *Open Roles* (Jobs). An "Interview" is just a step within a Job.
*   **Correction:** The Dashboard should show "Active Jobs" (e.g., "Senior React Dev - 12 Candidates - 3 Needs Action").

### C. Actionable Insights (Scorecards)
*   **Gap:** The logs are raw.
*   **Need:** The AI needs to produce a **Scorecard** (1-10 rating on specific skills) and a **Recommendation** (Strong Hire / Pass).
*   **Why:** A recruiter spends 30 seconds reviewing a result. They won't read a full transcript. They need a "TL;DR" score.

### D. Communication Hub
*   **Gap:** I can see `candidates.email`, but I can't *email* them.
*   **Need:** A "Send Email" button (or integration).
*   **Why:** Recruitment is 90% communication. "Hey, you passed the AI screen, let's talk."

---

## 3. Recommended "Next Steps" Flow
To make this useful for a real recruiter, we need to shift the focus from **"Administering Tests"** to **"Hiring People"**.

### Phase 1: The "Pipeline" Board
Create a new view `Interviews / {Job} / Board`.
*   Columns: `To Interview`, `In Progress`, `Needs Review`, `Qualified`, `Rejected`.
*   Automatically move candidates to `Needs Review` when the AI finishes a session.

### Phase 2: The "Candidate 360" View
Upgrade `ViewCandidateDialog` to a full page `Candidates/Show.tsx`.
*   Tabs: `Profile`, `Resume`, `Interview Results` (Embedded Player + Scorecard), `Notes`.

### Phase 3: The "Magic" Dashboard
Change `Dashboard.tsx` to be an inbox.
*   "You have 5 completed interviews to review."
*   "3 candidates are waiting for scheduling."

---

## 4. Immediate Low-Hanging Fruit (Quick Wins)
1.  **Resume Preview:** In `Candidates/Index`, clicking "View" should show the PDF resume immediately side-by-side.
2.  **Status Badges on Candidates:** Add a visible status (`New`, `Interviewed`, `Qualified`) to the candidate card so I can scan quickly.
3.  **Bulk Actions:** Select 5 candidates -> "Invite to Interview".
4.  **Score Summary:** On the Interview Card, show "Avg Score: 7.5/10" if available.
