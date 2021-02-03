import Component from '@glimmer/component';
import {
  computed
} from '@ember/object';

export default class CardsAkProgressBarComponent extends Component {

  @computed('args.{total,value}')
  get progress() {
    return this.args.value / this.args.total * 100;
  }

}
