import { test } from '@playwright/test';
import { getEnv } from '../config/config';
import { LoginPage } from './pages/loginPage';
import { SelectScanPage } from './pages/selectScanPage';
import { ScheduleScanPage } from './pages/scheduleScanPage';
import { PaymentPage } from './pages/paymentPage';
import { ConfirmationPage } from './pages/confirmationPage';
import { DashboardPage } from './pages/dashboardPage';
import { acceptCookies } from 'misc/helpers';

let loginPage: LoginPage;
let selectScan: SelectScanPage;
let scheduleScan: ScheduleScanPage;
let paymentPage: PaymentPage;
let confirmationPage: ConfirmationPage;
let dashboard: DashboardPage;

test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page);
  selectScan = new SelectScanPage(page);
  scheduleScan = new ScheduleScanPage(page);
  paymentPage = new PaymentPage(page);
  confirmationPage = new ConfirmationPage(page);
  dashboard = new DashboardPage(page);
});

// Heart selection has a special questionnaire, skipped for this POC but it can be handled easily
// MRI Skeletal needs two appointments, skipped for this POC but it can be handled easily
const scanTypes = ['MRI', 'MRISpine', 'Lung'] as const;

// Can be individual tests too but this saves lines of code
for (const scanType of scanTypes) {
  test(`Book a ${scanType} scan as an existing user`, async ({ page }) => {
      await page.goto('/');
      await loginPage.login(getEnv('member_email'), getEnv('member_password'));
      await acceptCookies(page);
      await dashboard.cancelAllScheduledAppointments();
      await dashboard.clickBookAScanButton();   
      await selectScan.selectScanType(scanType);
      await selectScan.continue();
      await scheduleScan.pickALocation();
      await scheduleScan.pickAvailableValidDateAndTime();
      await scheduleScan.continue();
      const price: number = await paymentPage.getPriceForScan();
      console.log("Price of scan is: ", price);
      await paymentPage.payForScanViaCard();
      await paymentPage.continue();
      await confirmationPage.verifyConfirmationMessage();
      await confirmationPage.clickGoToDashboard();
      await dashboard.verifyAppointmentCardIsShown();
      await dashboard.cancelAppointment();
      await dashboard.verifyNoScheduledAppointments();
      // Can continue this flow to go to member portal now
      // memberPortal.login(getEnv('admin_email'), getEnv('admin_password'))
      // memberPortal.searchUser(email);
      // memberPortal.verifyAppointmentDetails(<Can save booking details from scheduleScan Page and pass them here>);
      // memberPortal.verifyPriceTotal(price)
  });
}
