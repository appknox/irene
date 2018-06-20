import Ember from 'ember';
import ENV from 'irene/config/environment';

const localeStrings = {
  "en": "English",
  "ja": "日本語"
};

const getLocaleString = locale=> localeStrings[locale];

const SelectLanguageComponent = Ember.Component.extend({

  classNames: ["control"],
  isSelectingLanguage: false,
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  moment: Ember.inject.service(),

  currentLocale: ( function() {
    const locale = this.get("i18n.locale");
    const localeString = getLocaleString(locale);
    return {locale, localeString};
  }).property("i18n.locale"),

  otherLocales: ( function() {
    const locales = [];
    let locale = this.get("i18n.locale");
    const otherLocales = this.get("i18n.locales").slice();
    otherLocales.removeObject(locale);
    for (locale of otherLocales) {
      const localeString = getLocaleString(locale);
      locales.push({locale, localeString});
    }
    return locales;
  }).property("i18n.locale"),

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
