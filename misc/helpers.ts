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
    return `${email}_${getRandomAlphanumericString(10)}@${domain}`;
  }
  