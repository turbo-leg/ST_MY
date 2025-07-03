'use client';

import React, { useState, useEffect } from 'react';

interface Item {
  description: string;
  date: string;
  period: string;
  amount: number;
}

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
  };
  payer: {
    companyName: string;
    companyNameEn: string;
    regNumber: string;
    address: string;
    addressEn: string;
    phone: string;
  };
  items: Item[];
  totalAmount: number;
  accountant: string;
  stampImage: string | null;
  signatureImage: string | null;
  stampPosition: { width: number; height: number };
  signaturePosition: { width: number; height: number };
}

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  onInvoiceDataChange: (data: InvoiceData) => void;
  claimantOptions: {
    michyaki: any;
    sti: any;
  };
  onClaimantChange: (companyKey: 'michyaki' | 'sti') => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ 
  invoiceData, 
  onInvoiceDataChange, 
  claimantOptions, 
  onClaimantChange 
}) => {
  const [localData, setLocalData] = useState<InvoiceData>(invoiceData);

  useEffect(() => {
    setLocalData(invoiceData);
  }, [invoiceData]);

  const calculateTotal = () => {
    const total = localData.items.reduce((sum, item) => sum + item.amount, 0);
    const updatedData = { ...localData, totalAmount: total };
    setLocalData(updatedData);
    onInvoiceDataChange(updatedData);
  };

  useEffect(() => {
    calculateTotal();
  }, [localData.items]);

  const handleInputChange = (section: keyof InvoiceData, field: string, value: string) => {
    const updatedData = { ...localData };
    if (section === 'claimant' || section === 'payer') {
      (updatedData[section] as any)[field] = value;
    } else {
      (updatedData as any)[field] = value;
    }
    setLocalData(updatedData);
    onInvoiceDataChange(updatedData);
  };

  const validateForm = () => {
    const errors = [];
    if (!localData.invoiceNumber.trim()) errors.push('Нэхэмжлэхийн дугаар');
    if (!localData.invoiceDate) errors.push('Нэхэмжилсэн огноо');
    if (!localData.payer.companyName.trim()) errors.push('Төлөгчийн компанийн нэр');
    if (localData.items.length === 0) errors.push('Нэхэмжлэлийн зүйл');
    
    return errors;
  };

  const handleItemChange = (index: number, field: keyof Item, value: string) => {
    const updatedItems = [...localData.items];
    if (field === 'amount') {
      updatedItems[index][field] = parseFloat(value) || 0;
    } else {
      updatedItems[index][field] = value;
    }
    
    const updatedData = { ...localData, items: updatedItems };
    setLocalData(updatedData);
    onInvoiceDataChange(updatedData);
  };

  const addItem = () => {
    const updatedData = {
      ...localData,
      items: [...localData.items, { description: '', date: '', period: '', amount: 0 }]
    };
    setLocalData(updatedData);
    onInvoiceDataChange(updatedData);
  };

  const removeItem = (index: number) => {
    const updatedItems = localData.items.filter((_, i) => i !== index);
    const updatedData = { ...localData, items: updatedItems };
    setLocalData(updatedData);
    onInvoiceDataChange(updatedData);
  };

  return (
    <div className="space-y-8">
      {/* Validation Summary */}
      {(() => {
        const errors = validateForm();
        if (errors.length > 0) {
          return (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Анхаар!</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Дараах талбаруудыг бөглөх шаардлагатай:</p>
                    <ul className="list-disc list-inside mt-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Company Selection */}
      <div>
        <h3 className="text-lg font-semibold text-black mb-4">Компани сонгох / Select Company</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onClaimantChange('michyaki')}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              invoiceData.claimant.companyName === claimantOptions.michyaki.companyName
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <div className="font-semibold text-black">{claimantOptions.michyaki.companyName}</div>
            <div className="text-sm text-gray-600">{claimantOptions.michyaki.companyNameEn}</div>
            <div className="text-xs text-gray-500">РД: {claimantOptions.michyaki.regNumber}</div>
          </button>
          <button
            onClick={() => onClaimantChange('sti')}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              invoiceData.claimant.companyName === claimantOptions.sti.companyName
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <div className="font-semibold text-black">{claimantOptions.sti.companyName}</div>
            <div className="text-sm text-gray-600">{claimantOptions.sti.companyNameEn}</div>
            <div className="text-xs text-gray-500">РД: {claimantOptions.sti.regNumber}</div>
          </button>
        </div>
      </div>

      {/* Invoice Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Нэхэмжлэхийн дугаар / Invoice Number
          </label>
          <input
            type="text"
            value={localData.invoiceNumber}
            onChange={(e) => handleInputChange('invoiceNumber' as keyof InvoiceData, 'invoiceNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="CU-001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Нэхэмжилсэн огноо / Invoice Date
          </label>
          <input
            type="date"
            value={localData.invoiceDate}
            onChange={(e) => handleInputChange('invoiceDate' as keyof InvoiceData, 'invoiceDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>
      </div>

      {/* Payer Information */}
      <div>
        <h3 className="text-lg font-semibold text-black mb-4">Төлөгч мэдээлэл / Payer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Компанийн нэр (Монгол) / Company Name (Mongolian)
            </label>
            <input
              type="text"
              value={localData.payer.companyName}
              onChange={(e) => handleInputChange('payer', 'companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Компанийн нэр"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Компанийн нэр (Англи) / Company Name (English)
            </label>
            <input
              type="text"
              value={localData.payer.companyNameEn}
              onChange={(e) => handleInputChange('payer', 'companyNameEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Company Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Регистрийн дугаар / Registration Number
            </label>
            <input
              type="text"
              value={localData.payer.regNumber}
              onChange={(e) => handleInputChange('payer', 'regNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="1234567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Утас / Phone
            </label>
            <input
              type="text"
              value={localData.payer.phone}
              onChange={(e) => handleInputChange('payer', 'phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="976-12345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Хаяг (Монгол) / Address (Mongolian)
            </label>
            <input
              type="text"
              value={localData.payer.address}
              onChange={(e) => handleInputChange('payer', 'address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Хаяг"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Хаяг (Англи) / Address (English)
            </label>
            <input
              type="text"
              value={localData.payer.addressEn}
              onChange={(e) => handleInputChange('payer', 'addressEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Address"
            />
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div>
        <h3 className="text-lg font-semibold text-black mb-4">Нэхэмжлэлийн зүйлс / Invoice Items</h3>
        <div className="space-y-4">
          {localData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-300 rounded-md">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Тайлбар / Description
                </label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Үйлчилгээний тайлбар"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Огноо / Date
                </label>
                <input
                  type="text"
                  value={item.date}
                  onChange={(e) => handleItemChange(index, 'date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="2025/01/01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Хугацаа / Period
                </label>
                <input
                  type="text"
                  value={item.period}
                  onChange={(e) => handleItemChange(index, 'period', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="1 сар"
                />
              </div>
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-black mb-2">
                    Дүн / Amount
                  </label>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="0"
                    step="0.01"
                  />
                </div>
                <button
                  onClick={() => removeItem(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Устгах
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addItem}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Зүйл нэмэх / Add Item
          </button>
        </div>
      </div>

      {/* File Uploads - Now showing predefined images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Тамга / Company Stamp
          </label>
          <div className="p-4 border border-gray-300 rounded-md bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">
              Сонгосон компанийн тамга / Selected Company Stamp
            </div>
            {localData.stampImage && (
              <img 
                src={localData.stampImage} 
                alt="Company Stamp" 
                className="w-20 h-20 object-contain border bg-white rounded" 
              />
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Гарын үсэг / Signature
          </label>
          <div className="p-4 border border-gray-300 rounded-md bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">
              Тогтмол гарын үсэг / Fixed Signature
            </div>
            {localData.signatureImage && (
              <img 
                src={localData.signatureImage} 
                alt="Signature" 
                className="w-32 h-16 object-contain border bg-white rounded" 
              />
            )}
          </div>
        </div>
      </div>

      {/* Total Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-black mb-4">Дүнгийн тайлан / Amount Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-300">
            <span className="text-base font-medium text-black">Үндсэн дүн / Subtotal:</span>
            <span className="text-lg font-semibold text-black">₮{localData.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-300">
            <span className="text-base font-medium text-gray-700">НӨАТ (10%) / VAT (10%):</span>
            <span className="text-lg font-medium text-gray-700">₮{(localData.totalAmount * 0.1).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center py-3 bg-blue-50 px-4 rounded-md border-2 border-blue-200">
            <span className="text-lg font-bold text-blue-800">Нийт дүн / Grand Total:</span>
            <span className="text-xl font-bold text-blue-800">₮{(localData.totalAmount * 1.1).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
