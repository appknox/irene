import Component from '@glimmer/component';

export default class AkButtonComponent extends Component {
  get size() {
    return this.args.size || 'medium';
  }

  get variant() {
    return this.args.variant || 'default';
  }
}
