`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'plan-list', 'Integration | Component | plan list', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{plan-list}}"""


  assert.equal @$().text().trim(), 'PricingMONTHLYQUARTERLYHALF YEARLYYEARLY'
