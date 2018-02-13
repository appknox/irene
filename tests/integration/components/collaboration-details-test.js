/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('collaboration-details', 'Integration | Component | collaboration details', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  // Set any properties with @set 'myProperty', 'value'
  // Handle any actions with @on 'myAction', (val) ->

  this.render(hbs("{{collaboration-details}}"));



  return assert.equal(this.$().text().trim(), 'undefinedDeveloperManagerAdminremoveAre you sure you want to remove this team from collaboration?Please enter the team name which you want to remove from collaborationremove');
});
