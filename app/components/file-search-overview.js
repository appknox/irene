import Component from '@ember/component';
import ENV from 'irene/config/environment';

export default Component.extend({
  tagName: ['tr'],

  actions: {
    downloadApp() {
      const fileId = this.get("file.id");
      const url = [ENV.endpoints.apps, fileId].join('/');
      this.set("isDownloadingApp", true);
      return this.get("ajax").request(url, { namespace: '/api/hudson-api'})
      .then((data) => {
        window.location = data.url;
        this.set("isDownloadingApp", false);
      }, (error) => {
        this.set("isDownloadingApp", false);
        for (error of error.errors) {
          this.get("notify").error(error.detail.error);
        }
      });
    }
  }
});
