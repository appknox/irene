/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('github-project', 'Integration | Component | github project', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  // Set any properties with @set 'myProperty', 'value'
  // Handle any actions with @on 'myAction', (val) ->

  this.render(hbs("{{github-project}}"));


  return assert.equal(this.$().text().trim(), "GitHub IntegrationSelect the Github Repo where you want us to create issues for the risks we find in your projectNo PreferenceLoading...Are you sure you want to remove Github Project?CancelOk");
});
