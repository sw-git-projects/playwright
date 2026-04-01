import { expect, type Locator, type Page } from '@playwright/test';

export class ConfirmationPage {
  readonly page: Page;
  readonly confirmationHeading: Locator;
  readonly medicalQuestionnaireButton: Locator;
  readonly goToDashboardButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.confirmationHeading = page.locator('h4.confirmation-msg__title')
    this.medicalQuestionnaireButton = page.locator('.confirmation-msg').getByRole('button');
    this.goToDashboardButton = page.locator('a[href="/"]');
  }

  /** Asserts confirmation message is shown */
  async verifyConfirmationMessage() {
    await expect(this.confirmationHeading).toBeVisible({ timeout: 30000 });
    await expect(this.medicalQuestionnaireButton).toBeVisible();

  }

  /** Clicks Go to dashboard */
  async clickGoToDashboard() {
    await expect(this.goToDashboardButton).toBeVisible();
    await this.goToDashboardButton.click();
  }
}
