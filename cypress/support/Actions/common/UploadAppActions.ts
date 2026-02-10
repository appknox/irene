import cyTranslate from '../../translations';
import { API_ROUTES } from '../../../support/api.routes';
import { MirageFactoryDefProps } from '../../../support/Mirage';

export default class UploadAppActions {
  uploadAppStatusLoader = 'uploadAppStatus-loader' as const;

  submissionsPopoverSelector =
    '[data-test-cy="upload-app-submissions-popover"]' as const;

  /**
   * Closes upload app modal in a scenario where it is open by default
   */
  closeUploadAppModalIfOpen() {
    return cy.get('body').then(($body) => {
      if ($body.find(this.submissionsPopoverSelector).length >= 1) {
        cy.get(this.submissionsPopoverSelector).first().click({ force: true });
      }
    });
  }

  /**
   *  Opens upload app modal
   */
  openUploadAppModal() {
    return cy.get('body').then(($body) => {
      const submissionPopoverIsOpen =
        $body.find(this.submissionsPopoverSelector).length >= 1;

      // First check if modal popover is open and close it
      // This step is useful in a scenario where you're unsure if the upload app modal is open
      if (!submissionPopoverIsOpen) {
        // Click on upload app progress bar to open modal
        cy.findByTestId(this.uploadAppStatusLoader).click({ force: true });
      }
    });
  }

  /**
   * Selects a file from a fixture
   * @param fileFixtureAlias - string
   */
  selectAppViaSystem(fileFixtureAlias: string) {
    this.closeUploadAppModalIfOpen();

    return cy
      .findByRole('button', {
        name: new RegExp(cyTranslate('uploadApp')),
      })
      .then((el) => {
        cy.wrap(el.find('input'))
          .should('exist')
          .selectFile(fileFixtureAlias, { force: true });
      });
  }

  selectAppViaLink(playStoreUrl: string) {
    this.closeUploadAppModalIfOpen();

    cy.findByLabelText('upload app via link button')
      .as('UAModalTrigger')
      .should('exist')
      .should('not.have.attr', 'disabled');

    cy.get('@UAModalTrigger').click();

    cy.findByText(cyTranslate('uploadAppModule.linkUploadPopupHeader')).should(
      'exist'
    );

    cy.findByPlaceholderText(
      cyTranslate('uploadAppModule.linkPastePlaceholder')
    )
      .as('UALinkInput')
      .should('not.have.attr', 'disabled');

    cy.get('@UALinkInput')
      .type(playStoreUrl, { delay: 0 })
      .then(($input) => {
        expect($input.val()).to.equal(playStoreUrl);
      });

    cy.findByLabelText('upload app via link modal confirm button')
      .as('UAModalConfirmBtn')
      .should('not.have.attr', 'disabled');

    cy.get('@UAModalConfirmBtn').click();
  }

  assertFileIsInSBOMProjectList(
    sbomProjectListAlias: string,
    uploadedAppPrjIDAlias: string,
    uploadedFileDetailsAlias: string,
    uploadedAppPackageNameAlias: string
  ) {
    cy.wait(sbomProjectListAlias, { timeout: 15000 }).then(
      ({ response: res }) => {
        const sbomPrjListRes = res?.body as {
          results: Array<MirageFactoryDefProps['sbom-project']>;
        };

        cy.get<number>(uploadedAppPrjIDAlias).then((prjID) => {
          const sbomProject = sbomPrjListRes.results.find(
            (it) => it.project === prjID
          );

          const sbomPrjFileID = sbomProject?.latest_sb_file;

          // To be used for later assertions
          cy.wrap(sbomProject).as('uploadedAppSBPrj');

          if (sbomPrjFileID) {
            const sbFileURL = `${API_ROUTES.sbom.route}/${sbomPrjFileID}`;

            cy.intercept(sbFileURL).as('uploadedAppSBFileReq');
          }
        });
      }
    );

    // Wait for SB File response
    cy.wait('@uploadedAppSBFileReq', { timeout: 6000 }).then(
      ({ response: res }) => {
        const sbFile = res?.body as MirageFactoryDefProps['sbom-file'];

        const SB_FILE_STATUS = {
          1: 'PENDING',
          2: 'IN_PROGRESS',
          3: 'COMPLETED',
          4: 'FAILED',
        };

        const sbFileStatus =
          SB_FILE_STATUS[sbFile.status as keyof typeof SB_FILE_STATUS];

        // Sanity Check for related sbom project row
        cy.get<MirageFactoryDefProps['sbom-project']>('@uploadedAppSBPrj').then(
          (prj) => {
            cy.findByTestId(`sbomApp-row-${prj?.id}`)
              .should('exist')
              .within(() => {
                // Check if correct file details are visible
                cy.findByText(sbFileStatus);
                cy.get(uploadedFileDetailsAlias).its('name').should('exist');
                cy.get(uploadedAppPackageNameAlias).should('exist');
              });
          }
        );
      }
    );
  }

  checkStaticScanInfo(
    file: MirageFactoryDefProps['file'],
    risk: MirageFactoryDefProps['file-risk']
  ) {
    cy.findByTestId('staticScan-infoContainer', { timeout: 30000 }).then(
      (el) => {
        const assertOpts = { container: el, timeout: 30000 };

        cy.findByText(cyTranslate('staticScan'), assertOpts).should('exist');

        // Check if static scan has completed or is in progress
        if (file.is_static_done) {
          cy.findByText(cyTranslate('completed'), assertOpts).should('exist');

          // Check for severity count if static scan is completed
          cy.findByTestId('fileChart-severityLevelCounts').within(() => {
            // If static scan is complete counts are stable
            cy.findAllByText(risk.risk_count_high).should('exist');
            cy.findAllByText(risk.risk_count_medium).should('exist');
            cy.findAllByText(risk.risk_count_low).should('exist');
            cy.findAllByText(risk.risk_count_critical).should('exist');
            cy.findAllByText(risk.risk_count_passed).should('exist');
          });
        } else {
          const staticScanProgress = file.static_scan_progress;

          cy.wrap(staticScanProgress).should('be.lessThan', 100);

          // If closer to 100 UI will be updated before assertion is done
          if (staticScanProgress < 40) {
            cy.findByText(
              new RegExp(cyTranslate('scanning'), 'i'),
              assertOpts
            ).should('exist');

            // Check for completed/incomplete static scan tag in VA Details list
            cy.findAllByLabelText(
              `${cyTranslate('static')} scan tag tooltip; scan status: ${cyTranslate('scanNotCompleted')}`,
              { timeout: 10000 }
            )
              .first()
              .should('exist');
          }
        }
      }
    );
  }

  initiateViaSystemUpload = (fixture: string) => {
    // Initiate apk upload from fixture
    cy.fixture(`apps/${fixture}`, null).as('appBinary');

    this.selectAppViaSystem('@appBinary').then(() => this.openUploadAppModal());

    cy.findByTestId('submission-status-dropdown-container').within(() => {
      cy.contains(cyTranslate('uploadStatus'));
      cy.contains(cyTranslate('viaSystem'));
      cy.contains(new RegExp(cyTranslate('inProgress'), 'i'));
    });

    // Initiate app upload
    cy.wait('@uploadAppReq').then(({ response: res }) => {
      const uploadDetails = res?.body as MirageFactoryDefProps['upload-app'];

      // Necessary to know when upload is completed
      cy.intercept('PUT', uploadDetails.url).as('uploadSuccess');
    });

    // Wait for upload completion
    cy.wait('@uploadSuccess', { timeout: 60000 });

    cy.findByText(cyTranslate('fileUploadedSuccessfully'), {
      timeout: 60000,
    });

    // Intercepts uploaded file submission request from uploaded file info
    cy.wait('@uploadAppReqPOST', { timeout: 60000 }).then(
      ({ response: res }) => {
        const uploadDetails = res?.body as MirageFactoryDefProps['upload-app'];

        const uploadedAppSubURL = `${API_ROUTES.submissionItem.route}/${uploadDetails.submission_id}`;

        // Intercept upload app submission request
        cy.intercept('GET', uploadedAppSubURL).as('uploadedAppSubmission');
        cy.wrap(uploadDetails.submission_id).as('uploadedAppSubID');
      }
    );
  };

  initiateViaLinkUpload = (url: string) => {
    this.selectAppViaLink(url);

    // Intercepts uploaded file submission request from uploaded file info
    cy.wait('@uploadAppLinkReqPOST', { timeout: 60000 }).then(
      ({ response: res }) => {
        const uploadDetails =
          res?.body as MirageFactoryDefProps['upload-app-link'];

        const uploadedAppSubURL = `${API_ROUTES.submissionItem.route}/${uploadDetails.id}`;

        // Intercept upload app submission request
        cy.intercept('GET', uploadedAppSubURL).as('uploadedAppSubmission');
        cy.wrap(uploadDetails.id).as('uploadedAppSubID');
      }
    );

    cy.findByTestId('submission-status-dropdown-container', {
      timeout: 70000,
    })
      .should('exist')
      .within(() => {
        cy.contains(cyTranslate('uploadStatus'));
      });
  };
}
