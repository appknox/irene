import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export interface FileCompareAnalysisDetailsRegulatoryContentSignature<
  T extends object,
> {
  Args: {
    contents: T[] | undefined;
    hasMoreDetails?: boolean;
  };
  Blocks: {
    label: [content: T];
    value: [
      content: T,
      showMoreFor: string | null,
      showMoreHandler: (id: string) => void,
    ];
  };
}

export default class FileCompareAnalysisDetailsRegulatoryComponent<
  T extends object,
> extends Component<FileCompareAnalysisDetailsRegulatoryContentSignature<T>> {
  @tracked showMoreDetailsFor: string | null = null;

  @action
  handleToggleMoreDetails(id: string) {
    this.showMoreDetailsFor = this.showMoreDetailsFor === id ? null : id;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileCompare::AnalysisDetails::RegulatoryContent': typeof FileCompareAnalysisDetailsRegulatoryComponent;
  }
}
