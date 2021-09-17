import Component from '@glimmer/component';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SsoSettingsServiceProvider extends Component {
  @tracked configTypes = [
    {
      type: 'manual',
      name: 'sp-config',
      label: 'Manual Settings',
      default: true,
    },
    {
      type: 'xml',
      name: 'sp-config',
      label: 'XML Metadata',
      default: false,
    },
  ];

  @tracked activeConfigType = this.configTypes.find((config) => config.default)
    .type;

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
