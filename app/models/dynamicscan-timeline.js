import DS from 'ember-data';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { translationMacro as t } from 'ember-i18n';
import { inject as service } from '@ember/service';
import ENUMS from 'irene/enums';

export default DS.Model.extend({
  i18n: service(),
  createdAt: DS.attr('date'),
  context: DS.attr('string'),
  dynamicscan: DS.belongsTo('dynamicscan'),
  findings: DS.hasMany('timeline-finding'),
  type: DS.attr('number'),
  tScanInvoked: t("scanInvoked"),
  tScanCaptured: t("scanCaptured"),
  tScanApi: t("scanApi"),
  tScanDynamic: t('scanDynamic'),
  tDeviceErrorMessage: t('deviceErrorMessage'),
  createdOnDateTime: computed("createdAt", function() {
      const createdAt = this.get("createdAt");
      if (isEmpty(createdAt)) {
        return;
      }
      let options = { hour: "numeric", minute: "numeric", hour12:true};
      return `${createdAt.toLocaleTimeString([],options)}`;
    }),
  numericID: computed('id', function() { return Number(this.get('id')) }),
  getType: computed('type','context', function(){
    let type = this.get('type');
    let status = this.get('context');
    type = parseInt(type);
    status = parseInt(status)
    switch (type) {
      case ENUMS.TIMELINE.DYNAMIC: return this.get('tScanInvoked');
      case ENUMS.TIMELINE.API: return this.get('tScanCaptured');
      case ENUMS.TIMELINE.EVENT:
        if (![ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN, ENUMS.DYNAMIC_STATUS.NONE, ENUMS.DYNAMIC_STATUS.ERROR, ENUMS.DYNAMIC_STATUS.COMPLETED].includes(status)){
          return this.get('tScanApi');
        }
        return this.get('tScanDynamic');
      default: return "";
    }
  }),
  getContext: computed(function(){
    let context = this.get('context');

    if (this.get('type')!==0){
      return context
    }
    let status = parseInt(context);
    const tDeviceBooting = this.get('dynamicscan').get('tDeviceBooting');
    const tDeviceDownloading = this.get('dynamicscan').get("tDeviceDownloading");
    const tDeviceInstalling = this.get('dynamicscan').get("tDeviceInstalling");
    const tDeviceLaunching = this.get('dynamicscan').get("tDeviceLaunching");
    const tDeviceHooking = this.get('dynamicscan').get("tDeviceHooking");
    const tDeviceShuttingDown = this.get('dynamicscan').get("tDeviceShuttingDown");
    const tDeviceCompleted = this.get('dynamicscan').get("tDeviceCompleted");
    const tDeviceErrorMessage = this.get("tDeviceErrorMessage");
    const tDeviceReady = this.get('dynamicscan').get('tDeviceReady');
    const tDeviceInQueue = this.get('dynamicscan').get('tDeviceInQueue');
    switch (status) {
      case ENUMS.DYNAMIC_STATUS.BOOTING:
        return tDeviceBooting;
      case ENUMS.DYNAMIC_STATUS.DOWNLOADING:
        return tDeviceDownloading;
      case ENUMS.DYNAMIC_STATUS.INSTALLING:
        return tDeviceInstalling;
      case ENUMS.DYNAMIC_STATUS.LAUNCHING:
        return tDeviceLaunching;
      case ENUMS.DYNAMIC_STATUS.HOOKING:
        return tDeviceHooking;
      case ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN:
        return tDeviceShuttingDown;
      case ENUMS.DYNAMIC_STATUS.READY:
        return tDeviceReady;
      case ENUMS.DYNAMIC_STATUS.COMPLETED:
        return tDeviceCompleted;
      case ENUMS.DYNAMIC_STATUS.INQUEUE:
        return tDeviceInQueue;
      case ENUMS.DYNAMIC_STATUS.ERROR:
      {
        let errorStatus = this.get('dynamicscan').get('errorStatus');
        if (errorStatus){
          return this.get('dynamicscan').get("errorMessage")
        }
        return tDeviceErrorMessage;
      }
      default:
        return "Unknown Status";
    }
  })
});
