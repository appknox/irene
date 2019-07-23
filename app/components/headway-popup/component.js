import Component from '@ember/component';
import ENV from 'irene/config/environment';

export default Component.extend({
  showModal: false,
  showHeadway: false,
  didInsertElement(){
    if (ENV.appVersion) {
      try{
      let innerdiv = document.createElement('div');
      innerdiv.innerText="Version v"+ ENV.appVersion
      let config = {selector: "#headway", account:  "x8mO97", position:{x: "left", y: "top"} };
      Headway.init(config);
      Headway.elements.badgeCont.appendChild(innerdiv);
      }catch (e){console.log(error) }
    }
  },
});
