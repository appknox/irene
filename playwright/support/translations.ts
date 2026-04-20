import IntlMessageFormat from 'intl-messageformat';
import EN_TRANSLATIONS from '../../translations/en.json';

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : Key;
}[keyof ObjectType & (string | number)];

function getMessageFromTranslations(
  key: NestedKeyOf<typeof EN_TRANSLATIONS>
): string {
  return key
    .split('.')
    .reduce((p: Record<string, string | object> | string, c) => {
      if (typeof p === 'object' && c in p) {
        return p[c] as string;
      }
      return c;
    }, EN_TRANSLATIONS) as string;
}

function pwTranslate(
  key: NestedKeyOf<typeof EN_TRANSLATIONS>,
  variables?: Record<string, string | number>
): string {
  const message = getMessageFromTranslations(key);
  return new IntlMessageFormat(message).format(variables) as string;
}

export default pwTranslate;
