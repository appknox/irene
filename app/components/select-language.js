/* eslint-disable ember/no-classic-components, prettier/prettier, ember/no-classic-classes, ember/require-tagless-components, ember/no-get, ember/no-actions-hash, ember/no-jquery */
import Component from '@ember/component';
import {
  inject as service
} from '@ember/service';
import {
  computed
} from '@ember/object';
import ENV from 'irene/config/environment';

const localeStrings = {
  "en": "English",
  "ja": "日本語"
};

const getLocaleString = locale => localeStrings[locale];

const SelectLanguageComponent = Component.extend({

  classNames: ["control"],
  isSelectingLanguage: false,
  intl: service(),
  ajax: service(),
  datetime: service(),

  currentLocale: computed("intl.locale", function () {
    const locale = this.get("intl.locale");
    const localeString = getLocaleString(locale);
    return {
      locale,
      localeString
    };
  }),

  otherLocales: computed('intl.{locale,locales}', function () {
    const locales = [];
    let locale = this.get("intl.locale");
    const otherLocales = this.get("intl.locales").slice();
    otherLocales.removeObjects(locale);
    for (locale of otherLocales) {
      const localeString = getLocaleString(locale);
      locales.push({
        locale,
        localeString
      });
    }
    return locales;
  }),

  actions: {
    setLocale() {
      const lang = this.$('select').val();
      this.set('intl.locale', lang);
      this.get('datetime').setLocale(lang);
      const data = {
        lang
      };
      this.set("isSelectingLanguage", true);
      this.get("ajax").post(ENV.endpoints.lang, {
          data
        })
        .then(() => {
          if (!this.isDestroyed) {
            window.location.reload();
          }
        }, (error) => {
          this.set("isSelectingLanguage", false);
          this.get("notify").error(error.payload.message);
        });
    }
  }
});

export default SelectLanguageComponent;
