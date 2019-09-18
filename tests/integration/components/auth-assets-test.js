import tHelper from 'ember-intl/helpers/t';
import { getOwner } from '@ember/application';
import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('auth-assets', 'Integration | Component | auth assets', {
  unit: true,
  needs:[
    'config:environment',
    'service:intl',
    'ember-intl@adapter:default',
    'cldr:en',
    'cldr:ja',
    'translation:en',
    'util:intl/missing-message'
  ],
  beforeEach() {
    // set the locale and the config
    getOwner(this).lookup('service:intl').setLocale('en');

    // register t helper
    this.register('helper:t', tHelper);
  },
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{auth-assets}}"));

  assert.equal(this.$().text().trim(), 'Security fanatics at your service');
});
