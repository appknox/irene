import { FactoryDefinition } from 'miragejs/-types';

import { BASE_FACTORY_DEF } from 'irene/mirage/factories/base';
import FileFactory, { FILE_FACTORY_DEF } from 'irene/mirage/factories/file';
import User, { USER_FACTORY_DEF } from 'irene/mirage/factories/user';

import SbomProjectFactory, {
  SBOM_PROJECT_FACTORY_DEF,
} from 'irene/mirage/factories/sbom-project';

import SbomFileFactory, {
  SBOM_FILE_FACTORY_DEF,
} from 'irene/mirage/factories/sbom-file';

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

import UploadApp, {
  UPLOAD_APP_FACTORY_DEF,
} from 'irene/mirage/factories/upload-app';

import Submission, {
  SUBMISSION_FACTORY_DEF,
} from 'irene/mirage/factories/submission';

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
  'upload-app': FlattenFactoryMethods<typeof UPLOAD_APP_FACTORY_DEF>;
  'sbom-file': FlattenFactoryMethods<typeof SBOM_FILE_FACTORY_DEF>;
  'sbom-project': FlattenFactoryMethods<typeof SBOM_PROJECT_FACTORY_DEF>;

  submission: FlattenFactoryMethods<
    typeof SUBMISSION_FACTORY_DEF & {
      file: number;
    }
  >;

  'organization-member': FlattenFactoryMethods<
    typeof ORGANIZATION_MEMBER_FACTORY_DEF
  >;

  // Contains base factory props
  project: IncludeBaseFactoryProps<typeof PROJECT_FACTORY_DEF>;
  vulnerability: IncludeBaseFactoryProps<typeof VULNERABLITY_FACTORY_DEF>;

  'unknown-analysis-status': IncludeBaseFactoryProps<
    typeof UNKNOWN_ANALYSIS_STATUS_FACTORY_DEF
  >;

  file: IncludeBaseFactoryProps<
    typeof FILE_FACTORY_DEF & {
      project: number;
      executable_name: string;
    }
  >;
}

/**
 * Mirage Model Factories for data mocking
 */
const MIRAGE_FACTORIES: Record<
  keyof MirageFactoryDefProps,
  FactoryDefinition<object>
> = {
  file: FileFactory,
  project: ProjectFactory,
  vulnerability: VulnerabilityFactory,
  'unknown-analysis-status': UnknownAnalysisStatus,
  'organization-member': OrganizationMember,
  user: User,
  'upload-app': UploadApp,
  submission: Submission,
  'sbom-file': SbomFileFactory,
  'sbom-project': SbomProjectFactory,
};

export { MIRAGE_FACTORIES };
