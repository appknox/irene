import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';
import InviteOnlyRegisterValidation from '../../validations/register-invite';

export default Component.extend({
  token: null,
  session: service('session'),
  ajax: service('ajax'),
  inviteEndpoint: 'registration-via-invite',
  initialData: {},
  toBeSubmittedData: {},
  init() {
    this._super(...arguments);
    const toBeSubmittedData = this.get('toBeSubmittedData');
    const changeset = new Changeset(
      toBeSubmittedData, lookupValidator(InviteOnlyRegisterValidation), InviteOnlyRegisterValidation
    );
    this.set('changeset', changeset);
  },
  didInsertElement() {
    this.get('loadTokenData').perform();
  },
  loadTokenData: task(function * (){
    const url = this.get('inviteEndpoint') + '?token=' + this.get('token');
    const data = yield this.get('ajax').request(url, {
      namespace: 'api/v2'
    })
    this.set('initialData', data);
    return data;
  }),
  registerWithServer: task(function * (data) {
    const url = this.get('inviteEndpoint')
    try {
      const logininfo = yield this.get('ajax').post(url, {
        data: data,
        namespace: 'api/v2'
      })
      this.authenticate(logininfo);
    } catch(errors) {
      const changeset = this.get('changeset');
      Object.keys(errors.payload).forEach(key => {
        changeset.addError(key, errors.payload[key]);
      });
    }
  }),
  registerTask: task(function * (changeset){
    yield changeset.validate();
    if (changeset.get('isValid')) {
      const username = changeset.get('username');
      const password = changeset.get('password');
      const passwordConfirmation = changeset.get('passwordConfirmation');
      const termsAccepted = changeset.get('termsAccepted');
      const token = this.get('token');
      yield this.get('registerWithServer').perform({
        'token': token,
        'username': username,
        'password': password,
        'confirm_password': passwordConfirmation,
        'terms_accepted': termsAccepted
      });
    }
  }),
  authenticate(data) {
    this.get('session').authenticate("authenticator:login", data);
  },
  actions: {
    register(changeset) {
      this.get('registerTask').perform(changeset);
    }
  }
});
