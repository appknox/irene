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

// Currently available translations in Irene
const MESSAGES_MAP = { en: EN_TRANSLATIONS, ja: JA_TRANSLATIONS };

/**
 * Retrieves the value of a message using the provided key.
 * @param {NestedKeyOf<typeof EN_TRANSLATIONS>} key - The key to retrieve the message value.
 * @returns {string} The value of the message corresponding to the key.
 */
function getMessageFromTranslations(
  key: NestedKeyOf<typeof EN_TRANSLATIONS>,
  locale?: keyof typeof MESSAGES_MAP
): string {
  return key.split('.').reduce(
    (p: Record<string, string | object> | string, c) => {
      if (typeof p === 'object' && c in p) {
        return p[c] as string;
      }

      return c;
    },
    MESSAGES_MAP[locale || 'en']
  ) as string;
}

/**
 * Translates a message using the provided key, substitutes variables, and formats it based on locale.
 * @param {NestedKeyOf<typeof EN_TRANSLATIONS>} key - The key to retrieve the message value.
 * @param {Record<string, string | number>} [variables] - Optional variables to substitute in the message.
 * @param {keyof typeof MESSAGES_MAP} [locale] - Optional locale to format the message. Defaults to 'en' if not provided.
 * @returns {string} The translated and formatted message.
 */
function cyTranslate(
  // Since all object shapes are the same, EN_TRANSLATIONS can represent all translation objects
  key: NestedKeyOf<typeof EN_TRANSLATIONS>,
  variables?: Record<string, string | number>,
  locale?: keyof typeof MESSAGES_MAP
): string {
  const message = getMessageFromTranslations(key, locale);

  return new IntlMessageFormat(message).format(variables) as string;
}

export default cyTranslate;
