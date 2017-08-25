`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'api-filter', 'Integration | Component | api filter', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{api-filter}}"""

  assert.equal @$().text().trim(), 'API Scanner URL FilterEnter the API endpoint to scan: eg. api.appknox.com. Do not specify the scheme (http://...), port (:443/...) & path (.../users)Save Filter+ ADD NEW URL  Are you sure you want to remove from url filters?CancelOk'
