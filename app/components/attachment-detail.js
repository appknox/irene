import Ember from 'ember';
import ENV from 'irene/config/environment';

const AttachmentDetailComponent = Ember.Component.extend({
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),

  attachment: null,
  isDownloadingAttachment: false,

  actions: {
    downloadAttachment() {
      const url = ENV.host + this.get("attachment.downloadUrl");
      this.set("isDownloadingAttachment", true);
      this.get("ajax").request(url)
      .then((result) => {
        window.open(result.data.url);
        if(!this.isDestroyed) {
          this.set("isDownloadingAttachment", false);
        }
      }, (error) => {
        if(!this.isDestroyed) {
          this.set("isDownloadingAttachment", false);
          this.get("notify").error(error.payload.message);
        }
      });
    }
  }
});

export default AttachmentDetailComponent;
