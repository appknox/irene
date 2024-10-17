import { inject as service } from '@ember/service';
import Helper from '@ember/component/helper';
import { guidFor } from '@ember/object/internals';

interface BodyClassToken {
  id: string;
  clazzes?: string;
}

interface BodyClassService {
  push(token: BodyClassToken): void;
  remove(id: string): void;
  scheduleUpdate(): void;
}

export default class BodyClassHelper extends Helper {
  @service('body-class') declare tokens: BodyClassService;

  /**
   * Get a unique identifier for this helper instance
   */
  get tokenId(): string {
    return guidFor(this);
  }

  constructor(properties?: object) {
    super(properties);

    this.tokens.push({ id: this.tokenId });
  }

  /**
   * Compute the body class
   * @param params - The class names as an array of strings
   * @returns An empty string
   */
  compute(params: string[]): string {
    const token: BodyClassToken = {
      id: this.tokenId,
      clazzes: params.join(''),
    };

    this.tokens.push(token);
    this.tokens.scheduleUpdate();

    return '';
  }

  /**
   * Clean up when the helper is about to be destroyed
   */
  willDestroy(): void {
    super.willDestroy();

    this.tokens.remove(this.tokenId);
    this.tokens.scheduleUpdate();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'body-class': typeof BodyClassHelper;
  }
}
