// Adapted from ritsth/job-autofill-extension src/content/adapters/shared.ts (MIT).
// Only high-confidence contact fields are eligible. Employer questions, skills,
// salary, eligibility, and consent controls are always left for the applicant.
import { fillInput, getLabelText } from '../content/adapters/shared';
import type { Profile } from './types';

const forbidden = /password|login|sign.?in|verification|one.?time|code|captcha|consent|agreement|signature|salary|sponsor|citizen|authorized|veteran|disab|gender|ethnic|race|reference|employer|company|school|cover letter|why\b|describe|experience|skill|legal name.*different/i;

function fieldValue(label: string, profile: Profile): string {
  if (forbidden.test(label)) return '';
  if (/\b(first|given)\s*name\b/.test(label)) return profile.firstName;
  if (/\b(last|family|sur)\s*name\b/.test(label)) return profile.lastName;
  if (/\b(full|legal)\s*name\b/.test(label)) return `${profile.firstName} ${profile.lastName}`.trim();
  if (/\be-?mail\b/.test(label)) return profile.email;
  if (/\b(phone|mobile|telephone)\b/.test(label)) return profile.phone;
  if (/\blinkedin\b/.test(label)) return profile.linkedin;
  if (/\bgithub\b/.test(label)) return profile.github;
  if (/\b(portfolio|personal website)\b/.test(label)) return profile.portfolio;
  return '';
}

export function plannedFields(profile: Profile): Array<{ element: HTMLInputElement; label: string; value: string }> {
  return Array.from(document.querySelectorAll<HTMLInputElement>('input')).flatMap(element => {
    if (!['text', 'email', 'tel', 'url'].includes(element.type) || element.disabled || element.readOnly || element.value.trim()) return [];
    if (element.getAttribute('role') === 'combobox' || element.getAttribute('aria-autocomplete')) return [];
    if (element.getClientRects().length === 0) return [];
    const label = getLabelText(element);
    const value = fieldValue(label, profile);
    return value ? [{ element, label: label.slice(0, 120), value }] : [];
  });
}

export function fillContactFields(profile: Profile) {
  const fields = plannedFields(profile);
  for (const field of fields) fillInput(field.element, field.value);
  return fields.map(({ label, value }) => ({ label, value }));
}

export function handoffBlocker(): string | undefined {
  if (document.querySelector('input[type="password"], input[autocomplete="one-time-code"]')) return 'Login or two-factor verification needs you.';
  if (document.querySelector('iframe[src*="captcha" i], [id*="captcha" i], [class*="captcha" i]')) return 'Complete the CAPTCHA yourself, then return to Prefillo.';
  if (/\/(login|signin|sign-in|auth)(?:\/|$)/i.test(location.pathname)) return 'Sign in yourself, then return to the application.';
  return undefined;
}
