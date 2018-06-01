import Ember from 'ember';

export function scanType(params) {
  const tag = params[0];
  const file = params[1].content;
  const check = "<i class='fa fa-check'>";
  const times = "<i class='fa fa-times'>";
  let icon = times;
  switch (tag) {
    case "static":
      if(file.get("isStaticDone")) {
        icon = check;
      }
      return icon.htmlSafe();
    case "dynamic":
      if(file.get("isDynamicDone")) {
        icon = check;
      }
      return icon.htmlSafe();
    case "manual":
      if(file.get("isManualDone")) {
        icon = check;
      }
      return icon.htmlSafe();
    case "api":
      if(file.get("isApiDone")) {
        icon = check;
      }
      return icon.htmlSafe();
  }
}

export default Ember.Helper.helper(scanType);
