# Playwright E2E Implementation for Ezra's booking flow

## Question 1 Part 1

### The booking flow is integral to Ezra's business operation. Please go through the first three steps of the booking process including payment and devise 15 test cases throughout the entire process you think are the most important. When submitting the assignment, please return the test cases from the most important to the least important.

**Scope & Assumptions**
- Default test user age: 35–85 unless explicitly testing eligibility boundaries
- Covers end-to-end booking lifecycle: select scan > scheduling > payment > dashboard 
- Focus on high-value, revenue-critical, and user-critical flows
- Tests designed for Playwright + API-assisted setup where needed

**Core Coverage (Top 15 — Must Automate)**
1. End-to-End Booking Flows
   - New user can sign up, log in, book a scan, complete payment, and see the appointment on the dashboard and staging user portal
   - Existing user can log in, book a scan, complete payment, and see the appointment reflected across systems

2. Product Coverage
   - User can book each MRI option successfully
   - User can book Heart and Lung as standalone scans
   - User can book Heart and Lung as add-ons to MRI

3. State & Data Integrity
   - Booking summary and payment details match selections throughout the flow
   - Booking selections persist when navigating backward and forward

4. Payments 
   - Payment failure does not create an appointment
   - Retrying payment does not create duplicate appointments

5. Pricing & Promotions
   - Valid promo codes apply discounts
   - Selecting/deselecting scans updates pricing

6. Product Rules & Constraints
   - Switching MRI to MRI with Spine during location selection shows warning and updates pricing correctly
   - Heart eligibility questionnaire blocks booking when disqualified

7. Appointment Lifecycle
   - User can reschedule an appointment and see updates reflected everywhere
   - User can cancel an appointment and see it removed across systems

**Negative Test Coverage**
1. Payment & Checkout
   - Invalid/declined card prevents booking
   - Partial or interrupted payment does not create an appointment
   - Failure after payment does not create inconsistent UI state

2. Promotions
   - Invalid or expired promo codes throw error and do not apply discounts
   - Selection & Flow Validation
   - User cannot proceed without selecting a scan
   - Disqualified Heart eligibility prevents continuation if questionnaire is completed with a “Yes” answer

3. Security / Data Integrity
   - User cannot access another user’s data via URL manipulation
   - Session reuse does not leak booking or questionnaire data

**Edge Case Coverage**
1. Availability & Scheduling
   - Timeslot or Day becomes unavailable before confirmation > user is blocked gracefully
   - No available slots > proper empty state messaging

2. State Management
   - Page refresh mid-flow preserves or resets state correctly
   - Multiple tabs → no conflicting or duplicate bookings

3. Dynamic UI Behavior
   - Switching clinics updates availability and pricing correctly
   - “Available instead” clinics behavior
   - Recommended clinic logic behaves consistently

4. System Behavior
   - Dashboard shows confirmed booking within acceptable delay
   - Retry flows handle transient backend failures

**Eligibility & Business Rules**
   - Users within 35–85 can book supported scans
   - Heart availability aligns with age and questionnaire requirement
   - Lung availability aligns with age requirement
   - MRI Spine upgrade flow behaves consistently across clinics

 **Lifecycle & State Transitions**
   - Reschedule updates persist across dashboard and backend
   - Cancel removes appointment and prevents further actions
   - Rebooking after cancellation works cleanly
   - No duplicate state across retries or failures

---

## Question 1 Part 2

### For the top 3 test cases from part 1, please provide a description explaining why they are indicated as your most important.

The booking flow is clearly the most critical piece. As stated in part 1 “booking flow is integral to Ezra’s business operation”.
I focused on the booking funnel since it directly drives revenue. The end-to-end booking flow is the highest priority because it validates multiple systems working together — account creation, authentication, booking, payment, and confirmation. Any failure in this path blocks conversion entirely, making it the highest-risk area for the business.

---

## Question 2 Part 1
### Being privacy focused is integral to our culture and business model. Please devise an integration test case that prevents members from accessing other’s medical data. Hint: Begin Medical Questionnaire.

**Test Case:** 
Verify medical data access is restricted across user accounts

**Steps:**
   - Log in as Member A (auto_test@gmail.com / Testing@) and begin the medical questionnaire.
   - Click Continue.
   - For the intent to get scan question, select “another person” and continue.
   - Verify the user is taken to the warning page stating “Each person needs their own Ezra account” and only sign out and create a new account button is displayed.
   - Capture the questionnaire URL from Member A’s session for next steps.
   - Click “Sign out and create a new account”.
   - Log back in as Member A and verify the previously booked scan is removed from the dashboard because of selecting another person.
   - Log in as Member B (auto_test_under35@gmail.com / Testing@).
   - Paste and navigate to Member A’s questionnaire URL.

**Expected Result:**
   Verify that:
   - Member B cannot proceed with the medical questionnaire using Member A’s URL.
   - The application redirects Member B to the login page.
   - Member B cannot access or view any medical data belonging to Member A.
   - Member B appointments remain unchanged

Some notes on what I observed in staging:
- When reusing the questionnaire link from another user, the questionnaire may briefly appear to start, but then user is then redirected to the login page.
- I also observed inconsistent session behavior when hitting the browser back button from the warning page: in some cases the dashboard is shown briefly before logout, and in some cases the booked scan appears temporarily before disappearing. 

--- 

## Question 2 Part 2
### Please devise HTTP requests from Part 1 to implement your test case. Submitting written HTTP requisitions is fine, you do not need to submit a postman project.

Member A submission ID 3540

**Request:**
   ```
   POST https://stage-api.ezra.com/diagnostics/api/medicaldata/forms/mq/submissions/3540/complete
   Authorization: Bearer <member B token>
   Accept: application/json
   ```

**Response:**
   ```
   403 forbidden
   ```
  <img src = assets/403Forbidden.png width="800"/>

---

## Question 2 Part 3
### At Ezra, we have over 100 endpoints that transfer sensitive data. What is your thought process around managing the security quality of these endpoints? What are the tradeoffs and potential risks of your solution?

With over 100 endpoints handling sensitive data, I would not try to test each one. I would use API-based setup to create users and appointments, and then continue only the critical flows through integration tests to optimize run time. Since these tests are expensive, they should focus on high-impact paths and be fast and stable enough to run in CI without slowing down releases.
The main tradeoff is coverage vs speed. I will push security earlier into development making authorization checks part of the definition of done rather than something QA validates at the end. Audit logging, setting threshold triggers etc. in production catches what automated suites miss.

---

## Automation

### Setup

1. **Node.js** v18+ and npm: [https://nodejs.org](https://nodejs.org)

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install browsers** (Chromium and friends for Playwright)

   ```bash
   npx playwright install
   ```

4. **Environment**
Create a `.env` in the project root and add the below:
   ```
   member_email = 'auto_test@gmail.com'
   member_password = 'Testing@'
   CI=false
   TEST_ENV=staging

   # Below are Optional/Future Use
   admin_email = 'michael.krakovsky+test_interview@functionhealth.com'
   admin_password = '12121212Aa'

   STRIPE_TEST_CARD='4242424242424242'
   STRIPE_TEST_EXPIRY='01/30'
   STRIPE_TEST_CVC='888'
   ```
   
---

## Run tests

```bash
# All tests
npx playwright test

# Single spec (example: new-user booking flow)
npx playwright test tests/bookScanAsNewUser.spec.ts

# UI headed / debug
npx playwright test --headed
npx playwright test --debug
```

---

## Architecture (Page Object Model)

| Area | Location | Role |
|------|----------|------|
| Specs | `tests/*.spec.ts` | Orchestrate flows; minimal UI detail |
| Page objects | `tests/pages/*.ts` | Locators + actions per screen (`JoinPage`, `SelectScanPage`, `ScheduleScanPage`, `PaymentPage`, `ConfirmationPage`, `DashboardPage`, `LoginPage`) |
| Config / env | `config/config.ts`, `.env` | Central env access |
| Helpers | `misc/helpers.ts` | Shared utilities (e.g. email alias) |

**Design choices**

- **POM** keeps selectors and user actions in one place so UI changes touch fewer files and specs stay readable.
- **One page class per major screen or concern** (join vs schedule vs payment) so the suite can grow without a single giant class.

---

## Trade-offs and assumptions

- **Staging-only URLs** — `baseURL` in `playwright.config.ts` points at staging. Tests assume that environment is up and data is stable enough for automation.
- **Locators** — A mix of `data-testid`, roles, classes and text/regex is used where test IDs are missing
- **Credentials** — Member credentials live in `.env`. CI should inject secrets via the pipeline
- **Payment** — Stripe fields are driven by third party iframe/title patterns may require maintainance
- **Flakiness** — Long timeouts exist for slow staging; retries in CI help, but the real fix is deterministic waits, not arbitrary sleeps.
- **Scope** — The demo flows are `tests/bookScanAsNewUser.spec.ts` and `tests/bookScanAsExistingUser.spec.ts` 

---

## Scalability
- **Parallelism** — Playwright can run files/workers in parallel
- **CI** — Use `CI=true` to enable this suite to be used in deployments and releases

---
