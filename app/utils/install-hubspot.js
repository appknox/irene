import ENV from 'irene/config/environment';

export default function installHubspot() {
  if (!ENV.enableHubspot) {
    return console.log("Hubspot is disabled");
  }
  var d = document;
  const s = d.createElement('script');
  s.type = 'text/javascript';
  s.async = true;
  s.defer = true;
  s.id= "hs-script-loader";
  s.src = '//js.hs-scripts.com/1683437.js';
  const x = d.getElementsByTagName('script')[0];
  return x.parentNode.insertBefore(s, x);
}
