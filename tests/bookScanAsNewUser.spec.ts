import { test } from '@playwright/test';
import { JoinPage } from './pages/joinPage';
import { getEnv } from '../config/config';
import { createEmailAlias } from '../misc/helpers';
import { SelectScanPage } from './pages/selectScanPage';
import { ScheduleScanPage } from './pages/scheduleScanPage';
import { PaymentPage } from './pages/paymentPage';
import { ConfirmationPage } from './pages/confirmationPage';
import { DashboardPage } from './pages/dashboardPage';

let joinPage: JoinPage;
let selectScan: SelectScanPage;
let scheduleScan: ScheduleScanPage;
let paymentPage: PaymentPage;
let confirmationPage: ConfirmationPage;
let dashboard: DashboardPage;

test.beforeEach(async ({ page }) => {
  joinPage = new JoinPage(page);
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
  test(`Book a ${scanType} scan as a new user`, async () => {
      await joinPage.goto();
      const email = await createEmailAlias(getEnv('member_email'));
      console.log("Member email is: " + email)
      await joinPage.register(email, getEnv('member_password'));
      await selectScan.enterDOB('01/01/1990');
      await selectScan.selectGender();    
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
      await dashboard.confirmTimeZoneModal();
      await dashboard.verifyAppointmentCardIsShown();
      // Can continue this flow to go to member portal now
      // memberPortal.login(getEnv('admin_email'), getEnv('admin_password'))
      // memberPortal.searchUSer(email);
      // memberPortal.verifyAppointmentDetails(<Can save booking details from scheduleScan Page and pass them here>);
      // memberPortal.verifyPriceTotal(price)
  });
}
