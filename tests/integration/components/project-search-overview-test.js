import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('project-search-overview', 'Integration | Component | project search overview', {
  integration: true
});

test('it renders', function(assert) {

  this.render(hbs`{{project-search-overview}}`);

  assert.equal(this.$().text().trim(), 'View Files');

});
