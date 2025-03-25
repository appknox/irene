import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isArray } from '@ember/array';

export interface PartnerPlusNListComponentSignature {
  Element: HTMLElement;
  Args: {
    defaultCount?: number;
    list: string[] | string;
    modalTitle: string;
    suffix?: string;
    isShowSeq: boolean;
  };
}

export default class PartnerPlusNListComponent extends Component<PartnerPlusNListComponentSignature> {
  @tracked showMoreModal = false;

  get defaultCount() {
    return this.args.defaultCount || 1;
  }

  get list() {
    const list = this.args.list;

    return isArray(list) ? (list as string[]) : [list];
  }

  get remainingCount() {
    return this.list.length - this.defaultCount;
  }

  get defaultItems() {
    return this.list.slice(0, this.defaultCount).join(', ');
  }

  @action
  toggleShowMoreModal() {
    this.showMoreModal = !this.showMoreModal;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::PlusNList': typeof PartnerPlusNListComponent;
  }
}
