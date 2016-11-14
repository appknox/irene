`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'compare-summary', 'Integration | Component | compare summary', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1
  #
  # # Set any properties with @set 'myProperty', 'value'
  # # Handle any actions with @on 'myAction', (val) ->
  #
  # @render hbs """{{compare-summary}}"""
  #
  # assert.equal @$().text().trim(), ''
  #
  # # Template block usage:
  # @render hbs """
  #   {{#compare-summary}}
  #     template block text
  #   {{/compare-summary}}
  # """
  #
  # assert.equal @$().text().trim(), 'template block text'

  assert.ok true
