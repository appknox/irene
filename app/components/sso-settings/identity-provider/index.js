import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class SsoSettingsIdentityProviderComponent extends Component {
  get test() {
    return true;
  }

  @action
  onSelectXmlFile(param) {
    console.log('params,', param.readAsText());
  }
}
