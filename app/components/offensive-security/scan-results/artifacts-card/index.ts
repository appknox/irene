import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { OffsecScanArtifact } from 'irene/models/offsec-scan';

export interface OffensiveSecurityScanResultsArtifactsCardSignature {
  Args: {
    artifacts: OffsecScanArtifact[];
    onDownload: (artifactName: string) => void;
    isDownloading?: boolean;
  };
}

export default class OffensiveSecurityScanResultsArtifactsCardComponent extends Component<OffensiveSecurityScanResultsArtifactsCardSignature> {
  @service declare intl: IntlService;

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
      return this.intl.t('offensiveSecurity.artifactDesc.exploit');
    }
    if (lowerName.includes('resilience')) {
      return this.intl.t('offensiveSecurity.artifactDesc.resilience');
    }
    if (lowerName.includes('evidence')) {
      return this.intl.t('offensiveSecurity.artifactDesc.evidence');
    }
    if (lowerName.includes('loadout')) {
      return this.intl.t('offensiveSecurity.artifactDesc.loadout');
    }
    if (lowerName.includes('summary')) {
      return this.intl.t('offensiveSecurity.artifactDesc.summary');
    }

    return this.intl.t('offensiveSecurity.artifactDesc.default');
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
