export interface InvoiceItem {
  description: string;
  date: string;
  period: string;
  amount: number;
}

export interface Company {
  companyName: string;
  companyNameEn: string;
  regNumber: string;
  address: string;
  addressEn: string;
  phone: string;
  bankName?: string;
  bankNameEn?: string;
  bankAddress?: string;
  bankAddressEn?: string;
  accountNumber?: string;
  stampImage?: string;
  bannerImage?: string | null;
  footerImage?: string | null;
}

export interface Payer {
  companyName: string;
  companyNameEn: string;
  regNumber: string;
  address: string;
  addressEn: string;
  phone: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  claimant: Company;
  payer: Payer;
  items: InvoiceItem[];
  totalAmount: number;
  accountant: string;
  stampImage: string | null;
  signatureImage: string | null;
  stampPosition: { width: number; height: number };
  signaturePosition: { width: number; height: number };
}

export interface ClaimantOptions {
  [key: string]: Company;
}