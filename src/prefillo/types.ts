export type Ats = 'greenhouse' | 'lever' | 'ashby' | 'workday';
export type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  github: string;
};
export type PageInfo = {
  site: Ats;
  company: string;
  role: string;
  url: string;
  copyOnly: boolean;
  fillable: number;
  blocker?: string;
};
export type FillResult = {
  filled: Array<{ label: string; value: string }>;
  skipped: number;
  message: string;
  blocker?: string;
  balance?: number;
};
export const emptyProfile: Profile = {
  firstName: '', lastName: '', email: '', phone: '', linkedin: '', portfolio: '', github: '',
};
