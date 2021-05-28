import Model, { attr } from "@ember-data/model";
import dayjs from "dayjs";

export default class RegistrationRequestModel extends Model {
  @attr("string") email;
  @attr() data;
  @attr("date") createdOn;
  @attr("date") updatedOn;
  @attr("date") validUntil;
  @attr("string") approvalStatus;
  @attr("string") source;
  @attr("boolean") isActivated;

  get fullName() {
    return `${this.data.first_name ? this.data.first_name : ""}${
      this.data.last_name ? " " + this.data.last_name : ""
    }`;
  }

  get hasExpired() {
    if (new dayjs(this.validUntil) < new dayjs()) {
      return true;
    }
    return false;
  }

  updateStatus(status) {
    const data = {
      approval_status: status,
    };
    var adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.patch(this.id, this.constructor.modelName, this, data);
  }

  resend() {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.resend(this.id, this.constructor.modelName);
  }
}
