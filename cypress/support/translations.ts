import EN_TRANSLATIONS from 'irene/translations/en.json';
import JA_TRANSLATIONS from 'irene/translations/ja.json';

import IntlMessageFormat from 'intl-messageformat';

// Get typing for nested keys in translation objects
// SRC: https://medium.com/xgeeks/typescript-utility-keyof-nested-object-fa3e457ef2b2
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : Key;
}[keyof ObjectType & (string | number)];

export class CypressTranslations {
  messages: Record<string, string | object>;
  locale: 'en' | 'ja';

  constructor(locale?: 'en' | 'ja') {
    const messages = { en: EN_TRANSLATIONS, ja: JA_TRANSLATIONS };
    const localeMsgs = messages[locale || 'en'];

    this.locale = locale || 'en';
    this.messages = localeMsgs;
  }

  private getMessageValue(key: NestedKeyOf<typeof EN_TRANSLATIONS>) {
    return key.split('.').reduce((p, c) => p && p[c], this.messages);
  }

  translate(
    // Since all object shapes are the same, EN_TRANSLATIONS can represent all translation objects
    key: NestedKeyOf<typeof EN_TRANSLATIONS>,
    variables?: Record<string, string>
  ) {
    const message = this.getMessageValue(key);

    return new IntlMessageFormat(message, this.locale).format(
      variables
    ) as string;
  }

  winTranslate(
    key: NestedKeyOf<typeof EN_TRANSLATIONS>,
    variables?: Record<string, string>
  ) {
    return cy.window().its('intl').invoke('t', key, variables);
  }
}

const CT = new CypressTranslations('en');

export default CT;
