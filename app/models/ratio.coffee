`import DS from 'ember-data'`

Ratio = DS.Model.extend
  affected: DS.attr 'number'
  unaffected: DS.attr 'number'

  incrementAffected: ->
    affected = @get "affected"
    affected += 1
    @set "affected", affected

  incrementUnAffected: ->
    unaffected = @get "unaffected"
    unaffected += 1
    @set "unaffected", unaffected

  decrementAffected: ->
    affected = @get "affected"
    affected -= 1
    @set "affected", affected

  decrementUnAffected: ->
    unaffected = @get "affected"
    unaffected -= 1
    @set "unaffected", unaffected

  ratio: ( ->
    affected = @get "affected"
    unaffected = @get "unaffected"
    total = affected + unaffected
    ratio = (100 * affected/total).toFixed(2)
    ratio = "_" if ratio is "NaN"
    "#{ratio}%"
  ).property "affected", "unaffected"

`export default Ratio`
