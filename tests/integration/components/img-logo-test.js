import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | img-logo', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const whitelabel = this.owner.lookup('service:whitelabel');
    await render(hbs`<ImgLogo />`);
    assert.dom('img').exists();
    assert.dom('img').hasAttribute('src', whitelabel.logo);
    assert.dom('img').hasAttribute('alt', whitelabel.name);
    assert.dom('a').exists();
  });

  test('should render darkbg logo', async function (assert) {
    const whitelabel = this.owner.lookup('service:whitelabel');
    const configuration = this.owner.lookup('service:configuration');
    configuration.themeData.scheme = 'dark';
    await render(hbs`<ImgLogo />`);
    assert.dom('img').hasAttribute('src', whitelabel.default_logo_on_darkbg);

    configuration.imageData.logo_on_darkbg = '/testsomethingcustomdark.png';
    await render(hbs`<ImgLogo />`);
    assert.dom('img').hasAttribute('src', '/testsomethingcustomdark.png');
    configuration.imageData.logo_on_darkbg = '';
    configuration.themeData.scheme = '';
  });

  test('should render lightbg logo', async function (assert) {
    const whitelabel = this.owner.lookup('service:whitelabel');
    const configuration = this.owner.lookup('service:configuration');
    configuration.themeData.scheme = 'light';
    await render(hbs`<ImgLogo />`);
    assert.dom('img').hasAttribute('src', whitelabel.default_logo_on_lightbg);
    configuration.imageData.logo_on_lightbg = '/testsomethingcustomlight.png';
    await render(hbs`<ImgLogo />`);
    assert.dom('img').hasAttribute('src', '/testsomethingcustomlight.png');
    configuration.imageData.logo_on_lightbg = '';
    configuration.themeData.scheme = '';
  });

  test('should render alt to whitelabel name', async function (assert) {
    const configuration = this.owner.lookup('service:configuration');
    configuration.frontendData.name = 'Test me logo custom';
    await render(hbs`<ImgLogo />`);
    assert.dom('img').hasAttribute('alt', 'Test me logo custom');
    configuration.frontendData.name = '';
  });
});
