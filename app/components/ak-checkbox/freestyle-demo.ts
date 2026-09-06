import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

interface AkCheckboxFreestyleDemoSignature {
  Args: {
    variant?: 'basic' | 'label' | 'indeterminate';
  };
}

export default class AkCheckboxFreestyleDemoComponent extends Component<AkCheckboxFreestyleDemoSignature> {
  @tracked checked = true;
  @tracked indeterminate = false;
  @tracked checked1 = true;
  @tracked checked2 = false;

  get selectAllChecked() {
    return this.checked1 && this.checked2;
  }

  get selectAllIndeterminate() {
    return this.checked1 !== this.checked2;
  }

  @action
  handleChange(_event: Event, checked: boolean) {
    this.checked = checked;
  }

  @action
  handleSelectAllChange(_event: Event, checked: boolean) {
    this.checked1 = checked;
    this.checked2 = checked;
  }

  @action
  updateChecked(index: 1 | 2, _event: Event, checked: boolean) {
    if (index === 1) {
      this.checked1 = checked;
    } else {
      this.checked2 = checked;
    }
  }
}
