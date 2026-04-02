import { expect, Locator, type Page } from '@playwright/test';

export class ScheduleScanPage {
  readonly page: Page;
  readonly locationCard: Locator;
  readonly availableDays: Locator;
  readonly availableTimes: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.locationCard = page.locator(".location-card");
    this.availableDays = this.page.locator(
      '.vuecal__cell:not(.vuecal__cell--disabled) .vc-day-content[role="button"]'
    );
    this.availableTimes = this.page.locator(
      '.appointments__list .appointments__individual-appointment label'
    );
    this.continueButton = this.page.locator('button[data-test="submit"]')
  }

  /**  Chooses first location for scan from the list */
  async pickALocation() {
    // Picking the first location shown
    // Edge case some sclinics only have MRI with Spine 
    // Will need to handled int he future
    await expect(this.locationCard.first()).toBeVisible();
    await this.locationCard.first().click();
  }

  /** Picks the first available date and time */
  async pickAvailableValidDateAndTime() {
    await expect(this.availableDays.first()).toBeVisible({ timeout: 30000 });
    await this.availableDays.first().click();
    await expect(this.availableTimes.first()).toBeVisible({ timeout: 30000 });
    await this.availableTimes.first().click();
    await expect(await this.availableTimes.first()).toBeChecked;
  }

  /** Clicks continue button and verify success */
  async continue(): Promise<void> {
    // Seeing a 400, placing a retry mechanism here
    for (let attempt = 1; attempt <= 3; attempt++) {
      const responsePromise = this.page.waitForResponse((res) => {
        const req = res.request();
        return (
          req.method() === 'POST' &&
          res.url() === 'https://stage-api.ezra.com/packages/api/scheduling/reservation'
        );
      });
      await expect(this.continueButton).toBeVisible({ timeout: 15000 });
      await expect(this.continueButton).toBeEnabled({ timeout: 15000 });
      await this.continueButton.click({ timeout:10000 });
      const response = await responsePromise;
      const status = response.status();
      if (status === 200) return;
      if (status === 400 && attempt < 3) {
        await this.page.waitForTimeout(1000);
        continue;
      }
      expect(status).toBe(200);
    }
  }
}
