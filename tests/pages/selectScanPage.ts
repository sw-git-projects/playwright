import { expect, type Locator, type Page } from '@playwright/test';

export class SelectScanPage {
  readonly page: Page;
  readonly dob: Locator;
  readonly gender: Locator;
  readonly genderOptions: Locator;  
  readonly continueButton: Locator;
  
  constructor(page: Page) {
    this.page = page;
  
    this.dob = page.locator('#dob');
    this.gender = page.locator('.input-wrapper .multiselect[role="combobox"]');
    this.genderOptions = page.locator('.input-wrapper .multiselect__element[role="option"]');
    this.continueButton = page.locator('[data-testid="select-plan-submit-btn"]');
  }

  /** Types date of birth  */
  async enterDOB(dob: string) {
    // Assuming a patient over the age of 35
    await expect(this.dob).toBeVisible();
    await expect(this.continueButton).toHaveAttribute('disabled');
    await this.dob.fill(dob);
    await this.dob.press('Tab');
  }

  /** Selects Random Gender  */
  async selectGender() {
    await expect(this.gender).toBeVisible();
    await expect(this.continueButton).toBeDisabled();
    await this.gender.click();

    // We are selecting a random gender but the medical questionnaire is catered to the gender chosen 
    // So we need to save it and pass it along the flow.
    const options = ['Male', 'Female'];
    const sexChosen = options[Math.floor(Math.random() * options.length)];
    const option = this.genderOptions.filter({
      hasText: new RegExp(`^${sexChosen}$`),
    })
    
    await expect(option).toBeVisible();
    await option.click();
    await this.gender.press('Tab');
  }

  /** Clicks the given scan */
  async selectScanType(
    scanType: 'MRI' | 'MRISpine' | 'Lung'
  ) {
    const map = {
      MRI: 'FB30-encounter-card',
      MRISpine: 'FB60-encounter-card',
    // MRI Skeletal needs two appointments, skipped for this POC but it can be handled easily
    // MRISkeletal: 'BLUEPRINTNR-encounter-card',
    //   Heart selection has a special questionnaire, skipped for this POC but it can be handled easily
    //   Heart: 'GATEDCAC-encounter-card',  
      Lung: 'LUNG-encounter-card',
    } as const;
  
    const card = this.page.getByTestId(map[scanType]);
    await expect(card).toBeVisible({ timeout: 15000 });
    await card.click();
  }

   /** Clicks continue button and verify success */
   async continue() {
    await expect(this.continueButton).toBeVisible({ timeout: 15000 });
    await expect(this.continueButton).toBeEnabled({ timeout: 15000 });
    await this.continueButton.click();
  }
}

