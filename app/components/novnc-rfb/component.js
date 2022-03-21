/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, ember/avoid-leaking-state-in-ember-objects, ember/no-component-lifecycle-hooks, prettier/prettier, ember/no-get */
import Component from '@ember/component';
import RFB from '@novnc/novnc/core/rfb';

export default Component.extend({
  localClassNames: ['novnc-rfb'],
  rfb: null,
  didInsertElement(){
this._super(...arguments);
    const canvasEl = this.element.getElementsByClassName("canvas-container")[0];
    const deviceFarmURL = this.get('deviceFarmURL');
    const rfb = new RFB(
      canvasEl,
      deviceFarmURL, {
        'credentials': {
            'password': this.get('deviceFarmPassword')
        }
      }
    );
    this.set("rfb", rfb);
    rfb.addEventListener('connect', () => {
      const sizing_element = this.element;
      rfb.scaleViewport=true;
      rfb._display.autoscale(sizing_element.offsetWidth, sizing_element.offsetHeight);
    });
  },
  willDestroyElement(){
this._super(...arguments);
    const rfb = this.get('rfb');
    rfb.removeEventListener('connect', ()=>{
      rfb.disconnect();
      this.set('rfb', null)
    })
  }
});
