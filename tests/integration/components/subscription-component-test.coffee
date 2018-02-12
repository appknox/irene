`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'subscription-component', 'Integration | Component | subscription component', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{subscription-component}}"""

  assert.equal @$().text().trim(), 'Subscription DetailsCurrent PlanBilling Period You will be charged on   Cancel SubscriptionAre you sure you want to cancel Subscription?CancelOk'
