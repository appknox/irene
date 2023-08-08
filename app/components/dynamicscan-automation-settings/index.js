/* eslint-disable prettier/prettier */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import {action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';


export default class DyanmicscanAutomationSettingsComponent extends Component {
  @service store;
  @service intl;
  @service ajax;
  @service('notifications') notify;

  @tracked project = null;
  @tracked profileId = null;
  @tracked automationScripts = null;
  @tracked automationEnabled = false;

  constructor() {
    super(...arguments);
    this.getAutomationScripts.perform();
    this.getDynamicscanMode.perform();
  }

  @task(function* () {
    const profileId = this.args.profileId;
    const automationScripts = yield this.store.query('automation_script', {profileId});
    set(this, 'automationScripts', automationScripts);
    return automationScripts;
  })
  getAutomationScripts;

  @task(function* () {
    const profileId = this.args.profileId;
    const res = yield this.store.queryRecord('dynamicscan_mode', {id: profileId});
    set(this, 'automationEnabled', res.dynamicscanMode === "Automated");
    return res.dynamicscanMode;
  })
  getDynamicscanMode;

  @task(function* () {
    const profileId = this.args.profileId;
    set(this, 'automationEnabled', !this.automationEnabled);
    const dynamicscanMode = [ENV.endpoints.profiles, profileId, ENV.endpoints.dynamicscanMode].join('/');
    const data = {
      dynamicscan_mode: this.automationEnabled ? "Automated" : "Manual"
    };
    yield this.ajax.put(dynamicscanMode, {data})
    .then(() => {
      if (this.automationEnabled) {
        this.notify.success(this.intl.t('appiumScheduledAutomationSuccessOn'));
      } else {
        this.notify.success(this.intl.t('appiumScheduledAutomationSuccessOff'));
      }
    }, () => {
      set(this, 'automationEnabled', !this.automationEnabled);
      this.notify.error(this.intl.t('somethingWentWrong'));
    });
  })
  toggleDynamicscanMode

  @task(function* (file) {
    try {
      const profileId = this.args.profileId;

      const urlGetSignedUrl = [ENV.endpoints.profiles, profileId, ENV.endpoints.uploadAutomationScriptSignedUrl].join('/');
      const signedUrlData = {
        file_name: file.blob.name
      };
      var signedUrlResponse = yield this.ajax.post(urlGetSignedUrl, {data: signedUrlData});

      yield file.uploadBinary(signedUrlResponse.url, {method: 'PUT'});

      const urlUploadScript= [ENV.endpoints.profiles, profileId, ENV.endpoints.uploadAutomationScript].join('/');
      const uploadAutomationScriptData = {
        file_key: signedUrlResponse.file_key,
        file_key_signed: signedUrlResponse.file_key_signed,
      };
      yield this.ajax.post(urlUploadScript, {data: uploadAutomationScriptData});

      this.notify.success(this.intl.t('appiumFileUploadedSuccessfully'));

      this.getAutomationScripts.perform();
    } catch(e) {
      let errMsg = this.intl.t('pleaseTryAgain');
      if (e.payload) {
        Object.keys(e.payload).forEach(p => {
          errMsg = e.payload[p]
          if (typeof(errMsg) !== "string") {
            errMsg = e.payload[p][0];
          }
          this.notify.error(errMsg);
        });
        return;
      } else if (e.errors && e.errors.length) {
        errMsg = e.errors[0].detail || errMsg;
      } else if(e.message) {
        errMsg = e.message;
      }
      this.notify.error(errMsg);
      return;
    }
  })
  uploadFile

  @action
  uploadFileWrapper(file) {
    this.uploadFile.perform(file);
  }
}
