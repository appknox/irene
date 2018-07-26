import Ember from 'ember';
import ENV from 'irene/config/environment';

export default Ember.Component.extend({
  actions: {
    downloadApp() {
      const fileId = this.$('#file-number').val();
      if (Ember.isEmpty(fileId)) {
        return this.get("notify").error("Please enter the File ID");
      }
      const url = [ENV.endpoints.apps, fileId].join('/');
      return this.get("ajax").request(url, { namespace: '/hudson-api'})
      .then((data) => {
        window.location = data.url;
      }, (error) => {
        for (error of error.errors) {
          this.get("notify").error(error.detail.error);
        }
      });
    }
  }
});
