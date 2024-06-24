import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import { action } from '@ember/object';

import ENV from 'irene/config/environment';
import DatetimeService from 'irene/services/datetime';

const localeStrings = {
  en: 'English',
  ja: '日本語',
};

type LocaleKeys = keyof typeof localeStrings;

export default class AccountSettingsGeneralSelectLanguageComponent extends Component {
  @service declare intl: IntlService;
  @service declare ajax: any;
  @service declare datetime: DatetimeService;
  @service('notifications') declare notify: NotificationService;

  get currentLocale() {
    return this.allLocales.find(
      ({ locale }) => locale === this.intl.locale.toString()
    );
  }

  get allLocales() {
    return this.intl.locales
      .map((locale) => ({
        locale,
        localeString: localeStrings[locale as LocaleKeys],
      }))
      .filter((f) => Boolean(f.localeString));
  }

  setLocale = task(async (selection) => {
    const lang = selection.locale;

    this.intl.locale = lang;

    this.datetime.setLocale(lang);

    const data = {
      lang,
    };

    try {
      await this.ajax.post(ENV.endpoints['lang'], { data });

      if (!this.isDestroyed) {
        window.location.reload();
      }
    } catch (err) {
      const error = err as AdapterError;
      this.notify.error(error.payload.message);
    }
  });

  @action
  handleLocaleChange(selection: { locale: string; localeString: string }) {
    this.setLocale.perform(selection);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::General::SelectLanguage': typeof AccountSettingsGeneralSelectLanguageComponent;
  }
}
