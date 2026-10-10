# Prefillo extension privacy

The active extension stores applicant-entered contact details and a Prefillo license key or Firebase ID token in Chrome local storage. It does not request or store passwords. It reads only Greenhouse, Lever, Ashby, and Workday pages covered by the manifest. It does not automate LinkedIn or submit applications.

Before autofill, the extension sends its license credential and the job URL, company, and role to the Prefillo API to verify and count allowance. Contact details are placed in employer form fields only after the applicant clicks Fill. Workday remains copy-assist only. The applicant handles login, CAPTCHA, two-factor verification, remaining questions, and final submission.

The web companion privacy page must be hosted at `/privacy` on the production HTTPS domain before Chrome Web Store submission. See `STORE_LISTING.md`.
