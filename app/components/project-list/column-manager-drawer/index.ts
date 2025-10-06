import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import type { FilterColumn } from 'irene/components/project-list/table-columns';

interface ProjectListColumnManagerDrawerSignature {
  Args: {
    open: boolean;
    allColumnsMap: Map<string, FilterColumn>;
    onClose: () => void;
    onApply: (allColumnsMap: Map<string, FilterColumn>) => void;
  };
}

export default class ProjectListColumnManagerDrawer extends Component<ProjectListColumnManagerDrawerSignature> {
  @tracked allColumnsMap: Map<string, FilterColumn>;

  constructor(
    owner: unknown,
    args: ProjectListColumnManagerDrawerSignature['Args']
  ) {
    super(owner, args);

    this.allColumnsMap = new Map(args.allColumnsMap);
  }

  @action
  handleColumnsChange(allColumnsMap: Map<string, FilterColumn>) {
    this.allColumnsMap = new Map(allColumnsMap);
  }

  @action
  handleClose() {
    this.allColumnsMap = new Map(this.args.allColumnsMap); // Reset columns
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
    'ProjectList::ColumnManagerDrawer': typeof ProjectListColumnManagerDrawer;
  }
}
