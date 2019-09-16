import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('team-project', 'Integration | Component | team project', {
  integration: true,
  beforeEach(){
    this.inject.service('intl');
    this.container.owner.lookup('service:intl').setLocale('en');
  }
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{team-project}}`);

  assert.equal(this.$().text().trim(), 'removeAre you sure you want to remove this team member?Please enter the name of team member who you want to removeremove');
});
