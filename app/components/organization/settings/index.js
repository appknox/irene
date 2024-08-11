import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class OrganizationSettings extends Component {
  @service me;
}
