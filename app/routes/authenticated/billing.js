import Route from "@ember/routing/route";
import config from "irene/config/environment";
import { inject as service } from "@ember/service";
import ScrollTopMixin from "irene/mixins/scroll-top";

const AuthenticatedBillingRoute = Route.extend(ScrollTopMixin, {
  title: `Billing${config.platform}`,

  organization: service("organization"),
  billingHelper: service("billing-helper"),

  showNotification: false,
  showSuccessNotification: false,
  showFailureNotification: false,
  isPaymentMehodsRoute: false,

  async beforeModel(transition) {
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

    const isAddCreditCardAction = await this.get(
      "billingHelper"
    ).checkLocalStoreHasData.call(
      this.get("billingHelper"),
      this.get("billingHelper").cardStoreKeyPrefix
    );

    if (isAddCreditCardAction) {
      this.set("isPaymentMehodsRoute", isAddCreditCardAction);
      this.transitionTo("authenticated.billing.payment-methods");
      return;
    } else if (isPaymentDone || isPaymentSuccessful) {
      this.transitionTo("authenticated.billing.plan");
      return;
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
      isCreditCardAction: this.get("isPaymentMehodsRoute"),
      showNotification,
      showSuccessNotification: this.get("showSuccessNotification"),
      showFailureNotification: this.get("showFailureNotification"),
      plans: activePlans,
      isJustifiedCenter,
    };
  },
});

export default AuthenticatedBillingRoute;
