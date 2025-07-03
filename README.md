# Invoice Generator with PDF Export

A Next.js application for generating professional invoices with customizable fields, stamp and signature capabilities, and PDF export.

## Features

- Create customizable invoices with company information
- Add and position company stamp and signature
- Export invoices to PDF format
- Modern UI with Tailwind CSS

## Technologies Used

- Next.js with App Router
- TypeScript
- Tailwind CSS for styling
- PDF generation libraries:
  - html2canvas
  - jsPDF
  - html-to-image

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Fill in the invoice form with your company details, recipient information, and invoice items
2. Upload your company stamp and signature images
3. Preview the invoice and adjust stamp/signature positions by dragging
4. Export the invoice to PDF

## Learn More

This project was bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
