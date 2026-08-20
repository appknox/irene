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

    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  @action
  getArtifactDescription(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('exploit')) {
      return 'Runnable Frida exploit for exploited findings';
    }
    if (lowerName.includes('resilience')) {
      return 'Risk rating + per-finding results';
    }
    if (lowerName.includes('evidence')) {
      return 'Before/after on-device screens (OCR text)';
    }
    if (lowerName.includes('loadout')) {
      return 'Techniques deployed, order + sha256';
    }
    if (lowerName.includes('summary')) {
      return 'Human-readable attack-run summary';
    }

    return 'Downloadable run artifact';
  }

  @action
  getArtifactIcon(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.endsWith('.js')) {
      return 'code';
    }
    if (lowerName.endsWith('.md')) {
      return 'description';
    }
    if (lowerName.endsWith('.png') || lowerName.endsWith('.jpg')) {
      return 'image';
    }
    return 'insert-drive-file';
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
