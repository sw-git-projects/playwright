import { expect, type Locator, type Page } from '@playwright/test';
import { waitForLoader } from 'misc/helpers';

export class LoginPage {
  readonly page: Page;
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;

  constructor(page: Page) {
    this.page = page;

    this.email = page.locator('#email');
    this.password = page.locator('#password');
    this.submit = page.locator('button.submit-btn');
  }

  /** Signs in with email and password. */
  async login(email: string, password: string) {
    await expect(this.email).toBeVisible();
    await this.email.fill(email);
    await this.password.fill(password);
    const responsePromise = this.page.waitForResponse((res) => {
      const req = res.request();
      return (
        req.method() === 'GET' &&
        res.url() === 'https://stage-api.ezra.com/individuals/api/members'
      );
    });
    await this.submit.click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    await waitForLoader(this.page);

  }
}
