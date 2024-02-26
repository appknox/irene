import { Factory } from 'miragejs';

export const SBOM_PROJECT_FACTORY_DEF = {
  id(i: number) {
    return 1000 + i + 1;
  },

  project(i: number) {
    return i + 1;
  },

  latest_sb_file(i: number) {
    return 100 + i + 1;
  },
};

export default Factory.extend(SBOM_PROJECT_FACTORY_DEF);
