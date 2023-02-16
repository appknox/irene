import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class OrganizationMember extends Component {
  @service me;
  @service organization;
}
