/* eslint-disable ember/no-classic-components, prettier/prettier, ember/no-classic-classes, ember/require-tagless-components, ember/avoid-leaking-state-in-ember-objects, ember/no-get, ember/require-return-from-computed, ember/no-actions-hash */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { on } from '@ember/object/evented';
import { isEmpty } from '@ember/utils';
import { getOwner } from '@ember/application';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import { task } from 'ember-concurrency';


export default Component.extend({
  findingId: 0,
  findings: [],
  findingTitle: "",
  findingDescription: "",
  isInValidCvssBase: false,

  session: service(),

  risks: ENUMS.RISK.CHOICES,
  scopes: ENUMS.SCOPE.CHOICES,
  statuses: ENUMS.ANALYSIS_STATUS.CHOICES,
  attackVectors: ENUMS.ATTACK_VECTOR.CHOICES,
  integrityImpacts: ENUMS.INTEGRITY_IMPACT.CHOICES,
  userInteractions: ENUMS.USER_INTERACTION.CHOICES,
  attackComplexities: ENUMS.ATTACK_COMPLEXITY.CHOICES,
  requiredPrevileges: ENUMS.PRIVILEGES_REQUIRED.CHOICES,
  availabilityImpacts: ENUMS.AVAILABILITY_IMPACT.CHOICES,
  confidentialityImpacts: ENUMS.CONFIDENTIALITY_IMPACT.CHOICES,

  ireneFilePath: computed('analysisDetails.file.id', function() {
    const fileId = this.get("analysisDetails.file.id");
    const ireneHost = ENV.ireneHost;
    return [ireneHost, "file", fileId].join('/');
  }),

  analysisDetails: computed('analysis.analysisid', 'store', function() {
    return this.get("store").findRecord('security/analysis', this.get("analysis.analysisid"));
  }),

  owasps: computed('store', function() {
    return this.get("store").findAll("owasp");
  }),

  pcidsses: computed('store', function() {
    return this.get("store").findAll("pcidss");
  }),

  hipaas: computed('store', function() {
    return this.get("store").findAll("hipaa");
  }),

  mstgs: computed('store', function() {
    return this.get("store").findAll("mstg");
  }),

  asvses: computed('store', function() {
    return this.get("store").findAll("asvs");
  }),

  cwes: computed('store', function() {
    return this.get("store").findAll("cwe");
  }),

  gdprs: computed('store', function() {
    return this.get("store").findAll("gdpr");
  }),

  allFindings: computed('addedFindings', 'analysisDetails.findings', 'findingId', function() {
    let findingId = this.get("findingId");
    const findings = this.get("addedFindings") || this.get("analysisDetails.findings");
    if(findings) {
      findings.forEach((finding) => {
        findingId = findingId + 1;
        finding.id = findingId;
        this.set("findingId", findingId); // eslint-disable-line
      });
      return findings;
    }
  }),

  isPassedRisk: computed('analysisDetails.risk', function() {
    return this.get('analysisDetails.risk') == ENUMS.RISK.NONE;
  }),

  confirmCallback(key) {
    if(key === "findings") {
      this.set("analysisDetails.findings", []);
      this.set("addedFindings", []);
      return this.set("showClearAllFindingsConfirmBox", false);
    }
    if(key === "attachment") {
      this.deleteFile(this.get("deletedFile"));
      return this.set("showRemoveFileConfirmBox", false);
    }
    if(key === "finding") {
      const availableFindings = this.get("availableFindings");
      this.set("addedFindings", availableFindings);
      this.set("analysisDetails.findings", availableFindings);
      return this.set("showRemoveFindingConfirmBox", false);
    }
    if(key === "passed") {
      this.set("analysisDetails.attackVector", ENUMS.ATTACK_VECTOR.PHYSICAL);
      this.set("analysisDetails.attackComplexity", ENUMS.ATTACK_COMPLEXITY.HIGH);
      this.set("analysisDetails.privilegesRequired", ENUMS.PRIVILEGES_REQUIRED.HIGH);
      this.set("analysisDetails.userInteraction", ENUMS.USER_INTERACTION.REQUIRED);
      this.set("analysisDetails.scope", ENUMS.SCOPE.UNCHANGED);
      this.set("analysisDetails.confidentialityImpact", ENUMS.CONFIDENTIALITY_IMPACT.NONE);
      this.set("analysisDetails.integrityImpact", ENUMS.INTEGRITY_IMPACT.NONE);
      this.set("analysisDetails.availabilityImpact", ENUMS.AVAILABILITY_IMPACT.NONE);
      this.set("analysisDetails.cvssVector", "CVSS:3.0/AV:P/AC:H/PR:H/UI:R/S:U/C:N/I:N/A:N");
      this.updateCVSSScore();
      this.set("analysisDetails.status", ENUMS.ANALYSIS_STATUS.COMPLETED);
      this.get("updateAnalysis").perform();
      this.get("notify").success("Analysis Updated");
      return this.set("showMarkPassedConfirmBox", false);
    }
  },

  availableFindings: computed.filter('allFindings', function(allFinding) {
    const deletedFinding = this.get("deletedFinding");
    return allFinding.id !== deletedFinding;
  }),

  deleteFile(id) {
    const attachment = this.get("store").peekRecord('security/attachment', id);
    if(attachment) {
      attachment.deleteRecord();
      attachment.save();
    }
  },

  isEmptyCvssVector() {
    if (
      this.get("analysisDetails.attackVector") == ENUMS.ATTACK_VECTOR.UNKNOWN  &&
      this.get("analysisDetails.attackComplexity") == ENUMS.ATTACK_COMPLEXITY.UNKNOWN  &&
      this.get("analysisDetails.privilegesRequired") == ENUMS.PRIVILEGES_REQUIRED.UNKNOWN  &&
      this.get("analysisDetails.userInteraction") == ENUMS.USER_INTERACTION.UNKNOWN  &&
      this.get("analysisDetails.scope") == ENUMS.SCOPE.UNKNOWN &&
      this.get("analysisDetails.confidentialityImpact") == ENUMS.CONFIDENTIALITY_IMPACT.UNKNOWN  &&
      this.get("analysisDetails.integrityImpact") == ENUMS.INTEGRITY_IMPACT.UNKNOWN  &&
      this.get("analysisDetails.availabilityImpact") == ENUMS.AVAILABILITY_IMPACT.UNKNOWN
    ) {
      return true;
    }
    return false
  },

  isValidCvssVector() {
    if (this.isEmptyCvssVector()) {
      return true;
    }
    if (
      ENUMS.ATTACK_VECTOR.BASE_VALUES.includes(this.get("analysisDetails.attackVector")) &&
      ENUMS.ATTACK_COMPLEXITY.BASE_VALUES.includes(this.get("analysisDetails.attackComplexity")) &&
      ENUMS.PRIVILEGES_REQUIRED.BASE_VALUES.includes(this.get("analysisDetails.privilegesRequired")) &&
      ENUMS.USER_INTERACTION.BASE_VALUES.includes(this.get("analysisDetails.userInteraction")) &&
      ENUMS.SCOPE.BASE_VALUES.includes(this.get("analysisDetails.scope")) &&
      ENUMS.CONFIDENTIALITY_IMPACT.BASE_VALUES.includes(this.get("analysisDetails.confidentialityImpact")) &&
      ENUMS.INTEGRITY_IMPACT.BASE_VALUES.includes(this.get("analysisDetails.integrityImpact")) &&
      ENUMS.AVAILABILITY_IMPACT.BASE_VALUES.includes(this.get("analysisDetails.availabilityImpact"))
    ) {
      return true;
    }
    return false;
  },

  updateCVSSScore() {
    if (this.isEmptyCvssVector()) {
      this.set("isInValidCvssBase", false);
      return;
    }
    if (this.isValidCvssVector()) {
      const attackVector = this.get("analysisDetails.attackVector");
      const attackComplexity = this.get("analysisDetails.attackComplexity");
      const privilegesRequired = this.get("analysisDetails.privilegesRequired");
      const userInteraction = this.get("analysisDetails.userInteraction");
      const scope = this.get("analysisDetails.scope");
      const confidentialityImpact = this.get("analysisDetails.confidentialityImpact");
      const integrityImpact = this.get("analysisDetails.integrityImpact");
      const availabilityImpact = this.get("analysisDetails.availabilityImpact");

      const vector =`CVSS:3.0/AV:${attackVector}/AC:${attackComplexity}/PR:${privilegesRequired}/UI:${userInteraction}/S:${scope}/C:${confidentialityImpact}/I:${integrityImpact}/A:${availabilityImpact}`;
      const url = `cvss?vector=${vector}`;
      this.get("ajax").request(url)
        .then((data) => {
          this.set("analysisDetails.cvssBase", data.cvss_base);
          this.set("analysisDetails.risk", data.risk);
          this.set("analysisDetails.cvssVector", vector);
          this.set("isInValidCvssBase", false);
        }, () => {
          this.get("notify").error("Sorry something went wrong, please try again");
        });
      return;
    }
    this.set("isInValidCvssBase", true);
  },

  clearCvss: task(function * () {
    this.set('analysisDetails.cvssBase', -1.0);
    this.set('analysisDetails.cvssVector', '');

    this.set('analysisDetails.attackVector', ENUMS.ATTACK_VECTOR.UNKNOWN);
    this.set('analysisDetails.attackComplexity', ENUMS.ATTACK_COMPLEXITY.UNKNOWN);
    this.set('analysisDetails.privilegesRequired', ENUMS.PRIVILEGES_REQUIRED.UNKNOWN);
    this.set('analysisDetails.userInteraction', ENUMS.USER_INTERACTION.UNKNOWN);
    this.set('analysisDetails.scope', ENUMS.SCOPE.UNKNOWN);
    this.set('analysisDetails.confidentialityImpact', ENUMS.CONFIDENTIALITY_IMPACT.UNKNOWN);
    this.set('analysisDetails.integrityImpact', ENUMS.INTEGRITY_IMPACT.UNKNOWN);
    this.set('analysisDetails.availabilityImpact', ENUMS.AVAILABILITY_IMPACT.UNKNOWN);

    this.set("isInValidCvssBase", false);
    yield this.set('analysisDetails.risk', ENUMS.RISK.UNKNOWN);
  }),

  saveAnalysis: task(function * (param){
    yield this.get('updateAnalysis').perform(param);
    if(param==="back") {
      yield getOwner(this).lookup('route:authenticated').transitionTo("authenticated.security.file", this.get("analysisDetails.file.id"));
    }
  }).evented(),

  saveAnalysisSucceeded: on('saveAnalysis:succeeded', function() {
    this.get('notify').success('Analysis Updated');
  }),

  saveAnalysisErrored: on('saveAnalysis:errored', function(_, error) {
    let errMsg = this.get('tPleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if(error.message) {
      errMsg = error.message;
    }
    this.get("notify").error(errMsg);
  }),

  updateAnalysis: task(function * () {
    const isValidCvssVector = yield this.isValidCvssVector();
    if (!isValidCvssVector) {
      throw new Error("Invalid CVSS metrics");
    }

    const risk = this.get("analysisDetails.risk");
    const owasp = this.get("analysisDetails.owasp");
    const pcidss = this.get("analysisDetails.pcidss");
    const hipaa = this.get("analysisDetails.hipaa");
    const mstg = this.get("analysisDetails.mstg");
    const asvs = this.get("analysisDetails.asvs");
    const cwe = this.get("analysisDetails.cwe");
    const gdpr = this.get("analysisDetails.gdpr");
    let status = this.get("analysisDetails.status");
    if(typeof status === "object") {
      status = status.value;
    }
    const analysisid= this.get("analysis.analysisid");
    const findings = this.get("analysisDetails.findings");
    let overriddenRisk = this.get("analysisDetails.overriddenRisk");
    if(typeof overriddenRisk === "object" && !isEmpty(overriddenRisk)) {
      overriddenRisk = overriddenRisk.value;
    }
    const overriddenRiskComment = this.get("analysisDetails.overriddenRiskComment");
    const overriddenRiskToProfile = this.get("analysisDetails.overriddenRiskToProfile");
    const attackVector = this.get("analysisDetails.attackVector");
    const attackComplexity = this.get("analysisDetails.attackComplexity");
    const privilegesRequired = this.get("analysisDetails.privilegesRequired");
    const userInteraction = this.get("analysisDetails.userInteraction");
    const scope = this.get("analysisDetails.scope");
    const confidentialityImpact = this.get("analysisDetails.confidentialityImpact");
    const integrityImpact = this.get("analysisDetails.integrityImpact");
    const availabilityImpact = this.get("analysisDetails.availabilityImpact");

    const cvssVector = this.get("analysisDetails.cvssVector");
    const data = {
      risk,
      status,
      owasp: owasp.map(a=>a.get('id')),
      pcidss: pcidss.map(a=>a.get('id')),
      hipaa: hipaa.map(a=>a.get('id')),
      mstg: mstg.map(a=>a.get('id')),
      asvs: asvs.map(a=>a.get('id')),
      cwe: cwe.map(a=>a.get('id')),
      gdpr: gdpr.map(a=>a.get('id')),
      findings,
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
      availability_impact: availabilityImpact
    };
    const url = [ENV.endpoints.analyses, analysisid].join('/');
    yield this.get("ajax").put(url,{ namespace: 'api/hudson-api', data: JSON.stringify(data), contentType: 'application/json' });
  }),

  uploadFile: task(function * (file) {
      const fileName = file.blob.name;
      const data = {
        name: fileName
      };
      const analysisid= this.get("analysis.analysisid");
      try {
        var fileData = yield this.get("ajax").post(ENV.endpoints.uploadFile,{namespace: 'api/hudson-api', data});
        yield file.uploadBinary(fileData.url, {
          method: 'PUT'
        });
        const fileDetailsData = {
          file_uuid: fileData.file_uuid,
          file_key: fileData.file_key,
          file_key_signed: fileData.file_key_signed,
          name: fileName,
          analysis: analysisid,
          content_type: "ANALYSIS"
        };
        yield this.get("ajax").post(ENV.endpoints.uploadedAttachment,{namespace: 'api/hudson-api', data: fileDetailsData});
        yield this.get('updateAnalysis').perform()
        this.set("isUploading", false);
        this.get("notify").success("File Uploaded Successfully");
        const analysisObj = yield this.get("store").findRecord('security/analysis', this.get("analysis.analysisid"));
        this.set('analysisDetails', analysisObj);
      } catch(error) {
        this.set("isUploading", false);
        this.get("notify").error("Sorry something went wrong, please try again");
        return;
      }
    }),


  actions: {

    uploadFileWrapper(file){
      this.get('uploadFile').perform(file)
    },
    selectStatus(param) {
      this.set('analysisDetails.status', param);
    },

    selectAttackVector(param) {
      this.set('analysisDetails.attackVector', param.value);
      this.updateCVSSScore();
    },

    selectAttackComplexity(param) {
      this.set('analysisDetails.attackComplexity', param.value);
      this.updateCVSSScore();
    },

    selectRequiredPrevilege(param) {
      this.set('analysisDetails.privilegesRequired', param.value);
      this.updateCVSSScore();
    },

    selectUserInteraction(param) {
      this.set('analysisDetails.userInteraction', param.value);
      this.updateCVSSScore();
    },

    selectScope(param) {
      this.set('analysisDetails.scope', param.value);
      this.updateCVSSScore();
    },

    selectConfidentialityImpact(param) {
      this.set('analysisDetails.confidentialityImpact', param.value);
      this.updateCVSSScore();
    },

    selectIntegrityImpact(param) {
      this.set('analysisDetails.integrityImpact', param.value);
      this.updateCVSSScore();
    },

    selectAvailabilityImpact(param) {
      this.set('analysisDetails.availabilityImpact', param.value);
      this.updateCVSSScore();
    },

    selectOwaspCategory(param) {
      this.set('analysisDetails.owasp', param);
    },

    selectPcidssCategory(param) {
      this.set('analysisDetails.pcidss', param);
    },

    selectHipaaCategory(param) {
      this.set('analysisDetails.hipaa', param);
    },

    selectMstgCategory(param) {
      this.set('analysisDetails.mstg', param);
    },

    selectAsvsCategory(param) {
      this.set('analysisDetails.asvs', param);
    },

    selectCWECategory(param) {
      this.set('analysisDetails.cwe', param);
    },

    selectGDPRCategory(param) {
      this.set('analysisDetails.gdpr', param);
    },

    selectOverriddenRisk(param) {
      this.set('analysisDetails.overriddenRisk', param);
    },

    addFinding() {
      const findingTitle = this.get("findingTitle");
      const findingDescription = this.get("findingDescription");
      if (isEmpty(findingDescription)) return this.get("notify").error("Please fill the description");
      let findingId = this.get("findingId");
      findingId = findingId + 1;
      const findings = this.get("analysisDetails.findings");
      const newFinding = {
        id: findingId,
        title: findingTitle,
        description: findingDescription
      };
      findings.addObject(newFinding);
      this.set("findingId", findingId);
      this.set("addedFindings", findings);
      this.get("notify").success("Finding Added");
      this.setProperties({
        findingTitle: "",
        findingDescription: ""
      });
    },

    openClearAllFindingConfirmBox() {
      this.set("showClearAllFindingsConfirmBox", true);
    },

    openRemoveFindingConfirmBox(param) {
      this.set("deletedFinding", param);
      this.set("showRemoveFindingConfirmBox", true);
    },

    openRemoveFileConfirmBox(param) {
      this.set("deletedFile", param);
      this.set("showRemoveFileConfirmBox", true);
    },

    openMarkPassedConfirmBox() {
      this.set("showMarkPassedConfirmBox", true);
    },

    downloadAttachment(id) {
      const url = [ENV.endpoints.uploadFile, id, ENV.endpoints.downloadAttachment].join('/');
      return this.get("ajax").request(url, {namespace: 'api/hudson-api'})
      .then((data) => {
        window.open(data.url, '_blank');
      }, (error) => {
        for (error of error.errors) {
          this.get("notify").error(error.detail.error);
        }
      })
    },

    resetOverriddenAnalysis() {
      this.set("analysisDetails.overriddenRisk", null);
      this.set("analysisDetails.overriddenRiskComment", null);
    },
  }
});
