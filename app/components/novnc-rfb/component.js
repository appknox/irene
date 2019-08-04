import Component from '@ember/component';
import ENV from 'irene/config/environment';
import RFB from '@novnc/novnc/core/rfb';

export default Component.extend({
  classNames:['novnc-rfb'],
  rfb: null,
  didInsertElement(){
    const canvasEl = this.element.getElementsByClassName("canvas-container")[0];
    const deviceToken = this.get("deviceToken");
    const deviceFarmURL =
      `wss://${ENV.deviceFarmHost}/${ENV.deviceFarmPath}?token=${deviceToken}`

    const rfb = new RFB(
      canvasEl,
      deviceFarmURL, {
        'credentials': {
            'password': this.get('deviceFarmPassword')
        }
      }
    );
    rfb.addEventListener('connect', () => {
      const sizing_element = this.element;
      rfb.scaleViewport=true;
      rfb._display.autoscale(sizing_element.offsetWidth, sizing_element.offsetHeight);
    });
    this.set("rfb", rfb);
  },
  willDestroyElement(){
    const rfb = this.get('rfb');
    rfb.removeEventListener('connect', ()=>{
      rfb.disconnect();
      this.set('rfb', null)
    })
  }
});
