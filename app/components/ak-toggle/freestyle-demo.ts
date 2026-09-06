import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

interface AkToggleFreestyleDemoSignature {
  Args: {
    variant?: 'basic' | 'label' | 'sizes';
  };
}

export default class AkToggleFreestyleDemoComponent extends Component<AkToggleFreestyleDemoSignature> {
  @tracked checked = false;
  @tracked checkedLabel = true;
  @tracked checkedSmall = false;
  @tracked checkedMedium = false;
  @tracked checkedLarge = false;

  @action
  handleChange(_event: Event, checked: boolean) {
    this.checked = checked;
  }

  @action
  handleLabelChange(_event: Event, checked: boolean) {
    this.checkedLabel = checked;
  }

  @action
  handleSizeChange(size: 'small' | 'medium' | 'large', _event: Event, checked: boolean) {
    if (size === 'small') this.checkedSmall = checked;
    else if (size === 'medium') this.checkedMedium = checked;
    else this.checkedLarge = checked;
  }
}
