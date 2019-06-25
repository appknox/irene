import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
    mpClassSelector: true,
    showVulnerability: false,
    classNameBindings: ["riskClass"],
    getType: computed('timeline.type',function(){

        if (this.get('timeline.type')===0){
            return "event";
        }else if(this.get('timeline.type')===1){
            return "dynamic";
        }{
            return "api";
        }
    }),
});
