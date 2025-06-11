import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { useEffect } from 'irene/helpers/use-effect-resource';

export default class UseEffectPocEffectLifecycleDemoComponent extends Component {
  @service('browser/document') declare document: Document;

  @tracked count = 0;
  @tracked name = 'John';
  @tracked searchQuery = '';
  @tracked userId = 1;
  @tracked userData: { id: number; name: string; email: string } | null = null;
  @tracked asyncTrigger = false;

  @tracked locale = 'en-US';

  // Runs when count changes
  titleEffect = useEffect(
    this,
    () => {
      console.log('🔄 [Resource] Count effect triggered for:', this.count);
      const element = this.document.getElementById('resource-count-display');

      if (element) {
        element.style.backgroundColor =
          this.count % 2 === 0 ? '#e8f5e8' : '#fff8e1';
      }

      return () => {
        console.log('🧹 [Resource] Cleaning up count effect');

        const element = this.document.getElementById('resource-count-display');

        if (element) {
          element.style.backgroundColor = '';
        }
      };
    },
    [() => this.count]
  );

  // Mount effect - runs once on component creation
  mountEffect = useEffect(
    this,
    () => {
      console.log('🔄 [Resource] Component mounted - setup effect runs once');

      return () => {
        console.log('🧹 [Resource] Component will unmount - cleanup');
      };
    },
    [] // Empty dependencies = run once
  );

  // Keyboard effect - setup once
  keyboardEffect = useEffect(
    this,
    () => {
      const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === ' ') {
          this.incrementCount();
        }
      };

      this.document.addEventListener('keypress', handleKeyPress);
      console.log(
        '⌨️ [Resource] Keyboard listener added (press space to increment)'
      );

      return () => {
        this.document.removeEventListener('keypress', handleKeyPress);
        console.log('⌨️ [Resource] Keyboard listener removed');
      };
    },
    []
  );

  // Name effect with debouncing
  nameEffect = useEffect(
    this,
    () => {
      console.log('📝 [Resource] Name effect triggered for:', this.name);
    },
    [() => this.name]
  );

  // Async effect triggered manually
  asyncNameEffect = useEffect(
    this,
    async () => {
      if (this.asyncTrigger) {
        console.log('🔄 [Resource] Starting async name change...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
        this.name = 'Jane (Async)';
        console.log('✅ [Resource] Async name change completed');

        return () => {
          this.asyncTrigger = false;
          console.log('🧹 [Resource] Async effect cleanup');
        };
      }
    },
    [() => this.asyncTrigger]
  );

  // Actions
  @action
  incrementCount() {
    this.count++;
  }

  @action
  changeName(event: Event) {
    const target = event.target as HTMLInputElement;
    this.name = target.value;
  }

  @action
  updateSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
  }

  @action
  changeUser() {
    this.userId = this.userId === 1 ? 2 : this.userId === 2 ? 3 : 1;
  }

  @action
  triggerAsyncNameEffect() {
    this.asyncTrigger = true;
  }

  @action
  resetState() {
    this.count = 0;
    this.name = 'John';
    this.searchQuery = '';
    this.userId = 1;
    this.userData = null;
    this.asyncTrigger = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UseEffectPoc::EffectLifecycleDemo': typeof UseEffectPocEffectLifecycleDemoComponent;
  }
}
