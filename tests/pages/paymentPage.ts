import { expect, FrameLocator, type Locator, type Page } from '@playwright/test';

export class PaymentPage {
  readonly page : Page;
  readonly continueButton: Locator;
  readonly stripeIFrame : FrameLocator;
  readonly cardNumber : Locator;
  readonly cardExpiry : Locator;
  readonly cardCvc : Locator;
  readonly cardZipcode : Locator;
  readonly priceLocator : Locator;

  constructor(page: Page) {
    this.page = page;

    this.continueButton = this.page.locator('button[data-test="submit"]');
    this.stripeIFrame = this.page.frameLocator('iframe[title="Secure payment input frame"]:not([aria-hidden="true"])');
    this.cardNumber = this.stripeIFrame.locator('#payment-numberInput');
    this.cardExpiry = this.stripeIFrame.locator('#payment-expiryInput');
    this.cardCvc = this.stripeIFrame.locator('#payment-cvcInput');
    this.cardZipcode = this.stripeIFrame.locator('#payment-postalCodeInput');
    this.priceLocator = this.page.locator('.pricing-detail .h4');
  }

  async payForScanViaCard() {
    await expect(this.cardNumber).toBeVisible({timeout: 30000});
    await this.cardNumber.fill(process.env.STRIPE_TEST_CARD ?? '4242424242424242');
    await this.cardExpiry.fill(process.env.STRIPE_TEST_EXPIRY ?? '01/30');
    await this.cardCvc.fill(process.env.STRIPE_TEST_CVC ?? '000');
    await this.cardZipcode.fill('12345');
  }

   /** Clicks continue button and verify success */
   async continue() {
    const responsePromise = this.page.waitForResponse((res) => {
      const req = res.request();
      return (
        req.method() === 'POST' &&
        res.url().includes('https://api.stripe.com/v1/payment_intents/') &&
        res.url().endsWith('/confirm')
      );
    });
    await expect(this.continueButton).not.toBeDisabled();
    await this.continueButton.click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
  }

  async getPriceForScan(){
    await expect(this.priceLocator).toBeVisible();
    const price = Number((await this.priceLocator.innerText()).replace(/[^0-9]/g, ''));
    expect(price).toBeGreaterThan(0);
    return price;
  }
}
  