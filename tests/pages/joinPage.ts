import { expect, type Locator, type Page } from '@playwright/test';

/** Member registration (`/join`) — form fields, checkboxes, and submit. */
export class JoinPage {
  readonly page: Page;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly phoneNumber: Locator;
  readonly password: Locator;
  readonly checkboxes: Locator;
  readonly submit: Locator;

  constructor(page: Page) {
    this.page = page;

    this.firstName = page.locator('#firstName');
    this.lastName = page.locator('#lastName');
    this.email = page.locator('#email');
    this.phoneNumber = page.locator('#phoneNumber');
    this.password = page.locator('#password');
    this.checkboxes = page.locator('div[class*="checkbox--wrapper"] button svg');
    this.submit = page.locator('button[type="submit"]');
  }

  /** Goes to join page */
  async goto() {
    await this.page.goto('/join');
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.firstName).toBeVisible();
    await expect(this.submit).toHaveClass(/disabled/);  
  }

  /** Fills first name, last name, email, phone, and password */
  async fillForm(args: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) {
    await this.firstName.fill(args.firstName);
    await this.lastName.fill(args.lastName);
    await this.email.fill(args.email);
    await this.phoneNumber.fill(args.phoneNumber);
    await this.password.fill(args.password);
  }

  /** Checks all legal/consent checkboxes */
  async checkAllCheckboxes() {
    const count = await this.checkboxes.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await this.checkboxes.nth(i).first().click();
    }
  }

  async register(email: string, password: string): Promise<void> {
    await this.fillForm({
      firstName: `Auto${Date.now()}`,
      lastName: 'Member',
      email,
      phoneNumber: '8004002000',
      password,
    });
      await this.checkAllCheckboxes();
    await expect(this.submit).toBeVisible({ timeout: 15000 });
    await expect(this.submit).toBeEnabled({ timeout: 15000 });
  
    // Seeing a 400 while registering users, placing a retry mechanism here
    for (let attempt = 1; attempt <= 3; attempt++) {
      const responsePromise = this.page.waitForResponse((res) => {
        const req = res.request();
        return (
          req.method() === 'POST' &&
          res.url() === 'https://stage-api.ezra.com/individuals/api/members'
        );
      });
  
      await this.submit.click();
  
      const response = await responsePromise;
      const status = response.status();
      if (status === 201) return;
      if (status === 400 && attempt < 3) {
        await this.page.waitForTimeout(1000);
        continue;
      }
      expect(status).toBe(201);
    }
  }
 
}

