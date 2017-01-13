`import Ember from 'ember'`

# This function receives the params `params, hash`
pageNumber = (params) ->
  params[0] + 1

PageNumberHelper = Ember.Helper.helper pageNumber

`export { pageNumber }`

`export default PageNumberHelper`
