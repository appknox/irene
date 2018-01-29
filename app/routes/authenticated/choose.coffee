`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedChooseRoute = Ember.Route.extend ScrollTopMixin,

  title: "Choose File | Appknox"
  model: (params)->
    @get('store').find('file', params.fileId)


`export default AuthenticatedChooseRoute`
