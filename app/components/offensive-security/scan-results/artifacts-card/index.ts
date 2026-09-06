import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { OffsecScanArtifact } from 'irene/models/offsec-scan';

export interface OffensiveSecurityScanResultsArtifactsCardSignature {
  Args: {
    artifacts: OffsecScanArtifact[];
    onDownload: (artifact: OffsecScanArtifact | string) => void;
    isDownloading?: boolean;
  };
}

export default class OffensiveSecurityScanResultsArtifactsCardComponent extends Component<OffensiveSecurityScanResultsArtifactsCardSignature> {
  @service declare intl: IntlService;

  get hasArtifacts(): boolean {
    return (this.args.artifacts || []).length > 0;
  }

  @action
  sizeLabel(bytes: number): string {
    if (!bytes && bytes !== 0) {
      return '—';
    }

    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  @action
  getArtifactDescription(artifactOrName: OffsecScanArtifact | string): string {
    const artifact =
      typeof artifactOrName === 'object' && artifactOrName !== null
        ? artifactOrName
        : ({ name: artifactOrName } as Partial<OffsecScanArtifact>);

    // If description is explicitly provided from the API response, use it!
    const explicitDesc = artifact.description || artifact.desc;
    if (typeof explicitDesc === 'string' && explicitDesc.trim().length > 0) {
      return explicitDesc.trim();
    }

    const name = artifact.name || '';
    const description = artifact.description || '';
    const lowerName = name.toLowerCase();
    const contentType = (artifact.content_type || '').toLowerCase();

    if (description) {
      return description;
    }

    if (
      lowerName.endsWith('.apk') ||
      contentType.includes('android') ||
      contentType.includes('package-archive')
    ) {
      return 'Android application package (APK)';
    }

    if (
      lowerName.endsWith('.ipa') ||
      contentType.includes('iphone') ||
      contentType.includes('apple') ||
      contentType.includes('ios') ||
      contentType.includes('x-itunes-ipa')
    ) {
      return 'iOS application archive (IPA)';
    }

    if (lowerName.includes('exploit')) {
      return this.intl.t('offensiveSecurity.artifactDesc.exploit');
    }
    if (lowerName.includes('resilience')) {
      return this.intl.t('offensiveSecurity.artifactDesc.resilience');
    }
    if (lowerName.includes('evidence') || lowerName.includes('investigation')) {
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
  getArtifactIcon(artifactOrName: OffsecScanArtifact | string): string {
    const artifact =
      typeof artifactOrName === 'object' && artifactOrName !== null
        ? artifactOrName
        : ({ name: artifactOrName } as Partial<OffsecScanArtifact>);

    const lowerName = (artifact.name || '').toLowerCase();
    const contentType = (artifact.content_type || '').toLowerCase();

    if (
      lowerName.endsWith('.apk') ||
      contentType.includes('android') ||
      contentType.includes('package-archive')
    ) {
      return 'android';
    }

    if (
      lowerName.endsWith('.ipa') ||
      contentType.includes('iphone') ||
      contentType.includes('apple') ||
      contentType.includes('ios') ||
      contentType.includes('x-itunes-ipa')
    ) {
      return 'apple';
    }

    if (
      lowerName.includes('risk') ||
      lowerName.includes('rating') ||
      lowerName.includes('resilience')
    ) {
      return 'shield';
    }

    if (
      lowerName.includes('exploit') ||
      lowerName.includes('script') ||
      lowerName.endsWith('.js') ||
      lowerName.endsWith('.py')
    ) {
      return 'code';
    }

    if (
      lowerName.includes('evidence') ||
      lowerName.includes('log') ||
      lowerName.endsWith('.json') ||
      contentType.includes('json')
    ) {
      return 'text-snippet-outline';
    }

    if (
      lowerName.endsWith('.png') ||
      lowerName.endsWith('.jpg') ||
      lowerName.endsWith('.jpeg') ||
      contentType.startsWith('image/')
    ) {
      return 'image';
    }

    return 'folder-outline';
  }

  @action
  getArtifactIconClass(artifactOrName: OffsecScanArtifact | string): string {
    const artifact =
      typeof artifactOrName === 'object' && artifactOrName !== null
        ? artifactOrName
        : ({ name: artifactOrName } as Partial<OffsecScanArtifact>);

    const lowerName = (artifact.name || '').toLowerCase();
    const contentType = (artifact.content_type || '').toLowerCase();

    if (
      lowerName.endsWith('.apk') ||
      contentType.includes('android') ||
      contentType.includes('package-archive')
    ) {
      return 'icon-green';
    }

    if (
      lowerName.endsWith('.ipa') ||
      contentType.includes('iphone') ||
      contentType.includes('apple') ||
      contentType.includes('ios') ||
      contentType.includes('x-itunes-ipa')
    ) {
      return 'icon-blue';
    }

    if (
      lowerName.includes('risk') ||
      lowerName.includes('rating') ||
      lowerName.includes('resilience')
    ) {
      return 'icon-purple';
    }

    if (
      lowerName.includes('exploit') ||
      lowerName.includes('script') ||
      lowerName.endsWith('.js')
    ) {
      return 'icon-orange';
    }

    if (
      lowerName.includes('evidence') ||
      lowerName.endsWith('.json') ||
      contentType.includes('json')
    ) {
      return 'icon-green';
    }

    return 'icon-blue';
  }

  @action
  handleDownload(artifact: OffsecScanArtifact | string, event?: Event): void {
    event?.stopPropagation?.();
    event?.preventDefault?.();
    this.args.onDownload(artifact);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::ScanResults::ArtifactsCard': typeof OffensiveSecurityScanResultsArtifactsCardComponent;
  }
}
