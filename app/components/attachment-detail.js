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
      const that = this;
      this.get("ajax").request(url)
        .then(function(result) {
          window.open(result.data.url);
          if(!that.isDestroyed) {
            that.set("isDownloadingAttachment", false);
          }
        }).catch(function(error) {
          if(!that.isDestroyed) {
            that.set("isDownloadingAttachment", false);
            that.get("notify").error(error.payload.message);
          }
        });
    }
  }
});

export default AttachmentDetailComponent;
