import Ember from 'ember';
import ENV from 'irene/config/environment';
import {isNotFoundError} from 'ember-ajax/errors';

export default Ember.Component.extend({

  isStorageWorking: false,
  isDeviceFarmWorking: false,

  didInsertElement() {
    this.storageStatus();
    this.deviceFarmStatus();
  },

  deviceFarmStatus() {
    this.get("ajax").request(ENV.endpoints.ping)
    .then(() => {
      this.set("isDeviceFarmWorking", true);
    });
  },

  async storageStatus() {
    try {
      let connection = await this.get("ajax").request(ENV.endpoints.connection);
      let storage = await this.storageCheck(connection.storage);
      this.set("isStorageWorking", storage);
    }
    catch(error) {
      return this.get("notify").error("Sorry something went wrong, please try again");
    }
  },

  storageCheck(url) {
    return this.get('ajax').request(url, {
      headers:{
        'Authorization': "Basic"
      }
    }).catch((error) => {
      return isNotFoundError(error)
    })
  }
});
