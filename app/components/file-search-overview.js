import Ember from 'ember';
import ENV from 'irene/config/environment';

export default Ember.Component.extend({
  tagName: ['tr'],

  actions: {
    downloadApp() {
      const fileId = this.get("file.id");
      const url = [ENV.endpoints.apps, fileId].join('/');
      return this.get("ajax").post(url, { namespace: '/hudson-api'})
      .then((data) => {
        window.location = data.url;
      }, (error) => {
        for (error of error.errors) {
          this.get("notify").error(error.detail.error);
        }
      })
    }
  }
});
