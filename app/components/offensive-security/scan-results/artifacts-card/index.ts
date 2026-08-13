import Component from '@glimmer/component';
import { action } from '@ember/object';

import type { OffsecScanArtifact } from 'irene/models/offsec-scan';

export interface OffensiveSecurityScanResultsArtifactsCardSignature {
  Args: {
    artifacts: OffsecScanArtifact[];
    onDownload: (artifactName: string) => void;
    isDownloading?: boolean;
  };
}

export default class OffensiveSecurityScanResultsArtifactsCardComponent extends Component<OffensiveSecurityScanResultsArtifactsCardSignature> {
  get hasArtifacts(): boolean {
    return this.args.artifacts.length > 0;
  }

  @action
  sizeLabel(bytes: number): string {
    if (!bytes) {
      return '—';
    }

    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  @action
  handleDownload(artifactName: string): void {
    this.args.onDownload(artifactName);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::ScanResults::ArtifactsCard': typeof OffensiveSecurityScanResultsArtifactsCardComponent;
  }
}
