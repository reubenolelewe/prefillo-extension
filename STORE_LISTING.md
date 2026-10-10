# Chrome Web Store listing draft

**Status:** Draft; not submitted or published. Replace the API origin with the deployed HTTPS Prefillo web companion and complete the account, payment, and privacy setup before uploading.

**Name:** Prefillo

**Short description:** Review-first autofill for Greenhouse, Lever, and Ashby job applications.

**Detailed description:** Prefillo helps you fill repeated contact details on supported job applications while you stay in control. Open a Greenhouse, Lever, or Ashby application, review the detected page in the Prefillo side panel, and choose “Fill contact fields for review.” Prefillo checks your license, fills only empty contact fields, and shows the result. You complete all remaining questions and click Submit yourself. Workday offers copy assistance only. The extension does not automate LinkedIn, solve CAPTCHAs, handle login or two-factor verification, invent resume claims, or submit applications.

**Single purpose:** Assist user-initiated, review-first job application form filling on supported ATS websites.

**Permission explanation:** `storage` saves the applicant-entered contact profile and license credential on the device. `activeTab` identifies the application tab after the user opens the side panel. `sidePanel` shows profile, license, and review UI. Host permissions cover only Greenhouse, Lever, Ashby, Workday, and the configured Prefillo API. The API permission supports allowance checks. Workday is copy-assist only.

**Privacy policy URL:** Use the deployed `https://YOUR-PREFILLO-DOMAIN/privacy` page. A localhost URL cannot be used for a public listing.

**Required before submission:** deployed HTTPS API and Firebase/Firestore/Stripe configuration; store developer account; 1280×800 or 640×400 screenshots of the Prefillo side panel on supported pages using demonstration data; confirm extension ID in `PREFILLO_EXTENSION_ID`; package the production `dist/` directory and upload it for review. Chrome Web Store publication remains subject to Google review.
