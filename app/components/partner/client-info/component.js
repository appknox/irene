import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { computed, action } from "@ember/object";
import { inject as service } from "@ember/service";
import { isEmpty } from "@ember/utils";
import { task } from "ember-concurrency";

export default class CardsClientInfoComponent extends Component {
  @service store;
  @service partner;

  @tracked clientPlan = {};
  @tracked showOwnerEmails = false;

  ownerEmailCount = this.args.client.ownerEmails.length - 1;

  @action
  toggleOwnerEmailList() {
    this.showOwnerEmails = !this.showOwnerEmails;
  }

  @computed("args.client.name")
  get isEmptyTitle() {
    return isEmpty(this.args.client.name);
  }

  @task(function* () {
    this.clientPlan = yield this.store.find(
      "partner/partnerclient-plan",
      this.args.client.id
    );
  })
  getClientPlan;
}
