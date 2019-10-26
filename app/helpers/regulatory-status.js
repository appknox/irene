import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';


function regulatoryStatus(params) {
  let risk = params[0];
  risk = parseInt(risk);
  const statuses = {
    [ENUMS.REGULATORY_STATUS.NONE]: '---',
    [ENUMS.REGULATORY_STATUS.SHOW]: 'Show',
    [ENUMS.REGULATORY_STATUS.HIDE]: 'Hide',
  }
  return statuses[risk] || '';
}

export default helper(regulatoryStatus);
