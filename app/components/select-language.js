import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ENV from 'irene/config/environment';

const localeStrings = {
  "en": "English",
  "ja": "日本語"
};

const getLocaleString = locale=> localeStrings[locale];

const SelectLanguageComponent = Component.extend({

  classNames: ["control"],
  isSelectingLanguage: false,
  i18n: service(),
  ajax: service(),
  moment: service(),

  currentLocale: computed("i18n.locale", function() {
    const locale = this.get("i18n.locale");
    const localeString = getLocaleString(locale);
    return {locale, localeString};
  }),

  otherLocales: computed("i18n.locale", function() {
    const locales = [];
    let locale = this.get("i18n.locale");
    const otherLocales = this.get("i18n.locales").slice();
    otherLocales.removeObject(locale);
    for (locale of otherLocales) {
      const localeString = getLocaleString(locale);
      locales.push({locale, localeString});
    }
    return locales;
  }),

  actions: {
    setLocale() {
      const lang = this.$('select').val();
      this.set('i18n.locale', lang);
      this.get('moment').changeLocale(lang);
      const data =
        {lang};
      this.set("isSelectingLanguage", true);
      this.get("ajax").post(ENV.endpoints.lang, {data})
      .then(() =>  {
        if(!this.isDestroyed) {
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
