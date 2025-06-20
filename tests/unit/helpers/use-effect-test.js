import Component from '@glimmer/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { destroy } from '@ember/destroyable';
import { setComponentTemplate } from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';
import { click, fillIn, render, triggerEvent } from '@ember/test-helpers';

import { useEffect } from 'irene/helpers/use-effect';

module('Unit | Helper | use-effect', function (hooks) {
  setupRenderingTest(hooks);

  test('runs effect on first render with no dependencies', async function (assert) {
    let effectCallCount = 0;

    class TestComponent extends Component {
      result = useEffect(this, {
        effect: () => {
          effectCallCount++;
          return { returnValue: 'initial' };
        },
        dependencies: {},
      });
    }

    setComponentTemplate(
      hbs`<div data-test-effect-result>{{this.result}}</div>`,
      TestComponent
    );

    this.owner.register('component:test-component', TestComponent);

    await render(hbs`<TestComponent />`);

    assert.strictEqual(
      effectCallCount,
      1,
      'effect runs once on initialization'
    );
  });

  test('runs effect when dependencies change', async function (assert) {
    let effectCallCount = 0;
    let lastDeps = [];
    const getReturnValue = (deps) => `count: ${deps[0]}, name: ${deps[1]}`;

    class TestComponent extends Component {
      @tracked count = 0;
      @tracked name = 'test';

      result = useEffect(this, {
        effect: (deps) => {
          effectCallCount++;
          lastDeps = deps;

          return { returnValue: getReturnValue(deps) };
        },
        dependencies: {
          count: () => this.count,
          name: () => this.name,
        },
      });

      @action
      incrementCount() {
        this.count++;
      }

      @action
      updateName(event) {
        this.name = event.target.value;
      }
    }

    setComponentTemplate(
      hbs`
          <div data-test-effect-result>{{this.result}}</div>
          <div data-test-count>{{this.count}}</div>
          <div data-test-name>{{this.name}}</div>

          <button type="button" data-test-increment-btn {{on "click" this.incrementCount}}>Increment</button>
          <input aria-label="name input" data-test-name-input value={{this.name}} {{on "input" this.updateName}} />
        `,
      TestComponent
    );

    this.owner.register('component:test-component-deps', TestComponent);

    await render(hbs`<TestComponentDeps />`);

    assert.strictEqual(effectCallCount, 1, 'effect runs once initially');
    assert.deepEqual(lastDeps, [0, 'test'], 'receives initial dependencies');

    assert.dom('[data-test-effect-result]').hasText(getReturnValue(lastDeps));

    await click('[data-test-increment-btn]');

    assert.strictEqual(
      effectCallCount,
      2,
      'effect runs again when dependencies change'
    );

    assert.deepEqual(lastDeps, [1, 'test'], 'receives updated dependencies');

    assert.dom('[data-test-effect-result]').hasText(getReturnValue(lastDeps));

    await fillIn('[data-test-name-input]', 'test2');
    await triggerEvent('[data-test-name-input]', 'keyup');

    assert.strictEqual(
      effectCallCount,
      3,
      'effect runs again when dependencies change'
    );

    assert.deepEqual(lastDeps, [1, 'test2'], 'receives updated dependencies');

    assert.dom('[data-test-effect-result]').hasText(getReturnValue(lastDeps));
  });

  test('does not run effect when dependencies remain the same', async function (assert) {
    let effectCallCount = 0;

    class TestComponent extends Component {
      @tracked count = 0;
      someConstant = 'constant';

      result = useEffect(this, {
        effect: () => {
          effectCallCount++;
          return { returnValue: effectCallCount };
        },
        dependencies: {
          count: () => this.count,
          constant: () => this.someConstant,
        },
      });

      @action
      setSameCount() {
        this.count = 0; // Same value
      }
    }

    setComponentTemplate(
      hbs`
          <div data-test-effect-result>{{this.result}}</div>
          <div data-test-constant>{{this.someConstant}}</div>
          <div data-test-count>{{this.count}}</div>

          <button type="button" data-test-same-count-btn {{on "click" this.setSameCount}}>Set Same Count</button>
        `,
      TestComponent
    );

    this.owner.register('component:test-component-same-deps', TestComponent);

    await render(hbs`<TestComponentSameDeps />`);

    assert.strictEqual(effectCallCount, 1, 'effect runs once initially');

    await click('[data-test-same-count-btn]');

    assert.strictEqual(
      effectCallCount,
      1,
      'effect does not run when dependencies remain the same'
    );

    assert.dom('[data-test-effect-result]').hasText(`${effectCallCount}`);
  });

  test('handles cleanup function', async function (assert) {
    let cleanupCallCount = 0;
    let shouldCleanup = true;

    class TestComponent extends Component {
      @tracked active = true;

      result = useEffect(this, {
        effect: () => {
          return {
            cleanup: () => cleanupCallCount++,
            shouldRunCleanup: () => shouldCleanup,
            returnValue: 'test',
          };
        },
        dependencies: {
          active: () => this.active,
        },
      });

      @action
      toggleActive() {
        this.active = !this.active;
      }
    }

    setComponentTemplate(
      hbs`
          <div data-test-effect-result>{{this.result}}</div>
          <div data-test-active>{{this.active}}</div>

          <button type="button" data-test-toggle-btn {{on "click" this.toggleActive}}>Toggle Active</button>
        `,
      TestComponent
    );

    this.owner.register('component:test-component-cleanup', TestComponent);

    await render(hbs`<TestComponentCleanup />`);

    assert.strictEqual(cleanupCallCount, 0, 'cleanup not called initially');

    await click('[data-test-toggle-btn]');

    assert.strictEqual(cleanupCallCount, 1, 'cleanup called on destroy');

    await click('[data-test-toggle-btn]');

    assert.strictEqual(cleanupCallCount, 2, 'cleanup called on destroy');
  });

  test('respects shouldRunCleanup condition except on destroy', async function (assert) {
    let cleanupCallCount = 0;
    let shouldCleanup = false;

    class TestComponent extends Component {
      @tracked counter = 0;

      result = useEffect(this, {
        effect: () => {
          return {
            cleanup: () => cleanupCallCount++,
            shouldRunCleanup: () => shouldCleanup,
            returnValue: this.counter,
          };
        },
        dependencies: {
          counter: () => this.counter,
        },
      });

      @action
      incrementCounter() {
        this.counter++;
      }
    }

    setComponentTemplate(
      hbs`
          <div data-test-effect-result>{{this.result}}</div>
          <div data-test-counter>{{this.counter}}</div>

          <button type="button" data-test-increment-counter-btn {{on "click" this.incrementCounter}}>Increment Counter</button>
        `,
      TestComponent
    );

    this.owner.register(
      'component:test-component-should-cleanup',
      TestComponent
    );

    await render(hbs`<TestComponentShouldCleanup />`);

    assert.strictEqual(cleanupCallCount, 0, 'cleanup not called initially');

    await click('[data-test-increment-counter-btn]');

    assert.strictEqual(cleanupCallCount, 0, 'cleanup not called');

    await click('[data-test-increment-counter-btn]');

    assert.strictEqual(cleanupCallCount, 0, 'cleanup not called');

    await destroy(this.owner);

    assert.strictEqual(
      cleanupCallCount,
      1,
      'cleanup called on destroy. dishonors shouldRunCleanup'
    );
  });

  test('works with DOM node dependencies', async function (assert) {
    let effectCallCount = 0;
    let currentElement = null;

    // Create test elements
    const element1 = document.createElement('div');
    const element2 = document.createElement('span');

    class TestComponent extends Component {
      @tracked useFirst = true;

      result = useEffect(this, {
        effect: (deps) => {
          effectCallCount++;
          currentElement = deps[0];
          return { returnValue: currentElement?.tagName };
        },
        dependencies: {
          element: () => (this.useFirst ? element1 : element2),
        },
      });

      @action
      switchElement() {
        this.useFirst = !this.useFirst;
      }
    }

    setComponentTemplate(
      hbs`
          <div data-test-effect-result>{{this.result}}</div>
          <div data-test-use-first>{{this.useFirst}}</div>

          <button type="button" data-test-switch-element-btn {{on "click" this.switchElement}}>Switch Element</button>
        `,
      TestComponent
    );

    this.owner.register('component:test-component-dom', TestComponent);

    await render(hbs`<TestComponentDom />`);

    assert.strictEqual(effectCallCount, 1, 'effect runs initially');
    assert.strictEqual(currentElement, element1, 'receives first element');
    assert.dom('[data-test-effect-result]').hasText('DIV');

    await click('[data-test-switch-element-btn]');

    assert.strictEqual(currentElement, element2, 'receives second element');
    assert.dom('[data-test-effect-result]').hasText('SPAN');
  });

  test('works with complex object dependencies', async function (assert) {
    let effectCallCount = 0;
    let lastConfig = null;

    const getReturnValue = (config) =>
      `user-${config.userId}-${JSON.stringify(config.settings)}`;

    class TestComponent extends Component {
      @tracked userId = 1;
      @tracked settings = { theme: 'dark', notifications: true };

      result = useEffect(this, {
        effect: (deps) => {
          effectCallCount++;

          lastConfig = {
            userId: deps[0],
            settings: deps[1],
          };

          return { returnValue: getReturnValue(lastConfig) };
        },
        dependencies: {
          userId: () => this.userId,
          settings: () => this.settings,
        },
      });

      @action
      incrementUserId() {
        this.userId++;
      }

      @action
      toggleTheme() {
        this.settings = {
          ...this.settings,
          theme: this.settings.theme === 'dark' ? 'light' : 'dark',
        };
      }
    }

    setComponentTemplate(
      hbs`
          <div data-test-effect-result>{{this.result}}</div>
          <div data-test-user-id>{{this.userId}}</div>
          <div data-test-settings>{{this.settings.theme}}</div>

          <button type="button" data-test-increment-user-btn {{on "click" this.incrementUserId}}>Increment User</button>
          <button type="button" data-test-toggle-theme-btn {{on "click" this.toggleTheme}}>Toggle Theme</button>
      `,
      TestComponent
    );

    this.owner.register('component:test-component-complex', TestComponent);

    await render(hbs`<TestComponentComplex />`);

    assert.strictEqual(effectCallCount, 1, 'effect runs initially');

    assert.dom('[data-test-effect-result]').hasText(getReturnValue(lastConfig));

    assert.deepEqual(
      lastConfig,
      { userId: 1, settings: { theme: 'dark', notifications: true } },
      'receives complex object'
    );

    // Incrementing the user id should run the effect since it is a dependency
    // However, the settings object
    await click('[data-test-increment-user-btn]');

    assert.strictEqual(effectCallCount, 2, 'effect runs again');

    assert.deepEqual(
      lastConfig,
      { userId: 2, settings: { theme: 'dark', notifications: true } },
      'receives updated complex object'
    );

    assert.dom('[data-test-effect-result]').hasText(getReturnValue(lastConfig));

    await click('[data-test-toggle-theme-btn]');

    assert.strictEqual(effectCallCount, 3, 'effect runs again');

    assert.deepEqual(
      lastConfig,
      { userId: 2, settings: { theme: 'light', notifications: true } },
      'receives updated complex object'
    );
  });

  test('handles effect that returns void', async function (assert) {
    let effectCallCount = 0;

    class TestComponent extends Component {
      @tracked value = 'test';

      result = useEffect(this, {
        effect: () => {
          effectCallCount++;
          // Return void (no return statement)
        },
        dependencies: {
          value: () => this.value,
        },
      });

      @action
      updateValue(event) {
        this.value = event.target.value;
      }
    }

    setComponentTemplate(
      hbs`
        <div data-test-effect-result>{{this.result}}</div>
        <div data-test-value>{{this.value}}</div>

        <input aria-label="value" data-test-value-input value={{this.value}} {{on "input" this.updateValue}} />
      `,
      TestComponent
    );

    this.owner.register('component:test-component-void', TestComponent);

    await render(hbs`<TestComponentVoid />`);

    assert.strictEqual(effectCallCount, 1, 'effect runs once');
    assert.dom('[data-test-effect-result]').hasText('');

    await fillIn('[data-test-value-input]', 'test2');
    await triggerEvent('[data-test-value-input]', 'keyup');

    assert.strictEqual(effectCallCount, 2, 'effect runs again');
    assert.dom('[data-test-effect-result]').hasText('');
  });

  test('handles array dependencies correctly', async function (assert) {
    assert.expect(8);

    let effectCallCount = 0;

    class TestComponent extends Component {
      @tracked items = [1, 2, 3];

      result = useEffect(this, {
        effect: (deps) => {
          effectCallCount++;
          return {
            cleanup: () => assert.true(true, 'Effect cleanup called'),
            returnValue: deps[0].length,
          };
        },
        dependencies: {
          items: () => this.items,
        },
      });

      @action
      addItem() {
        this.items = [...this.items, this.items.length + 1];
      }

      @action
      resetItems() {
        this.items = [1, 2, 3]; // Same content, different reference
      }
    }

    setComponentTemplate(
      hbs`
          <div data-test-effect-result>{{this.result}}</div>
          <div data-test-items-length>{{this.items.length}}</div>

          <div data-test-items>
            {{#each this.items as |item|}}
              <span>{{item}}</span>
            {{/each}}
          </div>

          <button type="button" data-test-add-item-btn {{on "click" this.addItem}}>Add Item</button>
          <button type="button" data-test-reset-items-btn {{on "click" this.resetItems}}>Reset Items</button>
        `,
      TestComponent
    );

    this.owner.register('component:test-component-array', TestComponent);

    await render(hbs`<TestComponentArray />`);

    assert.strictEqual(effectCallCount, 1, 'effect runs initially');
    assert.dom('[data-test-effect-result]').hasText('3');

    await click('[data-test-add-item-btn]');

    assert.strictEqual(effectCallCount, 2, 'effect runs again');
    assert.dom('[data-test-effect-result]').hasText('4');

    await click('[data-test-reset-items-btn]');

    assert.strictEqual(effectCallCount, 3, 'effect runs again');
    assert.dom('[data-test-effect-result]').hasText('3');

    await destroy(this.owner);

    assert.strictEqual(effectCallCount, 3, 'effect does not run again');
  });

  test('other tracked properties used in effect function definition should not trigger effect only dependencies', async function (assert) {
    assert.expect(4);

    let effectCallCount = 0;

    class TestComponent extends Component {
      @tracked value = 'test';
      @tracked otherValue = 'other';

      result = useEffect(this, {
        effect: this.effect,
        dependencies: {
          otherValue: () => this.otherValue,
        },
      });

      @action
      updateValue(event) {
        this.value = event.target.value;
      }

      @action
      updateOtherValue(event) {
        this.otherValue = event.target.value;
      }

      @action
      effect() {
        effectCallCount++;

        // Using this.value inside effect but not as dependency
        return { returnValue: this.value };
      }
    }

    setComponentTemplate(
      hbs`
          <div data-test-effect-result>{{this.result}}</div>
          <div data-test-value>{{this.value}}</div>
          <div data-test-other-value>{{this.otherValue}}</div>

          <input aria-label="value" data-test-value-input value={{this.value}} {{on "input" this.updateValue}} />
          <input aria-label="other value" data-test-other-value-input value={{this.otherValue}} {{on "input" this.updateOtherValue}} />
        `,
      TestComponent
    );

    this.owner.register(
      'component:test-component-tracked-props',
      TestComponent
    );

    await render(hbs`<TestComponentTrackedProps />`);

    assert.strictEqual(effectCallCount, 1, 'effect runs initially');
    assert.dom('[data-test-effect-result]').hasText('test');

    // Change value that's used in effect but not in dependencies
    await fillIn('[data-test-value-input]', 'updated');

    assert.strictEqual(
      effectCallCount,
      1,
      'effect does not run when non-dependency tracked property changes'
    );

    // Change dependency value
    await fillIn('[data-test-other-value-input]', 'updated-other');

    assert.strictEqual(
      effectCallCount,
      2,
      'effect runs when dependency changes'
    );
  });
});
