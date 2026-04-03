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
      '.appointments__list .appointments__individual-appointment label:visible'
    );
    this.continueButton = this.page.locator('button[data-test="submit"]')
  }

/**  Chooses recommended location for scan from the list */
async pickALocation() {
  // Picking the recommended location shown for this POC
  // Edge cases:
  //    some clinics only have MRI with Spine can be excluded with '.unavailable-pill' class
  //    some clinics need three time selections needs to handle the modal and selectiong
  await expect(this.locationCard.first()).toBeVisible();
  const recommendedLocation = this.locationCard.filter({
    has: this.page.locator('.pill', { hasText: 'Recommended' }),
  });
  await recommendedLocation.click();}

  /** Picks a random available date and time */
  async pickAvailableValidDateAndTime() {
    await expect(this.availableDays.first()).toBeVisible({ timeout: 10000 });
    const randomDayIndex = Math.floor(Math.random() * (await this.availableDays.count()));
    await this.availableDays.nth(randomDayIndex).click();
    console.log("Day selected: " + this.availableDays.nth(randomDayIndex).getAttribute('data-testid'));
    await expect(this.availableTimes.first()).toBeVisible({ timeout: 10000 });
    const randomTimeIndex = Math.floor(Math.random() * (await this.availableTimes.count()));
    await this.availableTimes.nth(randomTimeIndex).click();
    await expect(this.availableTimes.nth(randomTimeIndex)).toBeChecked();
    // Selected date and time can be returned here and passed to dashbord for assertion.
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
