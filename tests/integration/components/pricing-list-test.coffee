`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'pricing-list', 'Integration | Component | pricing list', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{pricing-list}}"""

  assert.equal @$().text().trim(), 'PricingMONTHLYQUATERLYHALFYEARLYYEARLY'
