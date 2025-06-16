import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class UseEffectPocModifierEffectsExampleComponent extends Component {
  @service('browser/document') declare document: Document;
  @service('browser/window') declare window: Window;

  @tracked count = 0;
  @tracked name = 'John';
  @tracked data: { message: string } | null = null;

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
    this.data = null;
  }

  @action
  documentTitleEffect(): (() => void) | void {
    console.log('🔄 [Modifier] Setting document title...');
    const originalTitle = this.document.title;
    this.document.title = `Count: ${this.count} - ${this.name}`;

    // Return cleanup function
    return (): void => {
      console.log('🧹 [Modifier] Cleaning up document title effect');
      this.document.title = originalTitle;
    };
  }

  @action
  async fetchDataEffect(): Promise<(() => void) | void> {
    console.log('🔄 [Modifier] Fetching data for:', this.name);

    const controller = new AbortController();

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!controller.signal.aborted) {
        this.data = { message: `Data for ${this.name} loaded!` };
        console.log('✅ [Modifier] Data fetched successfully');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('❌ [Modifier] Fetch failed:', error);
      }
    }

    // Cleanup function to abort request
    return (): void => {
      console.log('🧹 [Modifier] Aborting fetch request');
      controller.abort();
    };
  }

  @action
  setupGlobalListenersEffect(): (() => void) | void {
    console.log('🔄 [Modifier] Setting up global listeners');

    const handleResize = (): void => {
      console.log(
        '📏 [Modifier] Window resized:',
        this.window.innerWidth,
        'x',
        this.window.innerHeight
      );
    };

    const handleKeyPress = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        console.log('⌨️ [Modifier] Escape key pressed');
      }
    };

    this.window.addEventListener('resize', handleResize);
    this.document.addEventListener('keydown', handleKeyPress);

    return (): void => {
      console.log('🧹 [Modifier] Removing global listeners');
      this.window.removeEventListener('resize', handleResize);
      this.document.removeEventListener('keydown', handleKeyPress);
    };
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UseEffectPoc::ModifierEffectsExample': typeof UseEffectPocModifierEffectsExampleComponent;
  }
}
