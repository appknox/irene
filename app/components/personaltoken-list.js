/*
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 */
import Ember from 'ember';
import ENV from 'irene/config/environment';
import PaginateMixin from 'irene/mixins/paginate';
import { translationMacro as t } from 'ember-i18n';

const isEmpty = inputValue=> Ember.isEmpty(inputValue);

const PersonaltokenListComponent = Ember.Component.extend(PaginateMixin, {
  i18n: Ember.inject.service(),


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

      const that = this;
      const data =
        {name: tokenName};

      this.set('isGeneratingToken', true);
      this.get('ajax').post(ENV.endpoints.personaltokens, {data})
      .then(function(data){
        that.set('isGeneratingToken', false);
        that.store.pushPayload(data);
        that.incrementProperty("version");
        that.get('notify').success(tTokenCreated);
        that.set('tokenName', '');
        that.set('showGenerateTokenModal', false);
      })
      .catch(function(error) {
        that.set('isGeneratingToken', false);
        that.get("notify").error(error.payload.message);
      });
    }
  },


  // copy token

  tTokenCopied: t('tokenCopied'),
  tPleaseTryAgain: t('pleaseTryAgain'),

  didInsertElement() {
    const tTokenCopied = this.get('tTokenCopied');
    const tPleaseTryAgain = this.get('tPleaseTryAgain');

    const clipboard = new Clipboard('.copy-token');
    this.set('clipboard', clipboard);

    const that = this;

    clipboard.on('success', function(e) {
      that.get('notify').info(tTokenCopied);
      e.clearSelection();
    });
    clipboard.on('error', () => that.get('notify').error(tPleaseTryAgain));
  },

  willDestroyElement() {
    const clipboard = this.get('clipboard');
    clipboard.destroy();
  }
}
);


export default PersonaltokenListComponent;
