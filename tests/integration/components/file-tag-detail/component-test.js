import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('file-tag-detail', 'Integration | Component | file tag detail', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{file-tag-detail}}`);

  assert.equal(this.$().text().trim(), 'Are you sure you want to remove this file tagCancelOk');
});
