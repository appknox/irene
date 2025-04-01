import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import type { FilterColumn } from 'irene/services/ai-reporting';

interface AiReportingPreviewFilterByColumnDrawerSignature {
  Args: {
    allColumnsMap: Map<string, FilterColumn>;
    open: boolean;
    onClose: () => void;

    onApply: (allColumnsMap: Map<string, FilterColumn>) => void;
  };
}

export default class AiReportingPreviewFilterByColumnDrawer extends Component<AiReportingPreviewFilterByColumnDrawerSignature> {
  @tracked allColumnsMap = new Map(this.args.allColumnsMap);

  @action
  handleColumnsChange(allColumnsMap: Map<string, FilterColumn>) {
    this.allColumnsMap = new Map(allColumnsMap);
  }

  @action
  handleClose() {
    this.allColumnsMap = new Map(this.args.allColumnsMap); // reset columns

    this.args.onClose();
  }

  @action
  applyAndClose() {
    this.args.onApply(this.allColumnsMap);

    this.args.onClose();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::FilterByColumnDrawer': typeof AiReportingPreviewFilterByColumnDrawer;
  }
}
