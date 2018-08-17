// jshint ignore: start
import Ember from 'ember';
import ENV from 'irene/config/environment';
import PaginateMixin from 'irene/mixins/paginate';
import { translationMacro as t } from 'ember-i18n';

const isEmpty = inputValue=> Ember.isEmpty(inputValue);

const PersonaltokenListComponent = Ember.Component.extend(PaginateMixin, {

  classNames: ["column","personal-token-component"],
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),


  // list tokens

  targetObject: 'personaltoken',
  sortProperties: ['created:desc'],


  // create token

  tokenName: '',
  isGeneratingToken: false,
  tEnterTokenName: t('enterTokenName'),
  tTokenCreated: t('personalTokenGenerated'),

  actions: {
    openGenerateTokenModal() {
      this.set('showGenerateTokenModal', true);
    },

    generateToken() {
      const tokenName = this.get('tokenName');
      const tTokenCreated = this.get('tTokenCreated');
      const tEnterTokenName = this.get('tEnterTokenName');

      for (let inputValue of [tokenName]) {
        if (isEmpty(inputValue)) { return this.get('notify').error(tEnterTokenName); }
      }

      const data =
        {name: tokenName};

      this.set('isGeneratingToken', true);
      this.get('ajax').post(ENV.endpoints.personaltokens, {data})
      .then((data) => {
        if(!this.isDestroyed) {
          this.set('isGeneratingToken', false);
          this.store.pushPayload(data);
          this.incrementProperty("version");
          this.set('tokenName', '');
          this.set('showGenerateTokenModal', false);
        }
        this.get('notify').success(tTokenCreated);
      }, (error) => {
        if(!this.isDestroyed) {
          this.set('isGeneratingToken', false);
          this.get("notify").error(error.payload.message);
        }
      });
    }
  },


  // copy token

  tTokenCopied: t('tokenCopied'),
  tPleaseTryAgain: t('pleaseTryAgain'),

  didInsertElement() {
    const tTokenCopied = this.get('tTokenCopied');
    const tPleaseTryAgain = this.get('tPleaseTryAgain');
    // eslint-disable-next-line no-undef
    const clipboard = new Clipboard('.copy-token');
    this.set('clipboard', clipboard);

    clipboard.on('success', (e) => {
      this.get('notify').info(tTokenCopied);
      e.clearSelection();
    });
    clipboard.on('error', () => this.get('notify').error(tPleaseTryAgain));
  },

  willDestroyElement() {
    const clipboard = this.get('clipboard');
    clipboard.destroy();
  }
}
);


export default PersonaltokenListComponent;
