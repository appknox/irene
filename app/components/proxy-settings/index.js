import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, waitForProperty } from 'ember-concurrency';
import { t } from 'ember-intl';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';
import ENV from 'irene/config/environment';
import ProxySettingValidation from 'irene/validations/proxy-settings';
import triggerAnalytics from 'irene/utils/trigger-analytics';

export default class MyComponent extends Component {
  @service('notifications') notify;
  @service store;

  @tracked currentProxy = null;
  @tracked changeset = null;

  constructor() {
    super(...arguments);

    this.syncSettings.perform();
  }

  tProxySettingsSaved = t('proxySettingsSaved');
  tProxyTurned = t('proxyTurned');
  tOn = t('on');
  tOff = t('off');

  get proxyId() {
    return this.args.profile.id;
  }

  get hasProxyValues() {
    return !!this.changeset?.host && !!this.changeset?.port;
  }

  @task(function* () {
    try {
      yield waitForProperty(this, 'args.profile.id', (pid) => !!pid);
      const proxyId = this.proxyId;
      const record = yield this.store.findRecord('proxy-setting', proxyId);
      return record;
    } catch (e) {
      return;
    }
  })
  getCurrentProxy;

  @task(function* () {
    try {
      let currentProxy = yield this.getCurrentProxy.perform();
      const changeset = new Changeset(
        currentProxy,
        lookupValidator(ProxySettingValidation),
        ProxySettingValidation
      );
      this.currentProxy = currentProxy;
      this.changeset = changeset;
    } catch (e) {
      return;
    }
  })
  syncSettings;

  @task(function* () {
    try {
      const currentProxy = yield this.currentProxy;
      yield currentProxy.destroyRecord();
      yield currentProxy.unloadRecord();
      yield this.syncSettings.perform();
      return false;
    } catch (e) {
      return;
    }
  })
  clearProxy;

  @task(function* () {
    try {
      const changeset = this.changeset;
      yield changeset.validate();
      const isValid = changeset.isValid;
      if (!isValid) {
        if (!(changeset.host || changeset.port)) {
          return yield this.clearProxy.perform();
        }
        if (changeset.errors && changeset.errors[0].validation) {
          this.notify.error(
            changeset.errors[0].validation[0],
            ENV.notifications
          );
        }
        return false;
      }
      yield changeset.save();
      return true;
    } catch (e) {
      return;
    }
  })
  saveChanges;

  @task(function* () {
    try {
      const status = yield this.saveChanges.perform();
      if (status) {
        this.notify.success(this.tProxySettingsSaved);
        triggerAnalytics('feature', ENV.csb.changeProxySettings);
      }
    } catch (e) {
      return;
    }
  })
  saveProxy;

  @task(function* () {
    try {
      const changeset = this.changeset;
      let enabled = event.target.checked;
      changeset.enabled = enabled;
      const status = yield this.saveChanges.perform();
      const statusText = changeset.enabled ? this.tOn : this.tOff;
      if (status) {
        this.notify.info(this.tProxyTurned + statusText.toUpperCase());
        if (enabled) {
          triggerAnalytics('feature', ENV.csb.enableProxy);
        } else {
          triggerAnalytics('feature', ENV.csb.disableProxy);
        }
      } else {
        if (enabled) {
          this.notify.error(changeset.errors[0].validation[0]);
        }
        event.preventDefault();
      }
    } catch (e) {
      return;
    }
  })
  enableProxy;
}
