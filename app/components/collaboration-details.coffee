`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import ENUMS from 'irene/enums'`

roles = ENUMS.COLLABORATION_ROLE.CHOICES.reverse()[1..]

CollaborationDetailsComponent = Ember.Component.extend

  collaboration: null
  roles: roles
  currentRole: roles[0].value

  actions:

    roleChanged: (value) ->
      @set "currentRole", parseInt value

    removeCollaboration: ->
      collaboration = @get "collaboration"
      return if !confirm "Do you want to remove `#{collaboration.get "username"}` from the list of collaborators?"
      that = @
      url = [ENV.endpoints.deleteCollaboration, collaboration.get "id"].join '/'
      @get("ajax").post url
      .then (data)->
        that.get("notify").success "Collaboration will be removed shortly"
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message


`export default CollaborationDetailsComponent`
