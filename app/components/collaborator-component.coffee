`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import ENUMS from 'irene/enums';`

roles = ENUMS.COLLABORATION_ROLE.CHOICES.reverse()[1..]

CollaboratorComponentComponent = Ember.Component.extend
  collaboratorEmail: ""
  project: null
  roles: roles
  currentRole: roles[0].value

  actions:

    roleChanged: (value) ->
      @set "currentRole", parseInt value

    addCollaborator: ->
      that = @
      data =
        email: @get "collaboratorEmail"
        projectId: @get "project.id"
        role: @get "currentRole"
      that = @
      @get("ajax").post ENV.endpoints.collaboration, data:data
      .then (data)->
        that.send "closeModal"
        that.get("notify").success "Collaborator added!"
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail.message

    openCollaboratorModal: ->
      @set "showCollaboratorModal", true

    closeModal: ->
      @set "showCollaboratorModal", false


`export default CollaboratorComponentComponent`
