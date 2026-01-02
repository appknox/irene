declare module '@ember-data/request-utils/string' {
  export function pluralize(word: string): string;
  export function singularize(word: string): string;
  export function irregular(singular: string, plural: string): void;
  export function uncountable(word: string): void;
}
