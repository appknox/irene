import Component from '@ember/component';
import {
  inject as service
} from '@ember/service';
import {
  isEmpty
} from '@ember/utils';
import ENV from 'irene/config/environment';
import PaginateMixin from 'irene/mixins/paginate';
import {
  t
} from 'ember-intl';
import ClipboardJS from 'clipboard/src/clipboard';

const PersonaltokenListComponent = Component.extend(PaginateMixin, {

  classNames: ["column", "personal-token-component"],
  intl: service(),
  ajax: service(),
  notify: service('notifications'),


  // list tokens

  targetModel: 'personaltoken',
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
        if (isEmpty(inputValue)) {
          return this.get('notify').error(tEnterTokenName);
        }
      }

      const data = {
        name: tokenName
      };

      this.set('isGeneratingToken', true);
      this.get('ajax').post(ENV.endpoints.personaltokens, {
          data
        })
        .then((data) => {
          if (!this.isDestroyed) {
            this.set('isGeneratingToken', false);
            this.store.pushPayload(data);
            this.incrementProperty("version");
            this.set('tokenName', '');
            this.set('showGenerateTokenModal', false);
          }
          this.get('notify').success(tTokenCreated);
        }, (error) => {
          if (!this.isDestroyed) {
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
this._super(...arguments);
    const tTokenCopied = this.get('tTokenCopied');
    const tPleaseTryAgain = this.get('tPleaseTryAgain');
    // eslint-disable-next-line no-undef
    const clipboard = new ClipboardJS('.copy-token');
    this.set('clipboard', clipboard);

    clipboard.on('success', (e) => {
      this.get('notify').info(tTokenCopied);
      e.clearSelection();
    });
    clipboard.on('error', () => this.get('notify').error(tPleaseTryAgain));
  },

  willDestroyElement() {
this._super(...arguments);
    const clipboard = this.get('clipboard');
    clipboard.destroy();
  }
});


export default PersonaltokenListComponent;
