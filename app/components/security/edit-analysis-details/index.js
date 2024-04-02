import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';

export default class EditAnalysisDetailsComponent extends Component {
  @service session;
  @service store;
  @service notifications;
  @service ajax;

  @tracked findingId = 0;
  @tracked findings = [];
  @tracked addedFindings = null;
  @tracked findingTitle = '';
  @tracked findingDescription = '';
  @tracked isInValidCvssBase = false;
  @tracked isUploading = false;
  @tracked savingAnalysis = false;
  @tracked analysisDetails = {};
  @tracked deletedFinding = null;
  @tracked showRemoveFindingConfirmBox = false;
  @tracked showClearAllFindingsConfirmBox = false;
  @tracked showMarkPassedConfirmBox = false;
  @tracked showRemoveFileConfirmBox = false;

  risks = ENUMS.RISK.CHOICES;
  scopes = ENUMS.SCOPE.CHOICES;
  statuses = ENUMS.ANALYSIS_STATUS.CHOICES;
  attackVectors = ENUMS.ATTACK_VECTOR.CHOICES;
  integrityImpacts = ENUMS.INTEGRITY_IMPACT.CHOICES;
  userInteractions = ENUMS.USER_INTERACTION.CHOICES;
  attackComplexities = ENUMS.ATTACK_COMPLEXITY.CHOICES;
  requiredPrevileges = ENUMS.PRIVILEGES_REQUIRED.CHOICES;
  availabilityImpacts = ENUMS.AVAILABILITY_IMPACT.CHOICES;
  confidentialityImpacts = ENUMS.CONFIDENTIALITY_IMPACT.CHOICES;

  constructor() {
    super(...arguments);
    this.getAnalysisDetails.perform();
  }

  get analysis() {
    return this.args.analysis;
  }

  get ireneFilePath() {
    if (this.analysisDetails.file) {
      const fileId = this.analysisDetails.file.get('id');
      const ireneHost = ENV.ireneHost;
      return [ireneHost, 'file', fileId].join('/');
    }

    return '';
  }

  get owaspMobile2024Exists() {
    return this.analysisDetails.owaspmobile2024;
  }

  get owasps() {
    return this.store.findAll('owasp');
  }

  get owaspmobile2024s() {
    return this.store.findAll('owaspmobile2024');
  }

  get owaspapi2023s() {
    return this.store.findAll('owaspapi2023');
  }

  get pcidsses() {
    return this.store.findAll('pcidss');
  }

  get hipaas() {
    return this.store.findAll('hipaa');
  }

  get mstgs() {
    return this.store.findAll('mstg');
  }

  get masvses() {
    return this.store.findAll('masvs');
  }

  get asvses() {
    return this.store.findAll('asvs');
  }

  get cwes() {
    return this.store.findAll('cwe');
  }

  get gdprs() {
    return this.store.findAll('gdpr');
  }

  get nistsp80053s() {
    return this.store.findAll('nistsp80053');
  }

  get nistsp800171s() {
    return this.store.findAll('nistsp800171');
  }

  get allFindings() {
    let findingId = this.findingId;
    const findings = this.addedFindings || this.analysisDetails.findings;
    if (findings) {
      findings.forEach((finding) => {
        findingId = findingId + 1;
        finding.id = findingId;
      });
      return findings;
    }

    return null;
  }

  get isPassedRisk() {
    return this.analysisDetails?.risk == ENUMS.RISK.NONE;
  }

  get availableFindings() {
    return this.allFindings.filter((finding) => {
      const deletedFinding = this.deletedFinding;
      return finding.id !== deletedFinding;
    });
  }

  get isEmptyCvssVector() {
    return (
      this.analysisDetails.attackVector == ENUMS.ATTACK_VECTOR.UNKNOWN &&
      this.analysisDetails.attackComplexity ==
        ENUMS.ATTACK_COMPLEXITY.UNKNOWN &&
      this.analysisDetails.privilegesRequired ==
        ENUMS.PRIVILEGES_REQUIRED.UNKNOWN &&
      this.analysisDetails.userInteraction == ENUMS.USER_INTERACTION.UNKNOWN &&
      this.analysisDetails.scope == ENUMS.SCOPE.UNKNOWN &&
      this.analysisDetails.confidentialityImpact ==
        ENUMS.CONFIDENTIALITY_IMPACT.UNKNOWN &&
      this.analysisDetails.integrityImpact == ENUMS.INTEGRITY_IMPACT.UNKNOWN &&
      this.analysisDetails.availabilityImpact ==
        ENUMS.AVAILABILITY_IMPACT.UNKNOWN
    );
  }

  get isValidCvssVector() {
    const isValid =
      ENUMS.ATTACK_VECTOR.BASE_VALUES.includes(
        this.analysisDetails.attackVector
      ) &&
      ENUMS.ATTACK_COMPLEXITY.BASE_VALUES.includes(
        this.analysisDetails.attackComplexity
      ) &&
      ENUMS.PRIVILEGES_REQUIRED.BASE_VALUES.includes(
        this.analysisDetails.privilegesRequired
      ) &&
      ENUMS.USER_INTERACTION.BASE_VALUES.includes(
        this.analysisDetails.userInteraction
      ) &&
      ENUMS.SCOPE.BASE_VALUES.includes(this.analysisDetails.scope) &&
      ENUMS.CONFIDENTIALITY_IMPACT.BASE_VALUES.includes(
        this.analysisDetails.confidentialityImpact
      ) &&
      ENUMS.INTEGRITY_IMPACT.BASE_VALUES.includes(
        this.analysisDetails.integrityImpact
      ) &&
      ENUMS.AVAILABILITY_IMPACT.BASE_VALUES.includes(
        this.analysisDetails.availabilityImpact
      );

    return this.isEmptyCvssVector || isValid;
  }

  @action confirmCallback(key) {
    if (key === 'findings') {
      this.analysisDetails.findings = [];
      this.addedFindings = [];
      this.showClearAllFindingsConfirmBox = false;
      return;
    }
    if (key === 'attachment') {
      this.deleteFile(this.deletedFile);
      this.showRemoveFileConfirmBox = false;
      return;
    }
    if (key === 'finding') {
      const availableFindings = this.availableFindings;
      this.addedFindings = availableFindings;
      this.analysisDetails.findings = availableFindings;
      this.showRemoveFindingConfirmBox = false;
      return;
    }
    if (key === 'passed') {
      this.analysisDetails.attackVector = ENUMS.ATTACK_VECTOR.PHYSICAL;
      this.analysisDetails.attackComplexity = ENUMS.ATTACK_COMPLEXITY.HIGH;
      this.analysisDetails.privilegesRequired = ENUMS.PRIVILEGES_REQUIRED.HIGH;
      this.analysisDetails.userInteraction = ENUMS.USER_INTERACTION.REQUIRED;

      this.analysisDetails.scope = ENUMS.SCOPE.UNCHANGED;
      this.analysisDetails.confidentialityImpact =
        ENUMS.CONFIDENTIALITY_IMPACT.NONE;

      this.analysisDetails.integrityImpact = ENUMS.INTEGRITY_IMPACT.NONE;
      this.analysisDetails.availabilityImpact = ENUMS.AVAILABILITY_IMPACT.NONE;
      this.analysisDetails.cvssVector =
        'CVSS:3.0/AV:P/AC:H/PR:H/UI:R/S:U/C:N/I:N/A:N';
      this.updateCVSSScore();
      this.analysisDetails.status = ENUMS.ANALYSIS_STATUS.COMPLETED;
      this.updateAnalysis.perform();
      this.notifications.success('Analysis Updated');
      this.showMarkPassedConfirmBox = false;
    }
  }

  @action deleteFile(id) {
    const attachment = this.store.peekRecord('security/attachment', id);
    if (attachment) {
      attachment.deleteRecord();
      attachment.save();
    }
  }

  @action updateCVSSScore() {
    if (this.isEmptyCvssVector) {
      this.isInValidCvssBase = false;
      return;
    }
    if (this.isValidCvssVector) {
      const attackVector = this.analysisDetails.attackVector;
      const attackComplexity = this.analysisDetails.attackComplexity;
      const privilegesRequired = this.analysisDetails.privilegesRequired;
      const userInteraction = this.analysisDetails.userInteraction;
      const scope = this.analysisDetails.scope;
      const confidentialityImpact = this.analysisDetails.confidentialityImpact;
      const integrityImpact = this.analysisDetails.integrityImpact;
      const availabilityImpact = this.analysisDetails.availabilityImpact;

      const vector = `CVSS:3.0/AV:${attackVector}/AC:${attackComplexity}/PR:${privilegesRequired}/UI:${userInteraction}/S:${scope}/C:${confidentialityImpact}/I:${integrityImpact}/A:${availabilityImpact}`;
      const url = `cvss?vector=${vector}`;
      this.ajax.request(url).then(
        (data) => {
          this.analysisDetails.cvssBase = data.cvss_base;
          this.analysisDetails.risk = data.risk;
          this.analysisDetails.cvssVector = vector;
          this.isInValidCvssBase = false;
        },
        () => {
          this.notifications.error(
            'Sorry something went wrong, please try again'
          );
        }
      );
      return;
    }
    this.isInValidCvssBase = true;
  }

  @action uploadFileWrapper(file) {
    this.uploadFile.perform(file);
  }

  @action selectStatus(param) {
    this.analysisDetails.status = param;
  }

  @action selectAttackVector(param) {
    this.analysisDetails.attackVector = param.value;
    this.updateCVSSScore();
  }

  @action selectAttackComplexity(param) {
    this.analysisDetails.attackComplexity = param.value;
    this.updateCVSSScore();
  }

  @action selectRequiredPrevilege(param) {
    this.analysisDetails.privilegesRequired = param.value;
    this.updateCVSSScore();
  }

  @action selectUserInteraction(param) {
    this.analysisDetails.userInteraction = param.value;
    this.updateCVSSScore();
  }

  @action selectScope(param) {
    this.analysisDetails.scope = param.value;
    this.updateCVSSScore();
  }

  @action selectConfidentialityImpact(param) {
    this.analysisDetails.confidentialityImpact = param.value;
    this.updateCVSSScore();
  }

  @action selectIntegrityImpact(param) {
    this.analysisDetails.integrityImpact = param.value;
    this.updateCVSSScore();
  }

  @action selectAvailabilityImpact(param) {
    this.analysisDetails.availabilityImpact = param.value;
    this.updateCVSSScore();
  }

  @action selectOwaspCategory(param) {
    this.analysisDetails.owasp = param;
  }

  @action selectOwaspMobile2024Category(param) {
    this.analysisDetails.owaspmobile2024 = param;
  }

  @action selectOwaspApi2023Category(param) {
    this.analysisDetails.owaspapi2023 = param;
  }

  @action selectPcidssCategory(param) {
    this.analysisDetails.pcidss = param;
  }

  @action selectHipaaCategory(param) {
    this.analysisDetails.hipaa = param;
  }

  @action selectMstgCategory(param) {
    this.analysisDetails.mstg = param;
  }

  @action selectMasvsCategory(param) {
    this.analysisDetails.masvs = param;
  }

  @action selectAsvsCategory(param) {
    this.analysisDetails.asvs = param;
  }

  @action selectCWECategory(param) {
    this.analysisDetails.cwe = param;
  }

  @action selectGDPRCategory(param) {
    this.analysisDetails.gdpr = param;
  }

  @action selectNistsp800171Category(param) {
    this.analysisDetails.nistsp800171 = param;
  }

  @action selectNistsp80053Category(param) {
    this.analysisDetails.nistsp80053 = param;
  }

  @action selectOverriddenRisk(param) {
    this.analysisDetails.overriddenRisk = param;
  }

  @action addFinding() {
    const findingTitle = this.findingTitle;
    const findingDescription = this.findingDescription;
    if (isEmpty(findingDescription)) {
      return this.notifications.error('Please fill the description');
    }
    let findingId = this.findingId;
    findingId = findingId + 1;
    const findings = this.analysisDetails.findings;
    const newFinding = {
      id: findingId,
      title: findingTitle,
      description: findingDescription,
    };
    findings.push(newFinding);
    this.findingId = findingId;
    this.addedFindings = findings;
    this.notifications.success('Finding Added');
    this.findingTitle = '';
    this.findingDescription = '';
  }

  @action openClearAllFindingConfirmBox() {
    this.showClearAllFindingsConfirmBox = true;
  }

  @action openRemoveFindingConfirmBox(param) {
    this.deletedFinding = param;
    this.showRemoveFindingConfirmBox = true;
  }

  @action openRemoveFileConfirmBox(param) {
    this.deletedFile = param;
    this.showRemoveFileConfirmBox = true;
  }

  @action openMarkPassedConfirmBox() {
    this.showMarkPassedConfirmBox = true;
  }

  @action downloadAttachment(id) {
    const url = [
      ENV.endpoints.uploadFile,
      id,
      ENV.endpoints.downloadAttachment,
    ].join('/');
    return this.ajax.request(url, { namespace: 'api/hudson-api' }).then(
      (data) => {
        window.open(data.url, '_blank');
      },
      (error) => {
        for (error of error.errors) {
          this.notifications.error(error.detail.error);
        }
      }
    );
  }

  @action resetOverriddenAnalysis() {
    this.analysisDetails.overriddenRisk = null;
    this.analysisDetails.overriddenRiskComment = null;
  }

  @task(function* () {
    this.analysisDetails.cvssBase = -1.0;
    this.analysisDetails.cvssVector = '';

    this.analysisDetails.attackVector = ENUMS.ATTACK_VECTOR.UNKNOWN;
    this.analysisDetails.attackComplexity = ENUMS.ATTACK_COMPLEXITY.UNKNOWN;
    this.analysisDetails.privilegesRequired = ENUMS.PRIVILEGES_REQUIRED.UNKNOWN;
    this.analysisDetails.userInteraction = ENUMS.USER_INTERACTION.UNKNOWN;
    this.analysisDetails.scope = ENUMS.SCOPE.UNKNOWN;
    this.analysisDetails.confidentialityImpact =
      ENUMS.CONFIDENTIALITY_IMPACT.UNKNOWN;
    this.analysisDetails.integrityImpact = ENUMS.INTEGRITY_IMPACT.UNKNOWN;
    this.analysisDetails.availabilityImpact = ENUMS.AVAILABILITY_IMPACT.UNKNOWN;

    this.isInValidCvssBase = false;
    this.analysisDetails.risk = ENUMS.RISK.UNKNOWN;
    yield;
  })
  clearCvss;

  @task(function* (param) {
    this.savingAnalysis = true;
    try {
      yield this.updateAnalysis.perform(param);
      if (param === 'back') {
        yield getOwner(this)
          .lookup('route:authenticated')
          .transitionTo(
            'authenticated.security.file',
            this.analysisDetails.file.get('id')
          );
      }
      this.notifications.success('Analysis Updated');
      this.savingAnalysis = false;
    } catch (error) {
      let errMsg = this.tPleaseTryAgain;
      if (error.errors && error.errors.length) {
        errMsg = error.errors[0].detail || errMsg;
      } else if (error.message) {
        errMsg = error.message;
      }
      this.savingAnalysis = false;
      this.notifications.error(errMsg);
    }
  })
  saveAnalysis;

  @task(function* () {
    const isValidCvssVector = yield this.isValidCvssVector;
    if (!isValidCvssVector) {
      throw new Error('Invalid CVSS metrics');
    }

    const risk = this.analysisDetails.risk;
    const owasp = this.analysisDetails.owasp;
    const owaspmobile2024 = this.analysisDetails.owaspmobile2024;
    const owaspapi2023 = this.analysisDetails.owaspapi2023;
    const pcidss = this.analysisDetails.pcidss;
    const hipaa = this.analysisDetails.hipaa;
    const masvs = this.analysisDetails.masvs;
    const mstg = this.analysisDetails.mstg;
    const asvs = this.analysisDetails.asvs;
    const cwe = this.analysisDetails.cwe;
    const gdpr = this.analysisDetails.gdpr;
    const nistsp800171 = this.analysisDetails.nistsp800171;
    const nistsp80053 = this.analysisDetails.nistsp80053;

    let status = this.analysisDetails.status;
    if (typeof status === 'object') {
      status = status.value;
    }
    const analysisid = this.analysis.analysisid;
    const findings = this.analysisDetails.findings;
    let overriddenRisk = this.analysisDetails.overriddenRisk;
    if (typeof overriddenRisk === 'object' && !isEmpty(overriddenRisk)) {
      overriddenRisk = overriddenRisk.value;
    }
    const overriddenRiskComment = this.analysisDetails.overriddenRiskComment;
    const overriddenRiskToProfile =
      this.analysisDetails.overriddenRiskToProfile;
    const attackVector = this.analysisDetails.attackVector;
    const attackComplexity = this.analysisDetails.attackComplexity;
    const privilegesRequired = this.analysisDetails.privilegesRequired;
    const userInteraction = this.analysisDetails.userInteraction;
    const scope = this.analysisDetails.scope;
    const confidentialityImpact = this.analysisDetails.confidentialityImpact;
    const integrityImpact = this.analysisDetails.integrityImpact;
    const availabilityImpact = this.analysisDetails.availabilityImpact;

    const cvssVector = this.analysisDetails.cvssVector;
    const data = {
      risk,
      status,
      owasp: owasp.map((a) => a.id),
      owaspmobile2024: owaspmobile2024.map((a) => a.id),
      owaspapi2023: owaspapi2023.map((a) => a.id),
      pcidss: pcidss.map((a) => a.id),
      hipaa: hipaa.map((a) => a.id),
      mstg: mstg.map((a) => a.id),
      masvs: masvs.map((a) => a.id),
      asvs: asvs.map((a) => a.id),
      cwe: cwe.map((a) => a.id),
      gdpr: gdpr.map((a) => a.id),
      findings,
      nistsp80053: nistsp80053.map((a) => a.id),
      nistsp800171: nistsp800171.map((a) => a.id),
      overridden_risk: overriddenRisk,
      overridden_risk_comment: overriddenRiskComment,
      overridden_risk_to_profile: overriddenRiskToProfile,
      cvss_vector: cvssVector,
      attack_vector: attackVector,
      attack_complexity: attackComplexity,
      privileges_required: privilegesRequired,
      user_interaction: userInteraction,
      scope,
      confidentiality_impact: confidentialityImpact,
      integrity_impact: integrityImpact,
      availability_impact: availabilityImpact,
    };
    const url = [ENV.endpoints.analyses, analysisid].join('/');
    yield this.ajax.put(url, {
      namespace: 'api/hudson-api',
      data: JSON.stringify(data),
      contentType: 'application/json',
    });
  })
  updateAnalysis;

  @task(function* (file) {
    this.isUploading = true;
    const fileName = file.name;
    const data = {
      name: fileName,
    };
    const analysisid = this.analysis.analysisid;
    try {
      const fileData = yield this.ajax.post(ENV.endpoints.uploadFile, {
        namespace: 'api/hudson-api',
        data,
      });
      yield file.uploadBinary(fileData.url, {
        method: 'PUT',
      });
      const fileDetailsData = {
        file_uuid: fileData.file_uuid,
        file_key: fileData.file_key,
        file_key_signed: fileData.file_key_signed,
        name: fileName,
        analysis: analysisid,
        content_type: 'ANALYSIS',
      };
      yield this.ajax.post(ENV.endpoints.uploadedAttachment, {
        namespace: 'api/hudson-api',
        data: fileDetailsData,
      });
      yield this.updateAnalysis.perform();
      this.isUploading = false;
      this.notifications.success('File Uploaded Successfully');
      const analysisObj = yield this.store.findRecord(
        'security/analysis',
        this.analysis.analysisid
      );
      this.analysisDetails = analysisObj;
    } catch (error) {
      this.isUploading = false;
      this.notifications.error('Sorry something went wrong, please try again');
      return;
    }
  })
  uploadFile;

  @task(function* () {
    try {
      this.analysisDetails = yield this.store.findRecord(
        'security/analysis',
        this.analysis.analysisid
      );
    } catch (error) {
      this.notifications.error('Something went wrong, please try again');
    }
  })
  getAnalysisDetails;
}
