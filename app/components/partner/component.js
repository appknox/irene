import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { action, set } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class PartnerComponent extends Component {
  @service intl;
  @service router;
  @service organization;

  @tracked tabs = [
    {
      label: this.intl.t("clients"),
      active: true,
      enabled: true,
      link: "authenticated.partner.clients",
    },
  ];

  @action
  initalize() {
    this.setDefaultTab();
  }

  @action
  switchTab(tab) {
    this.tabs.map((tab) => {
      set(tab, "active", false);
    });
    set(tab, "active", true);
  }

  setDefaultTab() {
    const loadedTab = this.tabs.findBy("link", this.router.currentRouteName);
    if (loadedTab) {
      this.switchTab(loadedTab);
    }
  }
}
