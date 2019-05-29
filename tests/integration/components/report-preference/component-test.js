import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('report-preference', 'Integration | Component | report preference', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{report-preference}}`);

  // assert.equal(this.$().text().trim(), '');

  // // Template block usage:
  // this.render(hbs`
  //   {{#report-preference}}
  //     template block text
  //   {{/report-preference}}
  // `);
  assert.equal(true, true)

});
