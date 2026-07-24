import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

type SelectedType = Date | { start: Date | null; end: Date | null } | Date[] | null;

export default class AkDatePickerFreestyleDemoComponent extends Component {
  @tracked selected: SelectedType = new Date();

  @action
  onSelect(value: { date?: Date } | { date: { start: Date | null; end: Date | null } } | { date: Date[] }) {
    if (value && 'date' in value) {
      this.selected = value.date as SelectedType;
    }
  }
}
