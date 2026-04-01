import { expect, type Locator, type Page } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly confirmTimeZoneButton: Locator;
  readonly appointmentCard: Locator;
  readonly rescheduleOrCancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.confirmTimeZoneButton = page.locator('.modal-dialogue__container button').nth(1);
    this.rescheduleOrCancelButton = page.getByRole('button', {
      name: /reschedule or cancel/i,
    });
    this.appointmentCard = page.locator('div.card').filter({
      has: this.rescheduleOrCancelButton,
    });
  }

  async confirmTimeZoneModal() {
    await expect(this.confirmTimeZoneButton).toBeVisible();
    await this.confirmTimeZoneButton.click();
    await expect(this.confirmTimeZoneButton).toBeHidden();

  }

  async verifyAppointmentCardIsShown() {
    // Can save apppintmene detaies from the schedule scan page and match them here
    await expect(this.appointmentCard.first()).toBeVisible({ timeout: 30000 });
    await expect(this.rescheduleOrCancelButton.first()).toBeVisible();
  }
}

