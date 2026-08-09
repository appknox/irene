import { module, test } from 'qunit';

import getCssVariableValue from 'irene/utils/get-css-variable-value';

module('Unit | Utility | get-css-variable-value', function (hooks) {
  // Track DOM/global CSS state touched by each test so it can be cleaned up.
  let appended = [];
  const bodyProps = [];

  hooks.afterEach(function () {
    appended.forEach((node) => node.remove());
    appended = [];

    bodyProps.forEach((prop) => document.body.style.removeProperty(prop));
    bodyProps.length = 0;
  });

  // Creates a div with an optional custom property, attached to the document
  // so getComputedStyle resolves it.
  function elementWithVar(name, value) {
    const el = document.createElement('div');

    if (name) {
      el.style.setProperty(name, value);
    }

    document.body.appendChild(el);
    appended.push(el);

    return el;
  }

  // ─── Resolving a set variable ─────────────────────────────────────────────

  test('returns the value of a custom property set on the element', function (assert) {
    const el = elementWithVar('--test-color', '#abcdef');

    assert.strictEqual(getCssVariableValue('--test-color', el), '#abcdef');
  });

  test.each(
    'preserves the value verbatim',
    ['#ff4d3f', 'rgb(0, 0, 0)', '12px', 'calc(100% - 8px)', 'red'],
    function (assert, value) {
      const el = elementWithVar('--x', value);

      assert.strictEqual(
        getCssVariableValue('--x', el),
        value,
        `value ${value}`
      );
    }
  );

  // ─── Whitespace trimming ──────────────────────────────────────────────────

  test.each(
    'trims surrounding whitespace',
    [
      ['  #fff  ', '#fff'],
      [' 10px ', '10px'],
      ['#000', '#000'],
    ],
    function (assert, [raw, expected]) {
      const el = elementWithVar('--y', raw);

      assert.strictEqual(
        getCssVariableValue('--y', el),
        expected,
        `"${raw}" → "${expected}"`
      );
    }
  );

  // ─── Missing / unknown ────────────────────────────────────────────────────

  test('returns an empty string for an unset custom property', function (assert) {
    const el = elementWithVar('--present', '#000');

    assert.strictEqual(getCssVariableValue('--absent', el), '');
  });

  test('returns an empty string for an empty variable name', function (assert) {
    const el = elementWithVar('--present', '#000');

    assert.strictEqual(getCssVariableValue('', el), '');
  });

  // ─── Element argument & inheritance ───────────────────────────────────────

  test('reads from the explicitly passed element', function (assert) {
    const a = elementWithVar('--c', 'aaa');
    const b = elementWithVar('--c', 'bbb');

    assert.strictEqual(getCssVariableValue('--c', a), 'aaa');
    assert.strictEqual(getCssVariableValue('--c', b), 'bbb');
  });

  test('defaults to document.body when no element is passed', function (assert) {
    document.body.style.setProperty('--body-var', 'body-value');
    bodyProps.push('--body-var');

    assert.strictEqual(getCssVariableValue('--body-var'), 'body-value');
  });

  test('resolves a custom property inherited from an ancestor', function (assert) {
    const parent = elementWithVar('--inherited', 'from-parent');
    const child = document.createElement('div');

    parent.appendChild(child);

    assert.strictEqual(
      getCssVariableValue('--inherited', child),
      'from-parent'
    );
  });
});
