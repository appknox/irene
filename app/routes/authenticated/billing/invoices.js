import Route from "@ember/routing/route";
import ScrollTopMixin from "irene/mixins/scroll-top";

const AuthenticatedInvoicesRote = Route.extend(ScrollTopMixin, {});

export default AuthenticatedInvoicesRote;
