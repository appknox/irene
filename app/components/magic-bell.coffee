`import Ember from 'ember'`

MagicBellComponent = Ember.Component.extend

  didInsertElement: ->
    options = {
      target: @element,
      projectId: "36",
      apiKey: "eeff046f18ffb00e6cc4a33141d82975805e5761",
      userEmail: "customer@mailinator.com",
      userKey: "LONXrHvIiVddnBYsbeLSkggrTL/NxIbcmXhHSCp6j4U=",
    };

    ((options)=>
      mb = document.createElement('script')
      mb.type = 'text/javascript'
      mb.async = true
      mb.src = '//dxd8ma9fvw6e2.cloudfront.net/widget.magicbell.js';
      mb.onload = mb.onreadystatechange = => MagicBell.initialize(options);
      s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(mb, s);
    )(options);

`export default MagicBellComponent`
