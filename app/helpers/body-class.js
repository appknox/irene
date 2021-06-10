import { inject as service } from '@ember/service';
import Helper from '@ember/component/helper';
import { guidFor } from '@ember/object/internals';
import { assign } from '@ember/polyfills';

export default class BodyClass extends Helper {
  @service('body-class') tokens;

  // https://github.com/ember-cli/ember-page-title/blob/a886af4d83c7a3a3c716372e8a322258a4f92991/addon/helpers/page-title.js#L16
  get tokenId() {
    return guidFor(this);
  }

  constructor() {
    super(...arguments);
    this.tokens.push({ id: this.tokenId });
  }

  compute(params, _hash) {
    let hash = assign({}, _hash, {
      id: this.tokenId,
      clazzes: params.join(''),
    });

    this.tokens.push(hash);
    this.tokens.scheduleUpdate();
    return '';
  }

  willDestroy() {
    super.willDestroy();
    this.tokens.remove(this.tokenId);
    this.tokens.scheduleUpdate();
  }
}
