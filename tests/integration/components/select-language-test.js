import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('select-language', 'Integration | Component | select language', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{select-language}}"));

  assert.equal(this.$().text().trim().replace(/(\r\n|\n|\r|\t)/gm,""), 'English日本語');
});
