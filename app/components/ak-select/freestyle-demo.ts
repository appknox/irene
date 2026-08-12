import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

type SelectItem = { label: string; value: string };

const SELECT_ITEMS: SelectItem[] = [
  { label: 'Maintainer', value: 'maintainer' },
  { label: 'Developer', value: 'developer' },
  { label: 'Reporter', value: 'reporter' },
];

const DEFAULT_ITEM: SelectItem = SELECT_ITEMS[0]!;

interface AkSelectFreestyleDemoSignature {
  Args: {
    multiple?: boolean;
  };
}

export default class AkSelectFreestyleDemoComponent extends Component<AkSelectFreestyleDemoSignature> {
  selectItems = SELECT_ITEMS;
  @tracked selected: SelectItem | SelectItem[] = DEFAULT_ITEM;

  get selectedValue(): SelectItem | SelectItem[] {
    if (this.args.multiple) {
      return Array.isArray(this.selected) ? this.selected : [this.selected];
    }
    const single = Array.isArray(this.selected) ? this.selected[0] : this.selected;
    return single ?? DEFAULT_ITEM;
  }

  @action
  handleSelectChange(selected: SelectItem | SelectItem[]) {
    this.selected = selected;
  }
}
