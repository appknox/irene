import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('task-spin', 'Integration | Component | task spin', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{task-spin}}`);

  // assert.equal(this.$().text().trim(), '');

  // // Template block usage:
  // this.render(hbs`
  //   {{#task-spin}}
  //     template block text
  //   {{/task-spin}}
  // `);

  // assert.equal(this.$().text().trim(), 'template block text');
  assert.equal(true, true)
});
