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

  assert.equal @$().text().trim(), 'API Scanner URL FilterSpecify the URL which you want the API Scan to be performed on+ ADD NEW URLeg. api.appknox.com. Do not specify the scheme (http://...), port (:443/...) & path (.../users)Are you sure you want to remove from url filters?CancelOk'
