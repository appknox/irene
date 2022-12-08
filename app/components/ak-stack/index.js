import Component from '@glimmer/component';

export default class AkStackComponent extends Component {
  defaultTag = 'div';

  get tag() {
    return this.args.tag || this.defaultTag;
  }

  get spacingUnit() {
    try {
      const value = parseFloat(this.args.spacing);

      // check is number
      if (isNaN(value)) {
        return '';
      }
      // check is integer
      else if (Math.ceil(value) === value) {
        return `${parseInt(value)}`;
      }

      // else is float value
      return `${parseInt(value * 2)}/2`;
    } catch (e) {
      return '';
    }
  }
}
