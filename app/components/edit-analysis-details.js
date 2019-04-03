import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
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

  ireneFilePath: computed(function() {
    const fileId = this.get("analysisDetails.file.id");
    const ireneHost = ENV.ireneHost;
    return [ireneHost, "file", fileId].join('/');
  }),

  analysisDetails: computed(function() {
    return this.get("store").findRecord('security/analysis', this.get("analysis.analysisid"));
  }),

  owasps: computed(function() {
    return this.get("store").findAll("owasp");
  }),

  pcidsses: computed(function() {
    return this.get("store").findAll("pcidss");
  }),

  allFindings: computed("analysisDetails.findings", "addedFindings", function() {
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
      this.updateCVSSScore()
      this.send("saveAnalysis");
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

  updateCVSSScore() {
    const attackVector = this.get("analysisDetails.attackVector") || ENUMS.ATTACK_VECTOR.PHYSICAL;
    const attackComplexity = this.get("analysisDetails.attackComplexity") || ENUMS.ATTACK_COMPLEXITY.HIGH;
    const privilegesRequired = this.get("analysisDetails.privilegesRequired") || ENUMS.PRIVILEGES_REQUIRED.HIGH ;
    const userInteraction = this.get("analysisDetails.userInteraction") || ENUMS.USER_INTERACTION.REQUIRED ;
    const scope = this.get("analysisDetails.scope") || ENUMS.SCOPE.UNCHANGED ;
    const confidentialityImpact = this.get("analysisDetails.confidentialityImpact") || ENUMS.CONFIDENTIALITY_IMPACT.NONE;
    const integrityImpact = this.get("analysisDetails.integrityImpact") || ENUMS.INTEGRITY_IMPACT.NONE;
    const availabilityImpact = this.get("analysisDetails.availabilityImpact") || ENUMS.AVAILABILITY_IMPACT.NONE;
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



  detailSaveUtil: task(function * (param){
    try{
      yield this.get('detailSaveAjaxCallUtil').perform(param);
      this.get("notify").success("Analyses Updated");
      if(param==="back") {
        yield getOwner(this).lookup('route:authenticated').transitionTo("authenticated.security.file", this.get("analysisDetails.file.id"));
      }
    }catch(error){
      this.get("notify").error("Sorry something went wrong, please try again");
    }
  }),

  detailSaveAjaxCallUtil: task(function * () {
    const risk = this.get("analysisDetails.risk");
    const owasp = this.get("analysisDetails.owasp");
    const pcidss = this.get("analysisDetails.pcidss");
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

    for (let inputValue of [attackVector, attackComplexity, privilegesRequired, userInteraction, scope, confidentialityImpact, integrityImpact, availabilityImpact]) {
      if (isEmpty(inputValue)) { return this.get("notify").error("Please select all the CVSS Metrics"); }
    }

    const cvssVector = this.get("analysisDetails.cvssVector");
    const data = {
      risk,
      status,
      owasp: owasp.map(a=>a.get('id')),
      pcidss: pcidss.map(a=>a.get('id')),
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
    
    yield this.get("ajax").put(url,{ namespace: 'api/hudson-api', data: JSON.stringify(data), contentType: 'application/json' })
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
        yield this.get('detailSaveAjaxCallUtil').perform()
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
