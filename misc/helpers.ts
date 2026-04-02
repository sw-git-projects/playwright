import { Page, expect } from "@playwright/test";

/* Returns random string with given length */
export function getRandomAlphanumericString(len: number = 10) {
    const chars = "abcdefghijklmnopqrstuvwxyz1234567890";
    let string = "";
    for (let i = 0; i < len; i++) {
      string += chars[Math.floor(Math.random() * chars.length)];
    }
    return string;
  }

/* Recieves email and returns a new email alias */
export async function createEmailAlias(baseEmail: string) {
    const [email, domain] = baseEmail.split('@');
    const aliasedEmail = `${email}+${Date.now()}@${domain}`;
    console.log("Alias email is: " + aliasedEmail)
    return aliasedEmail
  }
  
  export async function waitForLoader(page: Page){
    const loader = page.locator('.animated-line-wrapper');
    await loader.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await loader.waitFor({ state: 'hidden', timeout: 30000 });
  }

  export async function acceptCookies(page: Page){
    const acceptButton = page.locator('[data-tid="banner-accept"]');
    if (await acceptButton.first().isVisible().catch(() => false)) {
      await acceptButton.first().click();
    }
  }