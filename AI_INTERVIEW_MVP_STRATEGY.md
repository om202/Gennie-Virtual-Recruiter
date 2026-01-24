# MVP Strategy: The "24/7 AI Screener"

## The Pivot: From "ATS" to "Screening Engine"
Instead of "replacing" the recruiter's workflow, we **supercharge** their bottleneck: **The First Phone Screen**.
Recruiters hate the initial 15-minute "sanity check" call. It's repetitive, draining, and 90% wasted time.
**Gennie is the filter that ensures they only talk to qualified candidates.**

---

## 1. The Strategy: "Plug-and-Play Screening"
To be pitchable and demoable, Gennie must require **Zero Setup Friction**.

### Core Value Proposition (The Pitch)
> "Stop spending 20 hours a week on phone screens. Send a Gennie link. Get a scored report. Only interview the top 10%."

### Key MVP Features (The "Must Haves" for Demo)
1.  **The "Magic Link" (Shareable URL)**
    *   *Now:* You have to add a candidate manually to `Candidates` table.
    *   *New:* Generate a Public Link for the Interview: `gennie.ai/interview/{uuid}`.
    *   *Workflow:* Recruiter copies link -> Pastes in LinkedIn DM / Email / ATS template -> Candidate clicks & talks.

2.  **The "One-Glance" Scorecard (The Deliverable)**
    *   *Now:* A log of text.
    *   *New:* A graphical report sent to the Recruiter's email/dashboard.
        *   ✅ **Python Skills:** 8/10
        *   ✅ **Communication:** 9/10
        *   ❌ **Salary Expectations:** Mismatch (Asked $150k, Budget $120k)
        *   **Verdict:** "Pass to Hiring Manager"

3.  **Visual "Proof of Intelligence"**
    *   *During the demo, the AI shouldn't just ask questions. It should **probe**.*
    *   *Demo Moment:* Candidate gives a vague answer. AI says: "Can you be more specific about how you handled the database migration?"
    *   *Why:* This proves it's not a chatbot; it's a *recruiter*.

---

## 2. The "Perfect Demo" Flow (For Investors/Users)
Do not show the admin dashboard first. Show the **Pain Relief**.

**Scene 1: The Setup (30 Seconds)**
1.  Open Gennie.
2.  Click "New Job" -> "Senior Backend Dev".
3.  Paste the JD text.
4.  **Click "Generate"** -> Gennie instantly creates 5 tech/behavioral questions.
5.  **Copy "Invite Link".** (End of Recruiter work).

**Scene 2: The Candidate Experience (The "Wow")**
1.  Open Link in Incognito window.
2.  Click "Start".
3.  **Talk to Gennie.** (Use voice).
4.  Answer 2 questions. Interrupt the AI. Show latency is near-zero.

**Scene 3: The Payoff (The "Hook")**
1.  Refresh Recruiter Dashboard.
2.  **New Row appears:** "Candidate #12 - Score: 92%".
3.  Click it. See the **Summary**: "Strong candidate. Explained CAP theorem correctly. Good culture fit."
4.  **Pitch Line:** "I just screened this candidate while sleeping. Imagine doing this for 500 applicants overnight."

---

## 3. Product Roadmap (Prioritized)

### P0 (Critical for Launch)
*   **Public Interview Links:** Allow anonymous/guest users to take interviews via a hash link.
*   **Auto-Scoring Engine:** The LLM must output a JSON score (0-10) at the end of the interview.
*   **Email Notifications:** Alert the recruiter when a screen is done with the verdict.

### P1 (The "Sticky" Features)
*   **Anti-Cheat:** Detect if they are reading from a screen (voice cadence analysis).
*   **ATS Integrations:** "Push to Greenhouse".

### P2 (Nice to Have)
*   Custom Voice Avatars (Brand voice).
*   Multi-language support.

---

## 4. Why This Wins
*   **Low Barrier:** Recruiter doesn't need to "switch" systems. They just use the link.
*   **High Volume:** Solves the "1000 applicants" problem instantly.
*   **Tangible ROI:** "Saved 15 minutes" is easy to sell. "Better hiring culture" is hard to sell.
