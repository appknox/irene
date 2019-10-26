import ENUMS from 'irene/enums';

const regulatoryStatusMap = {
  kv: {
    [ENUMS.REGULATORY_STATUS.NONE]: null,
    [ENUMS.REGULATORY_STATUS.SHOW]: true,
    [ENUMS.REGULATORY_STATUS.HIDE]: false
  },
  vk: {
    'null': ENUMS.REGULATORY_STATUS.NONE,
    'true': ENUMS.REGULATORY_STATUS.SHOW,
    'false': ENUMS.REGULATORY_STATUS.HIDE
  }
};

export default regulatoryStatusMap;
