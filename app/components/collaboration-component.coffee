`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import ENUMS from 'irene/enums';`

roles = ENUMS.COLLABORATION_ROLE.CHOICES.reverse()[1..]

CollaborationComponentComponent = Ember.Component.extend
  collaborationEmail: ""
  project: null
  roles: roles
  currentRole: roles[0].value

  collaborations: (->
    projectId = @get "project.id"
    @get("store").query "collaboration", projectId: projectId
  ).property "project.id", "realtime.collaborationsCounter"

  actions:

    roleChanged: (value) ->
      @set "currentRole", parseInt value

    addCollaboration: ->
      that = @
      data =
        email: @get "collaborationEmail"
        projectId: @get "project.id"
        role: @get "currentRole"
      that = @
      @get("ajax").post ENV.endpoints.collaboration, data:data
      .then (data)->
        that.send "closeModal"
        that.get("notify").success "Collaboration added!"
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

    openCollaborationModal: ->
      @set "showCollaborationModal", true

    closeModal: ->
      @set "showCollaborationModal", false


`export default CollaborationComponentComponent`
