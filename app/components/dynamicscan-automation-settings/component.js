import Component from '@glimmer/component';
import {
  inject as service
} from '@ember/service';
import {
  action,
  set
} from '@ember/object';
import {
  tracked
} from '@glimmer/tracking';
import {
  task
} from 'ember-concurrency';
import ENV from 'irene/config/environment';


export default class DyanmicscanAutomationSettingsComponent extends Component {
  @service store;
  @service intl;
  @service ajax;
  @service('notifications') notify;

  @tracked project = null;
  @tracked profileId = null;
  @tracked automationScripts = null;
  @tracked appiumEnabled = false;

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
    set(this, 'appiumEnabled', res.dynamicscanMode === "Appium");
    return res.dynamicscanMode;
  })
  getDynamicscanMode;

  @task(function* () {
    const profileId = this.args.profileId;
    set(this, 'appiumEnabled', !this.appiumEnabled);
    const dynamicscanMode = [ENV.endpoints.profiles, profileId, ENV.endpoints.dynamicscanMode].join('/');
    const data = {
      dynamicscan_mode: this.appiumEnabled ? "Appium" : "Manual"
    };
    yield this.ajax.put(dynamicscanMode, {data})
    .then(() => {
      if (this.appiumEnabled) {
        this.notify.success("Scheduled dynamic scan automation turned ON");
      } else {
        this.notify.success("Scheduled dynamic scan automation turned OFF");
      }
    }, () => {
      set(this, 'appiumEnabled', !this.appiumEnabled);
      this.notify.error("Something went wrong, couldn't save");
    });
  })
  toggleDynamicscanMode

  @task(function * (file) {
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

      this.notify.success("File Uploaded Successfully");

      this.getAutomationScripts.perform();
    } catch(error) {
      this.notify.error("Something went wrong, upload failed");
      return;
    }
  })
  uploadFile

  @action
  uploadFileWrapper(file) {
    this.uploadFile.perform(file);
  }
}
