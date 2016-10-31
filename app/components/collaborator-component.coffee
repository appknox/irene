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
      url = [ENV.APP.API_BASE, ENV.endpoints.collaboration].join '/'
      that = @
      Ember.$.post url, data
      .then ->
        that.send "closeModal"
        @get("notify").success "Collaborator added!"
      .fail (xhr, message, status) ->
        if xhr.status is 403
          @get("notify").error xhr.responseJSON.message
        else
          @get("notify").error "A network error occured! Please try again later"


`export default CollaboratorComponentComponent`
