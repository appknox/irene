/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';

import ENV from 'irene/config/environment';


const PasswordRecoverComponent = Ember.Component.extend({
  identification: "",

  actions: {

    recover() {
      const identification = this.get('identification').trim();
      const that = this;
      const data =
        {identification};
      return this.get("ajax").post(ENV.endpoints.recover, {data})
      .then(data=> that.get("notify").success(data.message)).catch(error =>
        (() => {
          const result = [];
          for (error of Array.from(error.errors)) {
            result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
          }
          return result;
        })()
      );
    }
  }
});

export default PasswordRecoverComponent;
