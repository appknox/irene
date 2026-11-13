import type {
  GoalPath,
  GoalPathStep,
  GoalTechnique,
  GoalTechniqueStatus,
  GoalVerdict,
  PentestFinding,
  PentestGoalResult,
  PentestPlan,
} from 'irene/models/offsec-scan';

const VERDICTS: GoalVerdict[] = [
  'exploited',
  'partial',
  'weakness',
  'untested',
  'held',
];

/** Returns the goal's verdict when the API sent a known one, so older payloads keep their page. */
export function normalizeGoalVerdict(raw?: string | null): GoalVerdict | null {
  const verdict = (raw || '').toLowerCase() as GoalVerdict;

  return VERDICTS.includes(verdict) ? verdict : null;
}

/** The translation key for a verdict's label (Exploited, Partly exploited, Weakness found...). */
export function goalVerdictLabelKey(verdict: GoalVerdict): string {
  return `offensiveSecurity.verdict.${verdict}`;
}

/** The label shown on a technique's pill: its result in the goal verdict's words. */
export function techniqueVerdict(status: GoalTechniqueStatus): GoalVerdict {
  return {
    exploited: 'exploited',
    confirmed: 'weakness',
    safe: 'held',
    not_tested: 'untested',
  }[status] as GoalVerdict;
}

/** The colour of a technique's pill; a confirmed weakness is amber here, though blue on a goal. */
export function techniqueTone(status: GoalTechniqueStatus): GoalVerdict {
  return {
    exploited: 'exploited',
    confirmed: 'partial',
    safe: 'held',
    not_tested: 'untested',
  }[status] as GoalVerdict;
}

export interface GoalTechniqueMetrics {
  exploited: number;
  tested: number;
  testedUnexploited: number;
  safe: number;
  notTested: number;
  total: number;
}

/** How many techniques were exploited, tested, found safe or never run. */
export function goalTechniqueMetrics(
  techniques: GoalTechnique[]
): GoalTechniqueMetrics {
  const count = (status: GoalTechniqueStatus) =>
    techniques.filter((t) => t.status === status).length;

  const tested = techniques.length - count('not_tested');

  return {
    exploited: count('exploited'),
    tested,
    testedUnexploited: tested - count('exploited'),
    safe: count('safe'),
    notTested: count('not_tested'),
    total: techniques.length,
  };
}

const SUCCEEDED_PLAN = ['succeeded', 'achieved'];

function humanize(raw?: string): string {
  const text = (raw || '').replace(/[_-]+/g, ' ').trim();

  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

function isSucceeded(plan: PentestPlan): boolean {
  return SUCCEEDED_PLAN.includes((plan.status || '').toLowerCase());
}

function sentence(raw?: string): string {
  const text = (raw || '').trim();

  if (!text) {
    return '';
  }

  const capital = text.charAt(0).toUpperCase() + text.slice(1);

  return /[.!?]$/.test(capital) ? capital : `${capital}.`;
}

/** The file or target a finding was read from, without the verb that read it ("read_file x" -> "x"). */
function findingTarget(finding: PentestFinding): string {
  return (finding.where ?? finding.places?.[0] ?? '').replace(/^\w+\s+/, '');
}

/** Hides the secret itself: the full value becomes its redacted form, and any other long run is cut short. */
function maskSecrets(finding: PentestFinding): string | undefined {
  let quote = finding.quote;

  if (!quote) {
    return undefined;
  }

  if (finding.value && finding.redacted) {
    quote = quote.split(finding.value).join(finding.redacted);
  }

  return quote.replace(
    /[A-Za-z0-9+/=]{32,}/g,
    (run) => `${run.slice(0, 4)}••••••••`
  );
}

function isDemonstrated(finding: PentestFinding): boolean {
  return /\b(demonstrated|proven|confirmed|exploited)\b/i.test(
    finding.exploitability ?? ''
  );
}

function techniqueFromFinding(
  finding: PentestFinding,
  index: number
): GoalTechnique {
  const [flaw = '', ...rest] = finding.severity_because ?? [];
  const target = findingTarget(finding);

  const technique: GoalTechnique = {
    id: `finding-${index}`,
    category: humanize(finding.kind) || 'Finding',
    name: humanize(finding.pattern) || humanize(finding.verb),
    flaw,
    status: isDemonstrated(finding) ? 'exploited' : 'confirmed',
    description:
      [flaw, finding.exploitability_because, ...(finding.facts ?? [])]
        .map(sentence)
        .filter(Boolean)
        .join(' ') || undefined,
    location: finding.where ?? finding.places?.join(', '),
    evidence: maskSecrets(finding),
    tried: rest.join(' ') || undefined,
  };

  if (technique.status === 'exploited') {
    technique.repro = [
      `Ran ${finding.verb ?? 'the agent'} against ${target}.`,
      sentence(finding.exploitability_because),
    ].filter(Boolean);
  }

  return technique;
}

/** One path per file the secrets were read from, each step being one secret recovered there. */
function pathsFromFindings(findings: PentestFinding[]): GoalPath[] {
  const byTarget = new Map<string, { finding: PentestFinding; id: string }[]>();

  findings.forEach((finding, index) => {
    if (!isDemonstrated(finding)) {
      return;
    }

    const target = findingTarget(finding);
    const group = byTarget.get(target) ?? [];

    group.push({ finding, id: `finding-${index}` });
    byTarget.set(target, group);
  });

  return [...byTarget.entries()].map(([target, group]) => ({
    type: 'individual',
    steps: group.map(({ finding, id }) => ({
      label: id,
      text: `${humanize(finding.pattern)} — ${(finding.redacted ?? '').replace(
        /\*{4,}/g,
        '••••'
      )}`,
    })),
    outcome:
      group.length > 1
        ? `${group.length} secrets recovered from ${target}`
        : `Secret recovered from ${target}`,
    summary: sentence(group[0]?.finding.exploitability_because),
  }));
}

/** The plan's observations as "verb: note" lines, the closest thing to evidence a plan has. */
function planEvidence(plan: PentestPlan, goal: PentestGoalResult): string {
  const byId = new Map((goal.observations ?? []).map((o) => [o.id, o]));

  return (plan.observations ?? [])
    .map((id) => byId.get(id))
    .filter((o): o is NonNullable<typeof o> => Boolean(o))
    .map((o) => `${o.verb}: ${o.note}`)
    .join('\n');
}

function techniqueFromPlan(
  plan: PentestPlan,
  goal: PentestGoalResult
): GoalTechnique {
  const status = (plan.status || '').toLowerCase();

  const base = {
    id: `plan-${plan.number}`,
    category: humanize(plan.steps[0]) || `Plan ${plan.number}`,
    name: plan.hypothesis,
    flaw: plan.expected,
  };

  if (isSucceeded(plan)) {
    return {
      ...base,
      status: 'exploited',
      description: plan.reasoning,
      repro: plan.steps.map(humanize),
      evidence: planEvidence(plan, goal) || undefined,
    };
  }

  return {
    ...base,
    status: status === 'spent' ? 'safe' : 'not_tested',
    tried: plan.reasoning,
    safe_result: plan.reason,
  };
}

function pathFromPlan(plan: PentestPlan): GoalPath {
  return {
    type: plan.steps.length > 1 ? 'chain' : 'individual',
    steps: plan.steps.map((text, index) => ({
      text,
      // the first step carries the technique, so the path has an exploit card under it
      label: index === 0 ? `plan-${plan.number}` : undefined,
    })),
    outcome: plan.expected || plan.hypothesis,
    summary: plan.hypothesis,
  };
}

/**
 * The goal as the single-card page needs it. Fields the API sent win; the rest are built from the
 * findings and attack plans every goal already has, so older payloads open the same page.
 */
export function resolveGoalView(goal: PentestGoalResult): PentestGoalResult {
  if (normalizeGoalVerdict(goal.verdict) || goal.goal_id === 'login') {
    return goal;
  }

  const findingTechniques = (goal.findings ?? []).map(techniqueFromFinding);
  const plans = goal.plans ?? [];
  const paths = [
    ...plans.filter(isSucceeded).map(pathFromPlan),
    ...pathsFromFindings(goal.findings ?? []),
  ];

  const techniques = [
    ...plans.map((plan) => techniqueFromPlan(plan, goal)),
    ...findingTechniques,
  ];

  const exploited = techniques.some((t) => t.status === 'exploited');

  let verdict: GoalVerdict = 'untested';

  if (exploited) {
    verdict = goal.status === 'completed' ? 'exploited' : 'partial';
  } else if (findingTechniques.length > 0) {
    verdict = 'weakness';
  } else if (goal.status === 'completed') {
    verdict = 'held';
  }

  return {
    ...goal,
    verdict,
    description: goal.description ?? goal.reason,
    detail: goal.detail ?? goal.reason,
    paths: goal.paths ?? paths,
    techniques: goal.techniques ?? techniques,
  };
}

export interface GoalDetail {
  /** What is left of the detail once the description, route and ruled-out list are taken out. */
  intro: string;
  route: GoalPathStep[];
  ruledOut: string[];
}

// "{{obs:12:credential_assignment}}" points at an observation; only its name reads as text
const OBS_PLACEHOLDER = /\{\{obs:\d+:([^}]+)\}\}/g;

// "read_file(2. read the cache sidecar)" or "list_files(target=x, 1. list Caches)"
const ROUTE_STEP = /^(\w+)\((?:target=[^,]*,\s*)?(?:\d+\.\s*)?(.*)\)$/s;

function splitOnce(text: string, marker: string): [string, string] {
  const index = text.indexOf(marker);

  return index === -1
    ? [text, '']
    : [text.slice(0, index), text.slice(index + marker.length)];
}

function routeStep(raw: string): GoalPathStep {
  const match = raw.match(ROUTE_STEP);

  return match
    ? { verb: match[1], text: sentence(match[2]) || (match[1] as string) }
    : { text: raw };
}

/** Splits a goal's detail into its intro, the "Route: a → b" steps and the "Ruled out: x; y" list. */
export function parseGoalDetail(
  detail?: string,
  description?: string
): GoalDetail {
  let text = (detail ?? '')
    .replace(OBS_PLACEHOLDER, (_, name: string) => name.replace(/_/g, ' '))
    .trim();

  const lead = (description ?? '').trim();

  if (lead && text.startsWith(lead)) {
    text = text.slice(lead.length).trim();
  }

  const [beforeRuledOut, ruledOut] = splitOnce(text, 'Ruled out:');
  const [intro, route] = splitOnce(beforeRuledOut, 'Route:');

  return {
    intro: intro.trim(),
    route: route
      .split('→')
      .map((step) => step.trim())
      .filter(Boolean)
      .map(routeStep),
    ruledOut: ruledOut
      .split(/;\s+/)
      .map((item) => item.trim().replace(/;$/, ''))
      .filter(Boolean),
  };
}

/** The description without the route it repeats ("X was reached via: a → b" -> "X was reached."). */
export function goalDescriptionText(description?: string): string {
  const text = (description ?? '').trim();
  const index = text.search(/\s+via:/);

  return index === -1 ? text : `${text.slice(0, index)}.`;
}
