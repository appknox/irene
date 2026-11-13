import Component from '@glimmer/component';
import type { GoalCredential } from 'irene/models/offsec-scan';

export interface GoalVerdictViewCredentialsSignature {
  Args: {
    credentials: GoalCredential[];
  };
}

interface CredentialGroup {
  /** Every quote that shares these reasons, one per line. */
  quotes: string;
  exploitability_because?: string;
  /** The severity reasons as one paragraph. */
  severity: string;
}

export default class GoalVerdictViewCredentialsComponent extends Component<GoalVerdictViewCredentialsSignature> {
  /** Credentials with the same reasons are clubbed: the reasons show once, the quotes together. */
  get groups(): CredentialGroup[] {
    const groups = new Map<string, { quotes: Set<string> } & GoalCredential>();

    this.args.credentials.forEach((credential) => {
      const key = [
        credential.exploitability_because ?? '',
        ...credential.severity_because,
      ].join('\u0000');

      const group = groups.get(key) ?? { ...credential, quotes: new Set() };

      if (credential.quote) {
        group.quotes.add(credential.quote);
      }

      groups.set(key, group);
    });

    return [...groups.values()].map((group) => ({
      quotes: [...group.quotes].join('\n'),
      exploitability_because: group.exploitability_because,
      severity: group.severity_because.join(' '),
    }));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::ScanResults::GoalVerdictView::Credentials': typeof GoalVerdictViewCredentialsComponent;
  }
}
