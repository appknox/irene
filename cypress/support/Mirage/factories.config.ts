import { FactoryDefinition } from 'miragejs/-types';

import { BASE_FACTORY_DEF } from 'irene/mirage/factories/base';
import FileFactory, { FILE_FACTORY_DEF } from 'irene/mirage/factories/file';
import User, { USER_FACTORY_DEF } from 'irene/mirage/factories/user';
import FileRiskFactory, {
  FILE_RISK_FACTORY_DEF,
} from 'irene/mirage/factories/file-risk';

import AnalysisFactory, {
  ANALYSIS_FACTORY_DEF,
} from 'irene/mirage/factories/analysis';

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

import UploadAppLink, {
  UPLOAD_APP_LINK_FACTORY_DEF,
} from 'irene/mirage/factories/upload-app-link';

import Submission, {
  SUBMISSION_FACTORY_DEF,
} from 'irene/mirage/factories/submission';

import DeviceFactory, {
  DEVICE_FACTORY_DEF,
} from 'irene/mirage/factories/device';

// Extract factory method return values from a factory definition
export type FlattenFactoryMethods<T> = {
  [K in keyof T]: T[K] extends (n: number) => infer V ? V : T[K];
};

/**
 * Represents api responses for each model type
 */
export type IncludeBaseFactoryProps<T> = FlattenFactoryMethods<T> &
  FlattenFactoryMethods<typeof BASE_FACTORY_DEF>;

export type AnalysisModelFactoryDef = FlattenFactoryMethods<
  typeof ANALYSIS_FACTORY_DEF & {
    id: number;
    vulnerability: number;
    overridden_by: string;
    overridden_date: Date;
    overridden_risk: number;
    overridden_risk_comment: string;
    override_criteria: string;
    file: number;
  }
>;

export interface MirageFactoryDefProps {
  user: FlattenFactoryMethods<typeof USER_FACTORY_DEF>;
  'upload-app': FlattenFactoryMethods<typeof UPLOAD_APP_FACTORY_DEF>;
  'upload-app-link': FlattenFactoryMethods<typeof UPLOAD_APP_LINK_FACTORY_DEF>;
  'sbom-file': FlattenFactoryMethods<typeof SBOM_FILE_FACTORY_DEF>;
  'sbom-project': FlattenFactoryMethods<typeof SBOM_PROJECT_FACTORY_DEF>;
  'available-manual-device': FlattenFactoryMethods<typeof DEVICE_FACTORY_DEF>;
  'file-risk': FlattenFactoryMethods<typeof FILE_RISK_FACTORY_DEF>;

  submission: FlattenFactoryMethods<
    typeof SUBMISSION_FACTORY_DEF & {
      file: number;
    }
  >;

  'organization-member': FlattenFactoryMethods<
    typeof ORGANIZATION_MEMBER_FACTORY_DEF
  >;

  // Contains base factory props
  project: IncludeBaseFactoryProps<typeof PROJECT_FACTORY_DEF> & {
    last_file: IncludeBaseFactoryProps<typeof FILE_FACTORY_DEF>;
  };

  vulnerability: IncludeBaseFactoryProps<typeof VULNERABLITY_FACTORY_DEF>;

  analysis: AnalysisModelFactoryDef;

  'unknown-analysis-status': IncludeBaseFactoryProps<
    typeof UNKNOWN_ANALYSIS_STATUS_FACTORY_DEF
  >;

  file: IncludeBaseFactoryProps<
    typeof FILE_FACTORY_DEF & {
      project: number;
      executable_name: string;
      analyses: Array<AnalysisModelFactoryDef>;
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
  analysis: AnalysisFactory,
  'unknown-analysis-status': UnknownAnalysisStatus,
  'organization-member': OrganizationMember,
  user: User,
  'upload-app': UploadApp,
  'upload-app-link': UploadAppLink,
  submission: Submission,
  'sbom-file': SbomFileFactory,
  'sbom-project': SbomProjectFactory,
  'available-manual-device': DeviceFactory,
  'file-risk': FileRiskFactory,
};

export { MIRAGE_FACTORIES };
