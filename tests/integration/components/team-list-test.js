import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('team-list', 'Integration | Component | team list', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{team-list}}"));

  assert.equal(this.$().text().trim(), 'TeamOwnerMembersProjectsCreatedremove');
});
