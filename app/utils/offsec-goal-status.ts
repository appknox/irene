export type OffsecGoalStatusClass =
  | 'budget-exhausted'
  | 'completed'
  | 'failed'
  | 'in-progress'
  | 'neutral';

/** Maps a raw pentest goal status from the agent to its display tone. */
export function offsecGoalStatusClass(status?: string): OffsecGoalStatusClass {
  const raw = (status || '').toLowerCase();

  if (raw === 'budget_exhausted') {
    return 'budget-exhausted';
  }

  if (raw === 'completed' || raw === 'success' || raw === 'achieved') {
    return 'completed';
  }

  if (raw === 'failed' || raw === 'error') {
    return 'failed';
  }

  if (raw === 'in_progress' || raw === 'running') {
    return 'in-progress';
  }

  return 'neutral';
}

/** Maps a raw pentest goal status from the agent to a readable label. */
export function offsecGoalStatusLabel(status?: string): string {
  const raw = status || '';

  switch (offsecGoalStatusClass(raw)) {
    case 'budget-exhausted':
      return 'Budget Exhausted';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'in-progress':
      return 'In Progress';
    default:
      return (
        raw.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ||
        'Finished'
      );
  }
}
