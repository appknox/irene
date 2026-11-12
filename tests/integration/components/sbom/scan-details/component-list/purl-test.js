import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module(
  'Integration | Component | sbom/scan-details/component-list/purl',
  function (hooks) {
    setupRenderingTest(hooks);

    const TEMPLATE = hbs`
      <Sbom::ScanDetails::ComponentList::Purl
        @sbomComponent={{this.sbomComponent}}
      />
    `;

    test('it appends the version to the versionless bom-ref', async function (assert) {
      this.sbomComponent = {
        name: 'jackson-databind',
        version: '2.9.8',
        bomRef: 'maven::com.fasterxml.jackson.core:jackson-databind',
      };

      await render(TEMPLATE);

      const expected =
        'maven::com.fasterxml.jackson.core:jackson-databind@2.9.8';

      assert
        .dom('[data-test-sbomComponent-purl]')
        .hasText(expected)
        .hasAttribute('title', expected);
    });

    test('two versions of the same library render differently', async function (assert) {
      const bomRef = 'maven::com.fasterxml.jackson.core:jackson-databind';

      this.sbomComponent = {
        name: 'jackson-databind',
        version: '2.9.8',
        bomRef,
      };
      await render(TEMPLATE);

      const first = this.element.textContent.trim();

      this.set('sbomComponent', {
        name: 'jackson-databind',
        version: '2.12.7',
        bomRef,
      });

      assert.notStrictEqual(this.element.textContent.trim(), first);
      assert.dom('[data-test-sbomComponent-purl]').includesText('@2.12.7');
    });

    test('a purl that already has a version is shown as is', async function (assert) {
      this.sbomComponent = {
        name: 'jackson-databind',
        version: '2.9.8',
        bomRef: 'pkg:maven/com.fasterxml.jackson.core/jackson-databind@2.9.8',
      };

      await render(TEMPLATE);

      assert
        .dom('[data-test-sbomComponent-purl]')
        .hasText(this.sbomComponent.bomRef);
    });

    test.each(
      'it falls back to the name without a bom-ref',
      ['', '   ', null],
      async function (assert, bomRef) {
        this.sbomComponent = { name: 'jackson-databind', bomRef };

        await render(TEMPLATE);

        assert
          .dom('[data-test-sbomComponent-purl]')
          .hasText('jackson-databind');
      }
    );
  }
);
