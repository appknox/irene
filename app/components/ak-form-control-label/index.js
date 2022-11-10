import Component from '@glimmer/component';

export default class AkFormControlLabelComponent extends Component {
  get placement() {
    return this.args.placement || 'right';
  }
}
