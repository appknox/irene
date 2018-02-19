import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('vnc-viewer', 'Integration | Component | vnc viewer', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{vnc-viewer}}"));

  assert.equal(this.$().text().trim(), '');
});
