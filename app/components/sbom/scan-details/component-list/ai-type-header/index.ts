import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

export interface AiTypeHeaderComponentSignature {
  Args: {
    onAiArtifactClassChange: (artifactClass: string | null) => void;
    selectedAiArtifactClass?: string | null;
  };
}

export default class AiTypeHeaderComponent extends Component<AiTypeHeaderComponentSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;

  // Mirrors the same bucketing already used for the component type column
  // and summary bar counts: tokenizer/config/supporting collapse into one
  // "Supporting Artifact" option here too, rather than 3 raw sub-types the
  // rest of the AI BoM UI never shows on their own. The backend's
  // ai_artifact_class filter accepts "supporting_artifact" as a bucket
  // value that expands to all 3 (see SBFileComponentFilter in mycroft).
  get typeOptions() {
    return [
      { key: this.intl.t('all'), value: null },
      { key: this.intl.t('sbomModule.aiTypeLabel.model'), value: 'model' },
      { key: this.intl.t('sbomModule.aiTypeLabel.library'), value: 'library' },
      { key: this.intl.t('sbomModule.aiTypeLabel.secret'), value: 'secret' },
      {
        key: this.intl.t('sbomModule.aiTypeLabel.cloudEndpoint'),
        value: 'cloud_endpoint',
      },
      {
        key: this.intl.t('sbomModule.aiTypeLabel.platformManagedAi'),
        value: 'platform_managed_ai',
      },
      {
        key: this.intl.t('sbomModule.supportingArtifact'),
        value: 'supporting_artifact',
      },
    ];
  }

  get selectedAiArtifactClass() {
    return this.args.selectedAiArtifactClass ?? null;
  }

  get filterApplied() {
    return this.selectedAiArtifactClass !== null;
  }

  @action handleClick(event: MouseEvent) {
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action handleOptionsClose() {
    this.anchorRef = null;
  }

  @action selectAiArtifactClass(value: string | null) {
    this.anchorRef = null;

    this.args.onAiArtifactClassChange(value);
  }

  @action clearFilter() {
    this.anchorRef = null;

    this.args.onAiArtifactClassChange(null);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::AiTypeHeader': typeof AiTypeHeaderComponent;
  }
}
