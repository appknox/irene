import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SsoSettingsServiceProvider extends Component {
  @tracked configTypes = [
    {
      type: 'manual',
      name: 'sp-config',
      label: 'Manual Settings',
      default: this.args.defaultConfig == 'manual',
    },
    {
      type: 'xml',
      name: 'sp-config',
      label: 'XML Metadata',
      default: this.args.defaultConfig == 'xml',
    },
  ];

  @tracked activeConfigType = this.args.defaultConfig
    ? this.configTypes.find((config) => config.default).type
    : '';

  get isShowManualSettings() {
    return this.activeConfigType == 'manual';
  }

  get isShowXmlMetadata() {
    return this.activeConfigType == 'xml';
  }

  @action
  onChange(selectedValue) {
    this.activeConfigType = selectedValue;
  }
}
