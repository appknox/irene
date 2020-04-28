import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";
import ScrollTopMixin from "irene/mixins/scroll-top";

const AuthenticatedBillingPlanRoute = Route.extend(ScrollTopMixin, {
  billingHelper: service("billing-helper"),

  async model() {
    let highlightOneTimeCard = false;
    const hasDataInLocalStore = await this.get(
      "billingHelper"
    ).checkLocalStoreHasData();
    if (hasDataInLocalStore) {
      highlightOneTimeCard = true;
    }
    return {
      highlightOneTimeCard,
    };
  },
});

export default AuthenticatedBillingPlanRoute;
