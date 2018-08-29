import Ember from 'ember';
import ENV from 'irene/config/environment';
import {isNotFoundError} from 'ember-ajax/errors';

export default Ember.Component.extend({

  async didInsertElement() {
    try {
      let connection = await this.get("ajax").request(ENV.endpoints.connection);
      let storage = await this.storageCheck(connection.storage);
      this.set("storageWorking", storage);
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
