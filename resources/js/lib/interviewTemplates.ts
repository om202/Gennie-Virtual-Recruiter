/**
 * Interview templates for different interview types
 */

export interface InterviewTemplate {
    screening: string
    technical: string
    behavioral: string
    final: string
}

const DIFFICULTY_MODIFIERS = {
    entry: 'Ask simple, foundational questions appropriate for entry-level candidates.',
    mid: 'Ask moderate-depth questions that assess intermediate skills and experience.',
    senior: 'Ask in-depth questions that probe advanced expertise and leadership capabilities.',
    executive: 'Focus on strategic thinking, vision, leadership philosophy, and business impact.',
}

export const INTERVIEW_TEMPLATES: InterviewTemplate = {
    screening: `**Screening Interview Focus:**

1. **Introduction & Background**
   - Ask the candidate for a brief introduction (30-60 seconds)
   - Why are they looking for a new opportunity right now?
   - What attracted them to this position?

2. **Work Authorization & Logistics**
   - Current location and willingness to relocate (if job requires it)
   - Visa/work authorization status
   - Whether they require visa sponsorship
   - Notice period or availability to start

3. **Basic Qualifications**
   - Confirm years of experience in relevant field
   - Verify key skills mentioned in the job description
   - Ask about salary expectations (if appropriate)

4. **Availability & Interest Level**
   - Their timeline for making a decision
   - Are they interviewing elsewhere?
   - Any questions about the role or company?

Keep the interview conversational and friendly. This is an initial screening to verify basic fit.`,

    technical: `**Technical Interview Focus:**

Assess the candidate's technical abilities through:

1. **Core Technical Knowledge**
   - Ask questions specific to the technologies in the job description
   - Probe understanding of fundamental concepts
   - Request examples from past projects demonstrating these skills

2. **Problem-Solving Approach**
   - Present a relevant technical scenario or challenge
   - Ask them to walk through their approach to solving it
   - Understand their thought process and decision-making

3. **Hands-On Experience**
   - Discuss specific projects they've worked on
   - Ask about challenges faced and how they overcame them
   - Explore their role and contributions to team projects

4. **Best Practices & Tools**
   - Their familiarity with industry best practices
   - Tools and frameworks they're comfortable with
   - How they stay updated with technology trends

Adjust question depth based on the difficulty level. Be technical but conversational.`,

    behavioral: `**Behavioral Interview Focus:**

Use the STAR method (Situation, Task, Action, Result) to assess:

1. **Teamwork & Collaboration**
   - Describe a time they worked on a challenging team project
   - How do they handle conflicts with team members?
   - Example of helping a struggling colleague

2. **Problem-Solving & Initiative**
   - Tell me about a complex problem they solved
   - A time they went above and beyond their role
   - How they handle ambiguity or unclear requirements

3. **Leadership & Influence**
   - Example of leading a project or initiative (formal or informal)
   - How they've mentored others or shared knowledge
   - A time they had to persuade others to their viewpoint

4. **Growth & Learning**
   - Biggest professional failure and lessons learned
   - How they handle feedback and criticism
   - Recent skill or technology they learned and why

Focus on real examples from their experience. Ask follow-up questions to understand context and impact.`,

    final: `**Final Interview Focus:**

This is the last-stage interview to assess cultural fit and commitment:

1. **Motivation & Career Goals**
   - What are their long-term career aspirations?
   - How does this role fit into their career trajectory?
   - What motivates them professionally?

2. **Company & Culture Fit**
   - What do they know about our company?
   - What excites them most about potentially joining?
   - Questions about our values, mission, or products

3. **Role Clarity & Expectations**
   - Their understanding of the role and responsibilities
   - What success looks like to them in the first 90 days
   - Any concerns or questions about the position?

4. **Logistics & Next Steps**
   - Confirm compensation expectations
   - Start date availability
   - Any pending offers or interviews to be aware of?
   - Answer any final questions they have

This interview should feel like a two-way conversation about mutual fit. Be warm and transparent.`,
}

/**
 * Get the template instructions for a given interview type and difficulty
 */
export function getInterviewTemplate(
    type: keyof InterviewTemplate,
    difficulty: keyof typeof DIFFICULTY_MODIFIERS
): string {
    const baseTemplate = INTERVIEW_TEMPLATES[type]
    const difficultyNote = DIFFICULTY_MODIFIERS[difficulty]

    return `${baseTemplate}\n\n**Difficulty Level Note:**\n${difficultyNote}`
}
