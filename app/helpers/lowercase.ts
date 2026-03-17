import { helper } from '@ember/component/helper';

export default helper(function lowercase([str]: [string]) {
  return (str ?? '').toLowerCase().replace(/_/g, '-');
});

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    lowercase: typeof import('./lowercase').default;
  }
}
