import NOTIFICATION_LOCATORS from '../../locators/common/Notifications';

export default class NotificationRepository {
  assertErrorMessage(message: string) {
    return cy
      .get(NOTIFICATION_LOCATORS.errorContainer)
      .should('be.visible')
      .should('contain.text', message);
  }

  // TODO: Fix Implementation
  assertInfoMessage(message: string) {
    return cy
      .get(NOTIFICATION_LOCATORS.errorContainer)
      .should('be.visible')
      .should('contain.text', message);
  }

  // TODO: Fix Implementation
  assertSuccessMessage(message: string) {
    return cy
      .get(NOTIFICATION_LOCATORS.errorContainer)
      .should('be.visible')
      .should('contain.text', message);
  }
}
