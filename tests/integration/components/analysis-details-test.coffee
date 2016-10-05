`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'analysis-details', 'Integration | Component | analysis details', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{analysis-details}}"""


  assert.equal @$().text().trim(), 'Business ImplicationsHOW AND WHAT'
