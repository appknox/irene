import Service from "@ember/service";
import { inject as service } from "@ember/service";

export default Service.extend({
  organization: service("organization"),
  store: service("store"),
  notify: service("notification-messages"),
  rollbar: service("rollbar"),

  localStorageUID: null,

  async computeLocalStorageUID() {
    try {
      const organization = await this.get("organization.selected");
      const currentUserData = await this.get("store")
        .peekAll("user")
        .get("firstObject");
      const userEmail = currentUserData.get("email");
      const organizationId = await organization.get("id");
      return `${userEmail}_${organizationId}`;
    } catch (err) {
      this.get("notify").error(err.message);
      this.get("rollbar").critical("localStorageUID generation failed", err);
    }
  },

  async setDataUID() {
    if (this.get("localStorageUID") === null) {
      const UID = await this.computeLocalStorageUID();
      if (UID) {
        this.set("localStorageUID", UID);
      }
    }
  },

  async setData(keyPrefix, payload) {
    try {
      await this.setDataUID();
      localStorage.setItem(
        `${keyPrefix}_${this.get("localStorageUID")}`,
        JSON.stringify(payload)
      );
    } catch (err) {
      throw new Error("Failed to set data in temp storage");
    }
  },

  async getData(keyPrefix) {
    try {
      await this.setDataUID();
      return localStorage.getItem(
        `${keyPrefix}_${this.get("localStorageUID")}`
      );
    } catch (err) {
      throw new Error("Failed to get data from temp storage");
    }
  },

  async clearData(keyPrefix) {
    try {
      await this.setDataUID();
      localStorage.removeItem(`${keyPrefix}_${this.get("localStorageUID")}`);
    } catch (err) {
      throw new Error("Failed to clear data in temp storage");
    }
  },
});
