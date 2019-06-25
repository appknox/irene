import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import { translationMacro as t } from 'ember-i18n';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import poll from 'irene/services/poll';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';
import ProxySettingValidation from '../validations/proxy-setting';
import { getOwner } from '@ember/application';
import { task } from 'ember-concurrency';

export default Component.extend({
  tagName: "div",
  classNames: ["column","flex-center"],
  apiScanModal: false,
  dynamicScanModal: false,
  proxyPOJO: {},
  serverErrors: {},
  routing: service('-routing'),
  i18n: service(),
  trial: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  poll: service(),
  init() {
    this._super(...arguments);
    const proxyPOJO = this.get('proxyPOJO');
    const changeset = new Changeset(
      proxyPOJO, lookupValidator(ProxySettingValidation), ProxySettingValidation
    );
    this.set('changeset', changeset);
  },
  currentProxy:null,
  tStartingScan: t("startingScan"),
  getCurrentProxy: task(function * (){
    let record = yield this.get("store").findRecord("proxy-setting", this.get('file.profile.id'), { reload: true });
    return record;
  }),

  openAPIScanModal: task(function * () {
    let changeset = this.get('changeset');
    let currentProxy = yield this.get('getCurrentProxy').perform();
    yield this.set('currentProxy', currentProxy);
    yield changeset.set('host', currentProxy.get('host'));
    yield changeset.set('port', parseInt(currentProxy.get('port')));

    this.set('changeset', changeset);
    const platform = this.get("file.project.platform");
    if ([ENUMS.PLATFORM.ANDROID,ENUMS.PLATFORM.IOS].includes(platform)) { // TEMPIOSDYKEY
      this.set("showAPIScanModal", true);
    } else {
      this.send("doNotRunAPIScan");
    }
  }),
  applyProxyAPI: task(function *(changeset){
    yield changeset.validate()
    if (!changeset.get('isValid')) {
      if(changeset.get('errors') && changeset.get('errors')[0].validation) {
        this.get("notify").error(
          changeset.get('errors')[0].validation[0],
          ENV.notifications
        );
      }
      return;
    }
    let currentProxy = yield this.get('currentProxy');
    const enabled = currentProxy.get('enabled');
    const host = changeset.get('host');
    const port = changeset.get('port');
    try{
      currentProxy.setProperties({
        'enabled': enabled,
        'host': host,
        'port': port,
      })
      yield currentProxy.save()
      this.set('currentProxy', currentProxy);
    }catch(error){
      if(error.payload) {
        if(error.payload.host) {
          this.get("notify").error(error.payload.host[0], ENV.notifications)
        }
        if(error.payload.port) {
          this.get("notify").error(error.payload.port[0], ENV.notifications)
        }
      }
    }
  }),
  saveProxyAPI: task(function *(changeset){
    yield changeset.validate()
    if (!changeset.get('isValid')) {
      if(changeset.get('errors') && changeset.get('errors')[0].validation) {
        this.get("notify").error(
          changeset.get('errors')[0].validation[0],
          ENV.notifications
        );
      }
      return;
    }
    let currentProxy = yield this.get('currentProxy');
    const enabled = !currentProxy.get('enabled');
    const host = changeset.get('host');
    const port = changeset.get('port');
    try{
      currentProxy.setProperties({
        'enabled': enabled,
        'host': host,
        'port': port,
      })
      yield currentProxy.save()
      this.set('currentProxy', currentProxy);
    }catch(error){
      if(error.payload) {
        if(error.payload.host) {
          this.get("notify").error(error.payload.host[0], ENV.notifications)
        }
        if(error.payload.port) {
          this.get("notify").error(error.payload.port[0], ENV.notifications)
        }
      }
    }
  }),

  count: 0,
  totalCount: 0,

  tStartingScan: t("startingScan"),
  createDynamicScan: task(function *(isApiScanEnabled){
    let file = this.get('file');
    yield file.createDynamicScan(isApiScanEnabled);
  }),
  getCurrentDynamicScan: task(function *(){
    let file = this.get('file')
    return yield file.currentDynamicScan();
  }),
  setAPIScanOption: task(function *(isApiScanEnabled){
    const tStartingScan = this.get("tStartingScan");
    let currentDynamicScan = null;
    try{
      yield this.get('createDynamicScan').perform(isApiScanEnabled);
      try{
        currentDynamicScan = yield this.get('getCurrentDynamicScan').perform();
        yield this.set('currentDynamicScan', currentDynamicScan)
      }catch(error){
        yield this.set('currentDynamicScan', currentDynamicScan)
      }
      this.set('currentDynamicScan', currentDynamicScan)
      this.get('realtime').incrementProperty('dynamicScanCount');
      this.get("notify").success(tStartingScan);
      if(!this.isDestroyed) {
        this.send("closeModal");
        this.set("startingDynamicScan", false);
        getOwner(this).lookup('route:authenticated').transitionTo("authenticated.file.dynamicscandetail", currentDynamicScan.id);
      }
    }catch(error){
      this.set("startingDynamicScan", false);
      this.get("notify").error(error.payload.error);
    }
  }),
  closeCapturedApiModal: task(function * (){
    yield this.set('showCapturedApiModal', false)
  }),
  setCpaturedAPIScanOption: task(function *() {

    const file = this.get('file');
    const fileId = file.id;
    const dynamicUrl = [ENV.endpoints.files, fileId,ENV.endpoints.capturedApiScanStart].join('/');
    return yield this.get("ajax").post(dynamicUrl,{namespace: ENV.namespace_v2})
  }),

  countCapturedAPI: task(function * (){
    let data = {fileId: this.get('file.id'), should_process:true};
    const url = [ENV.endpoints.files, this.get('file.id'), "capturedapis"].join('/');
    return yield this.get("ajax").request(url,{namespace: ENV.namespace_v2, data});

  }),
  countTotalCapturedAPI: task(function * (){
    let data = {fileId: this.get('file.id')};
    const url = [ENV.endpoints.files, this.get('file.id'), "capturedapis"].join('/');
    return yield this.get("ajax").request(url,{namespace: ENV.namespace_v2, data});

  }),
  runCapturedAPIScan: task(function * () {
    try{
      yield this.get('setCpaturedAPIScanOption').perform()
      yield this.get("notify").success("Starting captured API Scan");
      if(!this.isDestroyed) {
        this.set('showCapturedApiModal', false)
      }
    }catch(error){
        this.get("notify").error(error.toString());
    }
  }),
  openCapturedApiModal: task(function * (){
    try{
      let filterCapturedAPIData = yield this.get('countCapturedAPI').perform();
      yield this.set('count', filterCapturedAPIData.count);
      let totalCapturedAPIData = yield this.get('countTotalCapturedAPI').perform();
      yield this.set('totalCount', totalCapturedAPIData.count);
      yield this.set('showCapturedApiModal', true);
    }catch(error){
      this.notify(error.toString())
    }
  }),
  doNotRunAPIScan: task(function *(){
    triggerAnalytics('feature', ENV.csb.runDynamicScan);
    yield this.set("isApiScanEnabled", false);
    yield this.set("startingDynamicScan", true);
    yield this.get('setAPIScanOption').perform();
  }),
  runAPIScan: task(function  *(){
    triggerAnalytics('feature', ENV.csb.runAPIScan);
    this.set("startingDynamicScan", true);
    this.set("isApiScanEnabled", true);
    yield this.get('setAPIScanOption').perform(true);
  }),
  actions: {

    showURLFilter(param){
      this.set("showAPIURLFilterScanModal", true);
      if (param === 'api') {
        this.set("showAPIScanModal", false);
        this.set("apiScanModal", true);
        this.set("dynamicScanModal", false);
      }
      if (param === 'dynamic') {
        this.set("showRunDynamicScanModal", false);
        this.set("dynamicScanModal", true);
        this.set("apiScanModal", false);
      }
    },



    goBack() {
      this.set("showAPIURLFilterScanModal", false);
      if (this.get("apiScanModal")) {
        this.set("showAPIScanModal", true);
      }
      if (this.get("dynamicScanModal")) {
        this.set("showRunDynamicScanModal", true);
      }
    },

    closeModal() {
      this.set("showAPIScanModal", false);
      this.set("showAPIURLFilterScanModal", false);
      this.set("showRunDynamicScanModal", false);
    },

    openRunDynamicScanModal() {
      this.set("showRunDynamicScanModal", true);
    },

    closeRunDynamicScanModal() {
      this.set("showRunDynamicScanModal", false);
    },

    dynamicShutdown() {
      const currentDynamicScan = this.get('currentDynamicScan')
      this.set("isPoppedOut", false);
      const dynamicUrl = [ENV.endpoints.dynamicscans, currentDynamicScan.id].join('/');
      this.get("ajax").delete(dynamicUrl)
      .then(() => {
        if(!this.isDestroyed) {
          this.set("startingDynamicScan", false);
        }
      },(error) => {
        this.set("startingDynamicScan", false);
        this.get("notify").error(error.payload.error);
      });
    },

  }
});
