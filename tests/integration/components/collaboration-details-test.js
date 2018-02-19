import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('collaboration-details', 'Integration | Component | collaboration details', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{collaboration-details}}"));

  assert.equal(this.$().text().trim(), 'undefinedDeveloperManagerAdminremoveAre you sure you want to remove this team from collaboration?Please enter the team name which you want to remove from collaborationremove');
});
