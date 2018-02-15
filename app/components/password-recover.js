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
      this.get("ajax").post(ENV.endpoints.recover, {data})
      .then(data=> that.get("notify").success(data.message))
      .catch(function(error) {
        that.get("notify").error(error.payload.message);
      });
    }
  }
});

export default PasswordRecoverComponent;
