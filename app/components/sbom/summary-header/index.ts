import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export interface SbomSummaryHeaderSignature {
  Args: {
    hasCollapsibleContent?: boolean;
  };
  Blocks: {
    summary: [];
    actionBtn: [];
    collapsibleContent: [];
  };
}

export default class SbomSummaryHeaderComponent extends Component<SbomSummaryHeaderSignature> {
  @tracked showCollapsibleContent = false;

  @action
  handleToggleCollapsibleContent() {
    this.showCollapsibleContent = !this.showCollapsibleContent;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::SummaryHeader': typeof SbomSummaryHeaderComponent;
  }
}
