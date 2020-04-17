import Route from "@ember/routing/route";
import config from "irene/config/environment";
import { inject as service } from "@ember/service";
import ScrollTopMixin from "irene/mixins/scroll-top";

const AuthenticatedBillingRoute = Route.extend(ScrollTopMixin, {
  title: `Billing${config.platform}`,

  organization: service("organization"),

  showNotification: false,
  showSuccessNotification: false,
  showFailureNotification: false,

  beforeModel(transition) {
    const isPaymentSuccessful =
      transition.queryParams.success &&
      transition.queryParams.success === "true";

    const hasPaymentFailed =
      transition.queryParams.success &&
      transition.queryParams.success === "false";

    const canShowNotification = isPaymentSuccessful || hasPaymentFailed;

    this.set("showNotification", canShowNotification);
    this.set("showSuccessNotification", isPaymentSuccessful);
    this.set("showFailureNotification", hasPaymentFailed);
    const isPaymentDone = this.get("organization.selected.isPaymentDone");

    if (isPaymentSuccessful) {
      this.set("organization.selected.isPaymentDone", true);
    }

    if (isPaymentDone || isPaymentSuccessful) {
      this.transitionTo("authenticated.billing.plan");
    }
  },

  async model() {
    const organization = await this.get("organization.selected");
    await this.get("store").findAll("pricing-plan");
    const activePlans = await this.get("store")
      .peekAll("pricing-plan")
      .filter((plan) => {
        return plan.get("active") === true;
      });
    const showNotification = this.get("showNotification");
    const isJustifiedCenter = activePlans.get("length") <= 3;

    return {
      showBilling: await organization.get("showBilling"),
      isPaymentDone: await organization.get("isPaymentDone"),
      showNotification,
      showSuccessNotification: this.get("showSuccessNotification"),
      showFailureNotification: this.get("showFailureNotification"),
      plans: activePlans,
      isJustifiedCenter,
    };
  },
});

export default AuthenticatedBillingRoute;
