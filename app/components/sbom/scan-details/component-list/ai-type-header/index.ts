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

  get typeOptions() {
    return [
      { key: this.intl.t('all'), value: null },
      { key: this.intl.t('sbomModule.aiTypeLabel.model'), value: 'model' },
      { key: this.intl.t('sbomModule.aiTypeLabel.library'), value: 'library' },
      {
        key: this.intl.t('sbomModule.aiTypeLabel.tokenizer'),
        value: 'tokenizer',
      },
      { key: this.intl.t('sbomModule.aiTypeLabel.config'), value: 'config' },
      {
        key: this.intl.t('sbomModule.aiTypeLabel.supporting'),
        value: 'supporting',
      },
      { key: this.intl.t('sbomModule.aiTypeLabel.secret'), value: 'secret' },
      {
        key: this.intl.t('sbomModule.aiTypeLabel.cloudEndpoint'),
        value: 'cloud_endpoint',
      },
      {
        key: this.intl.t('sbomModule.aiTypeLabel.platformManagedAi'),
        value: 'platform_managed_ai',
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
