import Service, { service } from '@ember/service';
import { scheduleTask } from 'ember-lifeline';

interface BodyClassToken {
  id: string;
  clazzes?: string;
  classList?: string[];
}

export default class BodyClassService extends Service {
  // https://github.com/ember-cli/ember-page-title/blob/a886af4d83c7a3a3c716372e8a322258a4f92991/addon/services/page-title-list.js#L27
  // in fastboot context "document" is instance of
  // ember-fastboot/simple-dom document
  @service('-document') declare document: Document;

  tokens: BodyClassToken[] = [];
  previousClasses: string[] = [];

  _updateClass() {
    if (!this.document) {
      return;
    }

    const body = this.document.body;
    body.classList.remove(...this.previousClasses);

    const newclasses = this.classes as string[];
    body.classList.add(...newclasses);

    this.previousClasses = newclasses;
  }

  _findTokenById(id: string) {
    return this.tokens.filter((token) => {
      return token.id === id;
    })[0];
  }

  get classes() {
    // flatMap to classList
    return this.tokens
      .map((_) => _.classList)
      .reduce((a, b) => [...(a as string[]), ...(b as string[])], []);
  }

  push(token: BodyClassToken) {
    this.applyTokenDefaults(token);
    this.updateClasses(token);

    const tokenForId = this._findTokenById(token.id);

    if (tokenForId) {
      const index = this.tokens.indexOf(tokenForId);
      const tokens = [...this.tokens];
      tokens.splice(index, 1, token);

      this.tokens = tokens;

      return;
    }

    this.tokens = [...this.tokens, token];
  }

  remove(id: string) {
    const token = this._findTokenById(id);

    if (!token) {
      return;
    }

    const tokens = [...this.tokens];
    tokens.splice(tokens.indexOf(token), 1);

    this.tokens = tokens;
  }

  scheduleUpdate() {
    scheduleTask(this, 'render', () => this._updateClass());
  }

  applyTokenDefaults(token: BodyClassToken) {
    if (token.clazzes == null) {
      token.clazzes = '';
    }

    if (token.classList == null) {
      token.classList = [];
    }
  }

  updateClasses(token: BodyClassToken) {
    const classList = token.clazzes?.split(' ');
    token.classList = classList?.filter((_) => _);
  }
}
