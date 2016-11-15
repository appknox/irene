`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import ENUMS from 'irene/enums';`

CollaboratorComponentComponent = Ember.Component.extend
  collaboratorEmail: ""
  choices: ENUMS.COLLABORATION_ROLE.CHOICES[1..]
  currentRole: ENUMS.COLLABORATION_ROLE.MANAGER
  project: null

  actions:
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
        debugger
        for error in error.errors
          that.get("notify").error error.detail.message

    openCollaboratorModal: ->
      @set "showCollaboratorModal", true

    closeModal: ->
      @set "showCollaboratorModal", false


`export default CollaboratorComponentComponent`
