import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('github-account', 'Integration | Component | github account', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{github-account}}"));

  assert.equal(this.$().text().trim(), 'Integrate GitHubAre you sure you want to revoke Github Integration?CancelOk');
});
