`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import ENUMS from 'irene/enums'`

roles = ENUMS.COLLABORATION_ROLE.CHOICES.reverse()[1..]

CollaborationDetailsComponent = Ember.Component.extend

  collaboration: null
  roles: roles
  currentRole: roles[0].value

  actions:

    changeRole: (value) ->
      currentRole = @set "currentRole", parseInt value
      collaborationId = @get "collaboration.id"
      url = [ENV.endpoints.collaborations, collaborationId ].join '/'
      data =
        role: currentRole
      that = @
      @get("ajax").post url , data:data
      .then (data)->
        that.get("notify").success "Permission changed successfully!"
      .catch (error) ->
        that.get("notify").error error.payload.message, ENV.notifications
        for error in error.errors
          that.get("notify").error error.detail?.message

    removeCollaboration: ->
      collaborationId = @get "collaboration.id"
      return if !confirm "Do you want to remove?"
      that = @
      url = [ENV.endpoints.collaborations, collaborationId].join '/'
      @get("ajax").delete url
      .then (data)->
        that.get("notify").success "Collaboration will be removed shortly"
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message


`export default CollaborationDetailsComponent`
