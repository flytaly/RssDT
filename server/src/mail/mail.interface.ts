export interface SimpleMail {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}
