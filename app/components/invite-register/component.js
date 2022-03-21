/* eslint-disable prettier/prettier */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';
import InviteRegisterValidation from '../../validations/invite-register';
import SSOInviteRegisterValidation from '../../validations/sso-invite-register';

export default class InviteRegister extends Component {
  @service ajax;
  @service locationinfo;

  @tracked inviteRegisterPOJO = {};
  @tracked selectedCountryData;
  @tracked success = false;

  constructor() {
    super(...arguments);
    if (this.args.isSSOEnforced){
      this.changeset = new Changeset(
        this.inviteRegisterPOJO, lookupValidator(SSOInviteRegisterValidation), SSOInviteRegisterValidation
      );
    }else{
      this.changeset = new Changeset(
        this.inviteRegisterPOJO, lookupValidator(InviteRegisterValidation), InviteRegisterValidation
      );
    }
  }

  @task(function * (changeset){
    yield changeset.validate();
    if (changeset.get('isValid')) {
      const username = changeset.get('username');
      const termsAccepted = changeset.get('termsAccepted');
      if (this.args.isSSOEnforced){
        yield this.registerWithServer.perform({
          'username': username,
          'terms_accepted': termsAccepted
        });
        return;
      }
      const firstname = changeset.get('firstname');
      const lastname = changeset.get('lastname');
      const password = changeset.get('password');
      const passwordConfirmation = changeset.get('passwordConfirmation');
      yield this.registerWithServer.perform({
        'first_name': firstname,
        'last_name': lastname,
        'username': username,
        'password': password,
        'confirm_password': passwordConfirmation,
        'terms_accepted': termsAccepted
      });
    }
  })
  registerTask;

  @task(function *(data) {
    const token = this.args.token;
    const url = [ENV.endpoints.invite, token].join('/')
    try {
      yield this.ajax.request(url, {
        method: 'POST',
        data: data
      });
      this.success = true;
    } catch(errors) {
      const changeset = this.changeset;
      Object.keys(errors.payload).forEach(key => {
        changeset.addError(key, errors.payload[key]);
      });
    }
  })
  registerWithServer;

  @action register(changeset) {
    this.registerTask.perform(changeset);
  }

  @action async geoIpLookupFunc(callback) {
    const country = await this.locationinfo.getCountry();
    callback(country);
    return country;
  }
}
