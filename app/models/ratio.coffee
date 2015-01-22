`import DS from 'ember-data'`

Ratio = DS.Model.extend
  affected: DS.attr 'number'
  unaffected: DS.attr 'number'

  incrementAffected: ->
    affected = @get "affected"
    affected += 1
    @set "affected", affected

  incrementUnaffected: ->
    unaffected = @get "unaffected"
    unaffected += 1
    @set "unaffected", unaffected

  decrementAffected: ->
    affected = @get "affected"
    affected -= 1
    @set "affected", affected

  decrementUnaffected: ->
    unaffected = @get "unaffected"
    unaffected -= 1
    @set "unaffected", unaffected

  ratio: (->
    affected = @get "affected"
    unaffected = @get "unaffected"
    total = affected + unaffected
    "#{(100 * affected / total).toFixed(2)}%"
  ).property "affected", "unaffected"

`export default Ratio`
