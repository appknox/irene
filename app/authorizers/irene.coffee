`import Base from 'ember-simple-auth/authorizers/base'`


IreneAuthorizer = Base.extend

  authorize: (data, block)->
    block 'Authorization', "Basic #{data.b64token}"


`export default IreneAuthorizer`
