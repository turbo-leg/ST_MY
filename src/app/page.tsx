'use client';

import React, { useState } from 'react';
import InvoiceForm from '@/components/InvoiceForm';
import InvoicePreview from '@/components/InvoicePreview';

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  claimant: {
    companyName: string;
    companyNameEn: string;
    regNumber: string;
    address: string;
    addressEn: string;
    phone: string;
    bankName: string;
    bankNameEn: string;
    bankAddress: string;
    bankAddressEn: string;
    accountNumber: string;
    bannerImage?: string | null;
    footerImage?: string | null;
  };
  payer: {
    companyName: string;
    companyNameEn: string;
    regNumber: string;
    address: string;
    addressEn: string;
    phone: string;
  };
  items: Array<{
    description: string;
    date: string;
    period: string;
    amount: number;
  }>;
  totalAmount: number;
  accountant: string;
  stampImage: string | null;
  signatureImage: string | null;
  stampPosition: { width: number; height: number };
  signaturePosition: { width: number; height: number };
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  
  // Pre-defined claimant companies
  const claimantOptions = {
    michyaki: {
      companyName: 'МИЧИАКИ БИ ЭНД ЮУ ХХК',
      companyNameEn: 'MICHYAKI B&U LLC',
      regNumber: '8423636',
      address: 'БГД-ийн 20-р хороо, Үйлдвэрийн баруун бүс, Нөхөрлөлийн гудамж-79/1',
      addressEn: 'Unit 79, Partnership street, Western industrial area, 20th khoroo, Bayangol district, Ulaanbaatar, Mongolia',
      phone: '976-77110235',
      bankName: 'ГОЛОМТ БАНК',
      bankNameEn: 'GOLOMT BANK OF MONGOLIA',
      bankAddress: 'Д.Сүхбаатарын талбай 5, 15160',
      bankAddressEn: 'D.Sukhbaatar Square 5, 15160',
      accountNumber: '3675113178/ MNT /',
      stampImage: '/my_tamga.png',
      bannerImage: '/michyaki_top_banner.png',
      footerImage: '/michyaki_footer.png'
    },
    sti: {
      companyName: 'ЭС ТИ ИНТЕРНЭШНЛ ХХК',
      companyNameEn: 'STI INTERNATIONAL LLC',
      regNumber: '5404754',
      address: 'БГД-ийн 20-р хороо, Үйлдвэрийн баруун бүс, Нөхөрлөлийн гудамж-79',
      addressEn: 'Unit 79, Partnership street, Western industrial area, 20th khoroo, Bayangol district, Ulaanbaatar, Mongolia',
      phone: '976-77110235, 99019838',
      bankName: 'Худалдаа хөгжлийн банк',
      bankNameEn: 'Trade and Development Bank of Mongolia',
      bankAddress: '14210 Peace avenue 19, Sukhbaatar district 1th khoroo, Ulaanbaatar Mongolia',
      bankAddressEn: 'Address: 14210 Peace avenue 19, Sukhbaatar district 1th khoroo, Ulaanbaatar Mongolia',
      accountNumber: '499178416 / MNT /, 499178417 / USD /',
      stampImage: '/st_tamga.png',
      bannerImage: null,
      footerImage: null
    }
  };

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: 'CU-001',
    invoiceDate: '',
    claimant: { ...claimantOptions.michyaki }, // Default to first company with banner
    payer: {
      companyName: '',
      companyNameEn: '',
      regNumber: '',
      address: '',
      addressEn: '',
      phone: ''
    },
    items: [],
    totalAmount: 0,
    accountant: 'Г.ГАНСҮРЭН',
    stampImage: '/my_tamga.png', // Default stamp for first company
    signatureImage: '/signiture.png', // Fixed signature for all
    stampPosition: { width: 250, height: 250 }, // Increased from 200x200
    signaturePosition: { width: 200, height: 100 } // Increased from 150x75
  });

  const handleInvoiceDataChange = (newData: InvoiceData) => {
    setInvoiceData(newData);
  };

  const handleClaimantChange = (companyKey: keyof typeof claimantOptions) => {
    setInvoiceData(prev => ({
      ...prev,
      claimant: { ...claimantOptions[companyKey] }, // Spread to include all properties including footer
      stampImage: claimantOptions[companyKey].stampImage // Update stamp when company changes
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-black">Нэхэмжлэх үүсгэгч / Invoice Generator</h1>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'form'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Маягт бөглөх / Fill Form
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Урьдчилан харах / Preview
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'form' ? (
            <InvoiceForm 
              invoiceData={invoiceData} 
              onInvoiceDataChange={handleInvoiceDataChange}
              claimantOptions={claimantOptions}
              onClaimantChange={handleClaimantChange}
            />
          ) : (
            <InvoicePreview invoiceData={invoiceData} />
          )}
        </div>
      </div>
    </div>
  );
}
