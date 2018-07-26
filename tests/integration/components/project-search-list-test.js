import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('project-search-list', 'Integration | Component | project search list', {
  integration: true
});

test('it renders', function(assert) {

  this.render(hbs`{{project-search-list}}`);

  assert.equal(this.$().text().trim(), 'no project!!');
});
