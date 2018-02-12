/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';
import ENV from 'irene/config/environment';

const localeStrings = {
  "en": "English",
  "ja": "日本語"
};

const getLocaleString = locale=> localeStrings[locale];

const SelectLanguageComponent = Ember.Component.extend({

  classNames: ["control"],

  i18n: Ember.inject.service(),
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
    for (locale of Array.from(otherLocales)) {
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
      const that = this;
      return this.get("ajax").post(ENV.endpoints.lang, {data})
      .then(() => window.location.reload()).catch(error =>
        (() => {
          const result = [];
          for (error of Array.from(error.errors)) {
            result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
          }
          return result;
        })()
      );
    }
  }
});

export default SelectLanguageComponent;
