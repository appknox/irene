// Mirage Factories
import FileFactory from '../../../mirage/factories/file';
import ProjectFactory from '../../../mirage/factories/project';
import VulnerabilityFactory from '../../../mirage/factories/vulnerability';
import UnknownAnalysisStatus from '../../../mirage/factories/unknown-analysis-status';
import OrganizationMember from '../../../mirage/factories/organization-member';

/**
 * Mirage Model Factories for data mocking
 */

const MIRAGE_FACTORIES = {
  file: FileFactory,
  project: ProjectFactory,
  vulnerability: VulnerabilityFactory,
  'unknown-analysis-status': UnknownAnalysisStatus,
  'organization-member': OrganizationMember,
};

export { MIRAGE_FACTORIES };
