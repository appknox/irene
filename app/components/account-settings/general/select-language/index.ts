import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import type DatetimeService from 'irene/services/datetime';
import type IreneAjaxService from 'irene/services/ajax';
import { buildURLEncodedFormData, type AjaxError } from 'irene/services/ajax';

const localeStrings = {
  en: 'English',
  ja: '日本語',
};

type LocaleKeys = keyof typeof localeStrings;

export default class AccountSettingsGeneralSelectLanguageComponent extends Component {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare datetime: DatetimeService;
  @service declare session: any;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked userLangPref = 'en';

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.getUserLangPref.perform();
  }

  get currentLocale() {
    return this.allLocales.find(({ locale }) => locale === this.userLangPref);
  }

  get allLocales() {
    return this.intl.locales
      .map((locale) => ({
        locale,
        localeString: localeStrings[locale as LocaleKeys],
      }))
      .filter((f) => Boolean(f.localeString));
  }

  @action
  handleLocaleChange(selection: { locale: string; localeString: string }) {
    this.setLocale.perform(selection);
  }

  setLocale = task(async (selection) => {
    const lang = selection.locale;

    this.userLangPref = lang;

    this.intl.setLocale(lang);

    this.datetime.setLocale(lang);

    const data = {
      lang,
    };

    try {
      await this.ajax.post(ENV.endpoints['lang'] as string, {
        data: buildURLEncodedFormData(data),
        contentType: 'application/x-www-form-urlencoded',
      });

      if (!this.isDestroyed) {
        window.location.reload();
      }
    } catch (err) {
      const error = err as AjaxError;

      this.notify.error(error.payload.message);
    }
  });

  getUserLangPref = task(async () => {
    try {
      const userId = this.session.data.authenticated.user_id;

      const user = await this.store.findRecord('user', userId);

      this.userLangPref = user.lang;
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::General::SelectLanguage': typeof AccountSettingsGeneralSelectLanguageComponent;
  }
}
