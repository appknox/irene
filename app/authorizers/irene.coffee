`import Base from 'ember-simple-auth/authorizers/base'`
`import ENV from 'irene/config/environment';`


IreneAuthorizer = Base.extend

  authorize: (data, block)->
    block 'Authorization', "Basic #{data.b64token}"
    block 'X-Product', ENV.product


`export default IreneAuthorizer`
