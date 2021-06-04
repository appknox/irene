import Component from "@glimmer/component";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { isEmpty } from "@ember/utils";

export default class ClientInfoComponent extends Component {
  @service partner;

  @computed('args.client.name')
  get isEmptyTitle() {
    return isEmpty(this.args.client.name);
  }

}
