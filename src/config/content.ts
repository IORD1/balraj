/**
 * All copy and mock data shown in the experience.
 * The agent output is what the backend should eventually return
 * (see src/services/agent.ts).
 */

export const ENGAGEMENT = {
  firm: 'AVANTIA CONSULTING',
  division: 'AI Division',
  introSubtitle: 'AI Consulting Division · Project ELOT',
  project: 'Project ELOT',
  client: 'Suvidha Finserve',
  buildingSign: 'AVANTIA',
} as const

export const DEFAULT_BRIEF = 'Diagnose SME loan origination TAT at Suvidha Finserve'

export type SchematicType = 'e5' | 'questions' | '7s' | 'tree' | 'reqs' | 'grid' | 'dmadv' | 'change'

export interface FrameworkPanel {
  name: string
  subtitle: string
  schematic: SchematicType
}

/** Eight framework panels lining the corridor (Act 4). */
export const FRAMEWORK_PANELS: FrameworkPanel[] = [
  { name: 'E5 FRAMEWORK', subtitle: 'Discovery', schematic: 'e5' },
  { name: 'QUESTION MIX', subtitle: 'Elicitation', schematic: 'questions' },
  { name: 'McKINSEY 7S', subtitle: 'Diagnosis', schematic: '7s' },
  { name: 'MECE / LOGIC TREE', subtitle: 'Structuring', schematic: 'tree' },
  { name: 'BR → UR → FR', subtitle: 'Requirements', schematic: 'reqs' },
  { name: 'ZACHMAN GRID', subtitle: 'Architecture', schematic: 'grid' },
  { name: 'DMADV', subtitle: 'Process Design', schematic: 'dmadv' },
  { name: 'ADKAR + KOTTER', subtitle: 'Change', schematic: 'change' },
]

/** Number of wall screens in the agent room (one per closed wall of the hexagon). */
export const SCREEN_COUNT = 5

export interface AgentStat { value: string; label: string }
export interface AgentSection { title: string; body: string }
export interface AgentOutput {
  stats: AgentStat[]
  headline: string
  sections: AgentSection[]
  meta: string
}

export const AGENT_OUTPUT: AgentOutput = {
  stats: [
    { value: '47', label: 'Findings' },
    { value: '5', label: 'Frameworks' },
    { value: '≤3d', label: 'Target TAT' },
  ],
  headline:
    'SME origination runs at 12 working days against a 24-hour benchmark. The recommendation is a control layer around the legacy LOS — not a replacement programme.',
  sections: [
    {
      title: 'Diagnostic summary.',
      body: "Suvidha's SME loan origination process currently averages 12 working days end-to-end against a competitive benchmark of 24 hours. Analysis across 210 branches indicates the delay is not a single failure but the compound effect of five reinforcing pressures: customer expectations that have moved to same-day decisioning, an origination process built for a smaller book, credit rules interpreted inconsistently at the branch level, a legacy Loan Origination System that cannot exchange data cleanly with co-lending partners, and a governance model that still depends on paper and email evidence.",
    },
    {
      title: 'Recommendation.',
      body: 'Do not attempt a like-for-like replacement of the legacy LOS. The 2021 Saarthi programme failed at ₹4.1cr because it was IT-led, imposed mandatory fields that did not fit branch reality, and lost frontline adoption within weeks. Instead, build a control layer around the legacy core: an enforced workflow, centrally-owned credit rules, digital document capture with e-KYC, API-based partner reconciliation, and an event-level audit trail. The legacy LOS is retained, rationalised, and only retired once the new layer has evidence of stability.',
    },
    {
      title: 'Change readiness.',
      body: 'Applying ADKAR at role level: relationship managers score high on Awareness but low on Ability without pilot support. Credit approvers score moderately on Desire but resist without governed exception paths. Regional heads sit in the manage-closely quadrant. A Kotter-style guiding coalition co-designed with credit, ops, and branch leadership is required before any configuration begins.',
    },
    {
      title: 'Delivery.',
      body: 'Stage gates for control, Scrum inside each gate for learning. 28-day diagnostic, then future-state design, MVP build, single-region pilot with hard evidence gates on TAT, consistency, controls, and adoption before scaling. Target: SME TAT reduced from 12 days to ≤3 days within 12 months of full rollout.',
    },
  ],
  meta: 'Findings: 47 · Frameworks applied: 5 · Ready for consultant review.',
}
