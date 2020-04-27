import Component from "@ember/component";
import { task } from "ember-concurrency";
import ENV from "irene/config/environment";
import { isNotFoundError } from "ember-ajax/errors";

export default Component.extend({
  isStorageWorking: false,
  isDeviceFarmWorking: false,
  isAPIHostWorking: false,

  localClassNameBindings: [
    "isStorageWorking:storage-operational",
    "isDeviceFarmWorking:devicefarm-operational",
  ],

  didInsertElement() {
    this.get("getStorageStatus").perform();
    this.get("getDeviceFarmStatus").perform();
    this.get("getAPIHostStatus").perform();
  },

  getStorageStatus: task(function* () {
    try {
      let status = yield this.get("ajax").request(ENV.endpoints.status);
      yield this.get("ajax").request(status.data.storage, { headers: {} });
    } catch (error) {
      this.set("isStorageWorking", !!isNotFoundError(error));
    }
  }).drop(),

  getDeviceFarmStatus: task(function* () {
    try {
      yield this.get("ajax").request(ENV.endpoints.ping);
      this.set("isDeviceFarmWorking", true);
    } catch (error) {
      this.set("isDeviceFarmWorking", false);
    }
  }).drop(),

  getAPIHostStatus: task(function* () {
    try {
      yield this.get("ajax").request(`${ENV.host}/api/check`);
      this.set("isAPIHostWorking", true);
    } catch (error) {
      this.set("isAPIHostWorking", false);
    }
  }).drop(),
});
