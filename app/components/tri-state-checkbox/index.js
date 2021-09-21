import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class TriStateCheckboxComponent extends Component {
  @service intl;

  @tracked value;

  @action
  toggle(event) {
    this.value = event.target.checked;
    this.args.onToggle(this.value);
  }
}
