import { expect, type Locator, type Page } from '@playwright/test';
import { waitForLoader } from 'misc/helpers';

export class DashboardPage {
  readonly page: Page;
  readonly confirmTimeZoneButton: Locator;
  readonly appointmentCard: Locator;
  readonly rescheduleOrCancelButton: Locator;
  readonly bookAScanButton: Locator;
  readonly noAppointmentCard: Locator;
  readonly cancelButton: Locator;
  readonly cancelScanButton: Locator;
  readonly cancellationReason: Locator;

  constructor(page: Page) {
    this.page = page;

    this.confirmTimeZoneButton = page.locator('.modal-dialogue__container button').nth(1);
    this.rescheduleOrCancelButton = page.getByRole('button', { name: 'Reschedule or Cancel' });
    this.appointmentCard = page.locator('div.card').filter({
      has: this.rescheduleOrCancelButton,
    });
    this.bookAScanButton = page.getByTestId('book-scan-btn').nth(1);    
    this.noAppointmentCard = page.locator('.my-appointments .appointments--none');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.cancellationReason = page.locator('.cancel-reason-button label').first();
    this.cancelScanButton = page.getByRole('button', { name: 'Cancel Scan' });
  }

  async confirmTimeZoneModal() {
    await expect(this.confirmTimeZoneButton).toBeVisible();
    await this.confirmTimeZoneButton.click();
    await expect(this.confirmTimeZoneButton).toBeHidden();

  }

  async verifyAppointmentCardIsShown(): Promise<void> {
    // Can save appointment details from the schedule scan page and match them here
      for (let attempt = 1; attempt <= 3; attempt++) {
        await waitForLoader(this.page);
        try {
        await expect(this.appointmentCard.first()).toBeVisible({ timeout: 15000 });
        await expect(this.rescheduleOrCancelButton.first()).toBeVisible();
        return; 
        } catch (e) {
          if (attempt === 3) throw e;
          await this.page.reload();
          await waitForLoader(this.page);
        }
    }
  }

  /** Clicks book a scan button on dashboard. */
  async clickBookAScanButton() {
    await expect(this.bookAScanButton).toBeVisible({timeout: 30000});
    await this.bookAScanButton.click();
  }

  /** Cancels  appointment */
  async cancelAppointment() {
    await waitForLoader(this.page);
    await expect(this.rescheduleOrCancelButton.first()).toBeVisible({ timeout: 10000 });
    await this.rescheduleOrCancelButton.first().click();
    await waitForLoader(this.page);
    await expect(this.cancelButton).toBeVisible({ timeout: 10000 });
    await this.cancelButton.click();
    await expect(this.cancellationReason).toBeVisible({ timeout: 10000 });
    await this.cancellationReason.click();
    await this.page.fill('#cancellationReasonExtraDescription', 'xxx');
    await expect(this.cancelScanButton).toBeVisible({ timeout: 10000 });
    await this.cancelScanButton.click();
    await expect(this.page.getByRole('heading', { name: 'Your appointment has been cancelled' })).toBeVisible({timeout:30000});
    await this.page.getByRole('button', { name: 'Back to Dashboard' }).click();
  }

  async verifyNoScheduledAppointments(){
    await expect(this.noAppointmentCard).toBeVisible();
  }

  async cancelAllScheduledAppointments(){
    await waitForLoader(this.page);
    while (await this.rescheduleOrCancelButton.count() > 0) {
      await this.cancelAppointment();
      await this.page.reload()
      await waitForLoader(this.page);
    }
    await this.verifyNoScheduledAppointments();
  }
}

