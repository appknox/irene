import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { useEffect, withEffects } from 'irene/decorators/use-effect';
import { service } from '@ember/service';
import FileModel from 'irene/models/file';

@withEffects
export default class UseEffectPocDecoratorEffectsExampleComponent extends Component {
  @service('browser/document') declare document: Document;

  @tracked count = 0;
  @tracked name = 'John';
  @tracked doNameEffectAsync = false;
  @tracked file: FileModel = new FileModel();

  @useEffect([])
  setupOnceEffect() {
    console.log('🔄 [Decorator] Setup effect - runs only once on mount');

    return (): void => {
      console.log('🧹 [Decorator] Cleanup setup effect');
    };
  }

  @useEffect(['count'])
  countEffectImplementation() {
    console.log('🔄 [Decorator] Count changed:', this.count);
    const element = this.document.getElementById('decorator-count-display');

    if (element) {
      element.style.backgroundColor =
        this.count % 2 === 0 ? '#e3f2fd' : '#fff3e0';
    }

    return (): void => {
      console.log('🧹 [Decorator] Cleaning up count effect');

      const element = this.document.getElementById('decorator-count-display');

      if (element) {
        element.style.backgroundColor = '';
      }
    };
  }

  @useEffect(['name'])
  nameEffectImplementation() {
    console.log('🔄 [Decorator] Name changed to:', this.name);

    return (): void => {
      console.log('🧹 [Decorator] Cleaning up name effect');
    };
  }

  @useEffect(['doNameEffectAsync'])
  async nameEffectImplementationAsync() {
    await new Promise((resolve) =>
      setTimeout(() => {
        this.name = 'Jane';
        resolve(true);
      }, 3000)
    );

    console.log('🔄 [Decorator] Name changed to:', this.name, 'after 3 second');

    return (): void => {
      this.doNameEffectAsync = false;
    };
  }

  @action
  triggerNameEffectAsync() {
    this.doNameEffectAsync = true;
  }

  // Actions
  @action
  incrementCount(): void {
    this.count++;
  }

  @action
  changeName(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.name = target.value;
  }

  @action
  resetState(): void {
    this.count = 0;
    this.name = 'John';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UseEffectPoc::DecoratorEffectsExample': typeof UseEffectPocDecoratorEffectsExampleComponent;
  }
}
