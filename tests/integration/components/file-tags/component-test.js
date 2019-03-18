import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('file-tags', 'Integration | Component | file tags', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{file-tags}}`);

  assert.equal(this.$().text().trim(), 'You can add/remove tags for this particular file▼CREATE TAG');
});
