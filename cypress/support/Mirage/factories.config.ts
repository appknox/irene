import { BASE_FACTORY_DEF } from 'irene/mirage/factories/base';
import FileFactory, { FILE_FACTORY_DEF } from 'irene/mirage/factories/file';
import User, { USER_FACTORY_DEF } from 'irene/mirage/factories/user';

import ProjectFactory, {
  PROJECT_FACTORY_DEF,
} from 'irene/mirage/factories/project';

import VulnerabilityFactory, {
  VULNERABLITY_FACTORY_DEF,
} from 'irene/mirage/factories/vulnerability';

import UnknownAnalysisStatus, {
  UNKNOWN_ANALYSIS_STATUS_FACTORY_DEF,
} from 'irene/mirage/factories/unknown-analysis-status';

import OrganizationMember, {
  ORGANIZATION_MEMBER_FACTORY_DEF,
} from 'irene/mirage/factories/organization-member';

// Extract factory method return values from a factory definition
type FlattenFactoryMethods<T> = {
  [K in keyof T]: T[K] extends (n: number) => infer V ? V : T[K];
};

/**
 * Represents api responses for each model type
 */
type IncludeBaseFactoryProps<T> = FlattenFactoryMethods<T> &
  FlattenFactoryMethods<typeof BASE_FACTORY_DEF>;

export interface MirageFactoryDefProps {
  user: FlattenFactoryMethods<typeof USER_FACTORY_DEF>;
  'organization-member': FlattenFactoryMethods<
    typeof ORGANIZATION_MEMBER_FACTORY_DEF
  >;

  // Contains base factory props
  file: IncludeBaseFactoryProps<typeof FILE_FACTORY_DEF>;
  project: IncludeBaseFactoryProps<typeof PROJECT_FACTORY_DEF>;
  vulnerability: IncludeBaseFactoryProps<typeof VULNERABLITY_FACTORY_DEF>;

  'unknown-analysis-status': IncludeBaseFactoryProps<
    typeof UNKNOWN_ANALYSIS_STATUS_FACTORY_DEF
  >;
}

/**
 * Mirage Model Factories for data mocking
 */
const MIRAGE_FACTORIES = {
  file: FileFactory,
  project: ProjectFactory,
  vulnerability: VulnerabilityFactory,
  'unknown-analysis-status': UnknownAnalysisStatus,
  'organization-member': OrganizationMember,
  user: User,
};

export { MIRAGE_FACTORIES };
