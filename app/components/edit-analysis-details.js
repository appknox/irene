/* jshint ignore:start */

import Ember from 'ember';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';

const { get, set } = Ember;

const isEmpty = inputValue => Ember.isEmpty(inputValue);

const {inject: {service}} = Ember;


export default Ember.Component.extend({
  findingId: 0,
  findings: [],
  findingTitle: "",
  findingDescription: "",

  session: service(),

  risks: ENUMS.RISK.CHOICES,
  scopes: ENUMS.SCOPE.CHOICES.slice(0, 2),
  statuses: ENUMS.ANALYSIS_STATUS.CHOICES.slice(0),
  attackVectors: ENUMS.ATTACK_VECTOR.CHOICES.slice(0, 4),
  integrityImpacts: ENUMS.INTEGRITY_IMPACT.CHOICES.slice(0, 3),
  userInteractions: ENUMS.USER_INTERACTION.CHOICES.slice(0, 2),
  attackComplexities: ENUMS.ATTACK_COMPLEXITY.CHOICES.slice(0, 2),
  requiredPrevileges: ENUMS.PRIVILEGES_REQUIRED.CHOICES.slice(0, 3),
  availabilityImpacts: ENUMS.AVAILABILITY_IMPACT.CHOICES.slice(0, 3),
  confidentialityImpacts: ENUMS.CONFIDENTIALITY_IMPACT.CHOICES.slice(0, 3),

  analysisDetails: (function() {
    return this.get("store").findRecord('security/analysis', this.get("analysis.analysisId"));
  }).property(),

  owasps: (function() {
    return this.get("store").findAll("owasp");
  }).property(),

  pcidsses: (function() {
    return this.get("store").findAll("pcidss");
  }).property(),

  allFindings: (function() {
    let findingId = this.get("findingId");
    const findings = this.get("analysisDetails.findings");
    if(findings) {
      findings.forEach((finding) => {
        findingId = findingId + 1;
        finding.id = findingId;
        this.set("findingId", findingId);
      });
      return findings;
    }
  }).property("analysisDetails.findings"),


  confirmCallback(key) {
    if(key === "findings") {
      this.set("analysisDetails.findings", "");
      return this.set("showClearAllFindingsConfirmBox", false);
    }
    if(key === "attachment") {
      this.deleteFile(this.get("deletedFile"));
      return this.set("showRemoveFileConfirmBox", false);
    }
    if(key === "finding") {
      const availableFindings = this.get("availableFindings");
      this.set("analysisDetails.findings", availableFindings);
      return this.set("showRemoveFindingConfirmBox", false);
    }
    if(key === "passed") {
      this.set("analysisDetails.confidentialityImpact", ENUMS.CONFIDENTIALITY_IMPACT.NONE);
      this.set("analysisDetails.integrityImpact", ENUMS.INTEGRITY_IMPACT.NONE);
      this.set("analysisDetails.availabilityImpact", ENUMS.AVAILABILITY_IMPACT.NONE);
      this.updateCVSSScore();
      this.send("saveAnalysis");
      return this.set("showMarkPassedConfirmBox", false);
    }
  },

  availableFindings: Ember.computed.filter('allFindings', function(allFinding) {
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

  updateCVSSScore() {
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
    }, () => {
      this.get("notify").error("Sorry something went wrong, please try again");
    });
  },

  actions: {

    async uploadFile(file) {
      this.set("isUploading", true);
      const fileName = file.blob.name;
      const data = {
        name: fileName
      };

      const analysisId= this.get("analysis.analysisId");

      try {
        var fileData = await this.get("ajax").post(ENV.endpoints.uploadFile,{namespace: 'hudson-api', data});
        await file.uploadBinary(fileData.url, {
          method: 'PUT'
        });
        const fileDetailsData = {
          file_uuid: fileData.file_uuid,
          file_key: fileData.file_key,
          file_key_signed: fileData.file_key_signed,
          name: fileName,
          analysis: analysisId,
          content_type: "ANALYSIS"
        };
        await this.get("ajax").post(ENV.endpoints.uploadedAttachment,{namespace: 'hudson-api', data: fileDetailsData});

        this.set("isUploading", false);
        this.get("store").findRecord('analysis', this.get("analysis.analysisId"));
        this.get("notify").success("File Uploaded Successfully");
        const analysisObj = this.get("store").findRecord('security/analysis', this.get("analysis.analysisId"));
        this.set('analysisDetails', analysisObj);
      } catch(error) {
        this.set("isUploading", false);
        this.get("notify").error("Sorry something went wrong, please try again");
        return;
      }
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

    selectOverriddenRisk(param) {
      this.set('analysisDetails.overriddenRisk', param.value);
    },

    addFinding() {
      const findingTitle = this.get("findingTitle");
      const findingDescription = this.get("findingDescription");
      for (let inputValue of [findingTitle, findingDescription ]) {
        if (isEmpty(inputValue)) { return this.get("notify").error("Please fill all the details"); }
      }
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
      this.set("analysisDetails.findings", findings);
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
      return this.get("ajax").request(url, {namespace: 'hudson-api'})
      .then((data) => {
        window.open(data.url, '_blank');
      }, (error) => {
        for (error of error.errors) {
          this.get("notify").error(error.detail.error);
        }
      })
    },

    saveAnalysis() {
      const risk = this.get("analysisDetails.risk");
      const owasp = this.get("analysisDetails.owasp");
      const pcidss = this.get("analysisDetails.pcidss");
      const status = this.get("analysisDetails.status");
      const analysisId= this.get("analysis.analysisId");
      const findings = this.get("analysisDetails.findings");
      const overriddenRisk = this.get("analysisDetails.overriddenRisk");
      const overriddenRiskToProfile = this.get("analysisDetails.overriddenRiskToProfile");
      if (findings) {
        findings.forEach(finding => delete finding.id);
      }
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
        findings,
        overridden_risk: overriddenRisk,
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
      this.set("isSavingAnalyses", true);
      const url = [ENV.endpoints.analyses, analysisId].join('/');
      this.get("ajax").put(url,{ namespace: '/hudson-api', data: JSON.stringify(data), contentType: 'application/json' })
      .then(() => {
        this.set("isSavingAnalyses", false);
        this.get("notify").success("Analyses Updated");
      }, () => {
        this.set("isSavingAnalyses", false);
        this.get("notify").error("Sorry something went wrong, please try again");
      })
    }

  }
});

/* jshint ignore:end */
