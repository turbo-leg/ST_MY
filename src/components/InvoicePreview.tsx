'use client';

import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InvoiceData } from '@/types/invoice';

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoiceData }) => {
  const [isDraggingStamp, setIsDraggingStamp] = useState(false);
  const [isDraggingSignature, setIsDraggingSignature] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const stampRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Initialize positions based on screen size
  useEffect(() => {
    const initializePositions = () => {
      if (typeof window === 'undefined') return;
      
      const isMobile = window.innerWidth <= 768;
      
      if (signatureRef.current && !signatureRef.current.style.left) {
        signatureRef.current.style.left = isMobile ? '5%' : '10%';
        signatureRef.current.style.top = '20px';
      }
      
      if (stampRef.current && !stampRef.current.style.left && !stampRef.current.style.right) {
        if (isMobile) {
          stampRef.current.style.right = '5%';
        } else {
          stampRef.current.style.right = '10%';
        }
        stampRef.current.style.top = '20px';
      }
    };

    initializePositions();
    window.addEventListener('resize', initializePositions);
    
    return () => window.removeEventListener('resize', initializePositions);
  }, []);

  const exportToPdf = async () => {
    if (!invoiceRef.current) return;
    
    setIsExporting(true);
    
    try {
      // Store original styles for container
      const originalStyles = {
        width: invoiceRef.current.style.width,
        maxWidth: invoiceRef.current.style.maxWidth,
        padding: invoiceRef.current.style.padding,
        margin: invoiceRef.current.style.margin
      };
      
      // Store original stamp and signature positions
      const originalStampStyles = stampRef.current ? {
        left: stampRef.current.style.left,
        top: stampRef.current.style.top
      } : null;
      
      const originalSignatureStyles = signatureRef.current ? {
        left: signatureRef.current.style.left,
        top: signatureRef.current.style.top
      } : null;
      
      // Temporarily set fixed dimensions for PDF generation
      invoiceRef.current.style.width = '1000px';
      invoiceRef.current.style.maxWidth = '1000px';
      invoiceRef.current.style.padding = '30px';
      invoiceRef.current.style.margin = '0 auto';
      
      // Reset signature and stamp to default positions for PDF
      if (stampRef.current) {
        // Convert right positioning to left for PDF
        const containerWidth = 1000; // Fixed width for PDF
        const stampWidth = Math.min(invoiceData.stampPosition.width, 220);
        const rightPosition = containerWidth * 0.1; // 10% from right
        stampRef.current.style.left = `${containerWidth - rightPosition - stampWidth}px`;
        stampRef.current.style.right = 'auto';
        stampRef.current.style.top = '20px';
      }
      if (signatureRef.current) {
        const leftPosition = 1000 * 0.1; // 10% from left
        signatureRef.current.style.left = `${leftPosition}px`; 
        signatureRef.current.style.top = '20px';
      }
      
      // Force a reflow to apply the new styles
      void invoiceRef.current.offsetHeight;
      
      // Configure html2canvas for better PDF output with fixed sizing
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1000, // Fixed width for consistency
        height: invoiceRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        removeContainer: true
      });
      
      // Restore original styles
      invoiceRef.current.style.width = originalStyles.width;
      invoiceRef.current.style.maxWidth = originalStyles.maxWidth;
      invoiceRef.current.style.padding = originalStyles.padding;
      invoiceRef.current.style.margin = originalStyles.margin;
      
      // Restore original stamp and signature positions
      if (stampRef.current && originalStampStyles) {
        stampRef.current.style.left = originalStampStyles.left;
        stampRef.current.style.top = originalStampStyles.top;
      }
      if (signatureRef.current && originalSignatureStyles) {
        signatureRef.current.style.left = originalSignatureStyles.left;
        signatureRef.current.style.top = originalSignatureStyles.top;
      }
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      // Calculate dimensions based on fixed canvas size
      const imgWidthMM = (canvas.width * 25.4) / (96 * 2); // Adjusted for scale 2
      const imgHeightMM = (canvas.height * 25.4) / (96 * 2);
      
      // Use small margins for maximum content size
      const margin = 10;
      const availableWidth = pdfWidth - (margin * 2);
      const availableHeight = pdfHeight - (margin * 2);
      
      // Calculate scale to fit content optimally
      const scaleX = availableWidth / imgWidthMM;
      const scaleY = availableHeight / imgHeightMM;
      const scale = Math.min(scaleX, scaleY, 1.2); // Limit maximum scale for readability
      
      const finalWidth = imgWidthMM * scale;
      const finalHeight = imgHeightMM * scale;
      
      // Center the content
      const xPosition = (pdfWidth - finalWidth) / 2;
      const yPosition = margin;
      
      pdf.addImage(imgData, 'PNG', xPosition, yPosition, finalWidth, finalHeight, '', 'FAST');
      
      const fileName = `invoice-${invoiceData.invoiceNumber || 'draft'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('PDF үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getFullYear()}`;
  };

  const handleStampDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDraggingStamp(true);
    
    const stampElement = stampRef.current;
    if (!stampElement) return;

    // Convert any percentage or right positioning to left positioning before drag starts
    const rect = stampElement.getBoundingClientRect();
    const parentRect = invoiceRef.current?.getBoundingClientRect();
    if (parentRect) {
      const leftPosition = rect.left - parentRect.left;
      stampElement.style.left = `${leftPosition}px`;
      stampElement.style.right = 'auto';
    }

    // Get initial position from mouse or touch
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const startX = clientX;
    const startY = clientY;
    const startLeft = parseInt(stampElement.style.left) || 0;
    const startTop = parseInt(stampElement.style.top) || 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!stampElement) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      stampElement.style.left = `${startLeft + deltaX}px`;
      stampElement.style.top = `${startTop + deltaY}px`;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!stampElement || !e.touches[0]) return;
      e.preventDefault(); // Prevent scrolling
      
      const deltaX = e.touches[0].clientX - startX;
      const deltaY = e.touches[0].clientY - startY;
      
      stampElement.style.left = `${startLeft + deltaX}px`;
      stampElement.style.top = `${startTop + deltaY}px`;
    };
    
    const handleMouseUp = () => {
      setIsDraggingStamp(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
    
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleMouseUp);
  };

  const handleSignatureDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDraggingSignature(true);
    
    const signatureElement = signatureRef.current;
    if (!signatureElement) return;

    // Get initial position from mouse or touch
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const startX = clientX;
    const startY = clientY;
    const startLeft = parseInt(signatureElement.style.left) || 0;
    const startTop = parseInt(signatureElement.style.top) || 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!signatureElement) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      signatureElement.style.left = `${startLeft + deltaX}px`;
      signatureElement.style.top = `${startTop + deltaY}px`;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!signatureElement || !e.touches[0]) return;
      e.preventDefault(); // Prevent scrolling
      
      const deltaX = e.touches[0].clientX - startX;
      const deltaY = e.touches[0].clientY - startY;
      
      signatureElement.style.left = `${startLeft + deltaX}px`;
      signatureElement.style.top = `${startTop + deltaY}px`;
    };
    
    const handleMouseUp = () => {
      setIsDraggingSignature(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
    
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleMouseUp);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center export-button-container gap-4">
        <div className="text-xs sm:text-sm text-gray-600 flex items-center">
          <span>💡 Зөвлөмж: Тамга болон гарын үсгийг зөөхийн тулд чирж аваарай</span>
        </div>
        <button 
          onClick={exportToPdf} 
          disabled={isExporting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {isExporting ? 'Боловсруулж байна...' : 'PDF-р Хадгалах'}
        </button>
      </div>
      <div ref={invoiceRef} className="invoice-container bg-white relative text-black" style={{ 
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto', 
        minHeight: 'auto',
        padding: '15px 20px', // Reduced padding for mobile
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box'
      }}>
        {/* Top Banner for Michyaki - Full width with no margins */}
        {invoiceData.claimant?.bannerImage && (
          <div className="w-full -mt-4 mb-6" style={{ width: 'calc(100% + 40px)', marginLeft: '-20px', marginRight: '-20px' }}>
            <img 
              src={invoiceData.claimant.bannerImage} 
              alt="Company Banner" 
              className="w-full h-auto"
              style={{ 
                maxHeight: '120px', // Reduced for mobile
                width: '100%',
                display: 'block',
                margin: '0',
                padding: '0'
              }}
              onError={(e) => {
                console.error('Banner image failed to load:', invoiceData.claimant.bannerImage);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => console.log('Banner image loaded:', invoiceData.claimant.bannerImage)}
            />
          </div>
        )}

        {/* Form Header */}
        <div className="text-xs mb-8 text-black" style={{ fontSize: '10pt' }}>
          НХМаягт Т-1<br />
          NH form T-1
        </div>
        
        {/* Title Section */}
        <div className="text-center mb-12 text-black">
          <div className="text-xl font-bold italic text-black mb-2" style={{ fontSize: '16pt' }}>НЭХЭМЖЛЭХ</div>
          <div className="text-xl font-bold italic text-black mb-2" style={{ fontSize: '16pt' }}>INVOICE No.</div>
          <div className="text-lg font-bold italic text-black" style={{ fontSize: '14pt' }}>{invoiceData.invoiceNumber}</div>
        </div>
        
        {/* Main Content - Company Information */}
        <div className="flex justify-center mb-8 sm:mb-12 text-black">
          <div className="flex flex-col sm:flex-row" style={{ fontSize: '9pt', width: '95%' }}>
            <div className="w-full sm:w-1/2 sm:pr-8 mb-6 sm:mb-0">
              {/* Claimant Section */}
              <div className="mb-6">
                <div className="font-bold text-black mb-1">Нэхэмжлэгч/Claimant.</div>
                <div className="font-bold text-black mb-3">Байгууллагын нэр/Company name.</div>
                
                <div className="font-bold text-black mb-1">{invoiceData.claimant.companyName}</div>
                <div className="font-bold text-black mb-3">{invoiceData.claimant.companyNameEn}</div>
                
                <div className="text-black mb-3">РД {invoiceData.claimant.regNumber}</div>
                
                <div className="font-bold text-black mb-1">Хаяг/Address</div>
                <div className="text-black mb-1" style={{ textAlign: 'justify' }}>{invoiceData.claimant.address}</div>
                <div className="text-black mb-3" style={{ textAlign: 'justify' }}>{invoiceData.claimant.addressEn}</div>
                
                <div className="text-black mb-4">Утас/Phone {invoiceData.claimant.phone}</div>
                
                {/* Bank Information */}
                <div className="font-bold text-black mb-1">Банкны нэр/Beneficiary bank.</div>
                <div className="text-black mb-1">{invoiceData.claimant.bankName}</div>
                <div className="text-black mb-1">{invoiceData.claimant.bankNameEn}</div>
                <div className="text-black mb-1" style={{ textAlign: 'justify' }}>Хаяг. {invoiceData.claimant.bankAddress}</div>
                <div className="text-black mb-3" style={{ textAlign: 'justify' }}>Address. {invoiceData.claimant.bankAddressEn}</div>
                
                <div className="text-black">Дансны дугаар/Account No. {invoiceData.claimant.accountNumber}</div>
              </div>
            </div>
            
            <div className="w-full sm:w-1/2 sm:pl-8">
              {/* Payer Section */}
              <div className="mb-6">
                <div className="font-bold text-black mb-1">Төлөгч /Payer Invoice to.</div>
                <div className="font-bold text-black mb-3">Байгууллагын нэр/Company name.</div>
                
                <div className="font-bold text-black mb-1">{invoiceData.payer.companyName}</div>
                <div className="font-bold text-black mb-3">{invoiceData.payer.companyNameEn}</div>
                
                <div className="text-black mb-3">РД {invoiceData.payer.regNumber}</div>
                
                <div className="font-bold text-black mb-1">Хаяг/Address</div>
                <div className="text-black mb-1" style={{ textAlign: 'justify' }}>{invoiceData.payer.address}</div>
                <div className="text-black mb-3" style={{ textAlign: 'justify' }}>{invoiceData.payer.addressEn}</div>
                
                <div className="text-black mb-6">Утас/Phone {invoiceData.payer.phone}</div>
                
                {/* Invoice Date */}
                <div className="mt-4 sm:mt-8">
                  <div className="font-bold text-black mb-1">Нэхэмжилсэн огноо/Invoice date</div>
                  <div className="text-left sm:text-right text-black font-medium">{formatDate(invoiceData.invoiceDate)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Items Table */}
        <div className="flex justify-center mb-6 overflow-x-auto">
          <table className="border-collapse text-black w-full" style={{ fontSize: '8pt', maxWidth: '70%', fontFamily: 'Times, "Times New Roman", serif' }}>
            <thead>
              <tr>
                <th className="border-2 border-black p-2 bg-white text-center font-bold text-black" style={{width: '60%', fontSize: '9pt'}}>Гүйлгээний утга / Description</th>
                <th className="border-2 border-black p-2 bg-white text-center font-bold text-black" style={{width: '20%', fontSize: '9pt'}}>Хугацаа / Period</th>
                <th className="border-2 border-black p-2 bg-white text-center font-bold text-black" style={{width: '20%', fontSize: '9pt'}}>Үнэ / Price</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index: number) => (
                <tr key={index}>
                  <td className="border border-black p-2 text-left text-black" style={{ fontSize: '8pt' }}>{item.description}</td>
                  <td className="border border-black p-2 text-center text-black" style={{ fontSize: '8pt' }}>{item.date || item.period || ''}</td>
                  <td className="border border-black p-2 text-right text-black" style={{ fontSize: '8pt' }}>{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
              
              {/* VAT Row */}
              <tr>
                <td className="border border-black p-2 text-left text-black font-bold" style={{ fontSize: '8pt' }}>VAT / НӨАТ</td>
                <td className="border border-black p-2 text-center text-black"></td>
                <td className="border border-black p-2 text-right text-black font-bold" style={{ fontSize: '8pt' }}>{(invoiceData.totalAmount * 0.1).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              
              {/* Grand Total Row */}
              <tr className="border-2 border-black font-bold">
                <td className="border-2 border-black p-2 text-left text-black font-bold" style={{ fontSize: '9pt' }}>Нийт дүн/ Grand total</td>
                <td className="border-2 border-black p-2 text-center text-black font-bold"></td>
                <td className="border-2 border-black p-2 text-right text-black font-bold" style={{ fontSize: '9pt' }}>{(invoiceData.totalAmount * 1.1).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Accountant Section */}
        <div className="flex justify-center mb-12 text-black">
          <div className="flex justify-between w-4/5" style={{ fontSize: '12pt' }}>
            <div className="text-black font-medium">Нягтлан бодогч/Accountant</div>
            <div className="text-black font-medium">{invoiceData.accountant}</div>
          </div>
        </div>
        
        {/* Signature and Stamp Section */}
        <div className="relative min-h-32">
          {/* Signature Section */}
          {invoiceData.signatureImage && (
            <div 
              ref={signatureRef}
              className={`absolute select-none ${
                isDraggingSignature 
                  ? 'opacity-70 cursor-grabbing z-20' 
                  : 'cursor-grab hover:opacity-90 z-10'
              }`}
              style={{ 
                left: '10%', // Use percentage for mobile responsiveness
                top: '20px',
                width: `${Math.min(invoiceData.signaturePosition.width, 180)}px`, // Limit size on mobile
                height: `${Math.min(invoiceData.signaturePosition.height, 90)}px`,
                touchAction: 'none' // Prevent default touch behaviors
              }}
              onMouseDown={handleSignatureDragStart}
              onTouchStart={handleSignatureDragStart}
            >
              <img 
                src={invoiceData.signatureImage} 
                alt="Signature" 
                className="w-full h-full object-contain pointer-events-none"
                draggable={false}
              />
            </div>
          )}
          
          {/* Stamp Section */}
          {invoiceData.stampImage && (
            <div 
              ref={stampRef}
              className={`absolute select-none ${
                isDraggingStamp 
                  ? 'opacity-70 cursor-grabbing z-20' 
                  : 'cursor-grab hover:opacity-90 z-10'
              }`}
              style={{ 
                right: '10%', // Use right positioning for mobile responsiveness
                top: '20px',
                width: `${Math.min(invoiceData.stampPosition.width, 220)}px`, // Limit size on mobile
                height: `${Math.min(invoiceData.stampPosition.height, 220)}px`,
                touchAction: 'none' // Prevent default touch behaviors
              }}
              onMouseDown={handleStampDragStart}
              onTouchStart={handleStampDragStart}
            >
              <img 
                src={invoiceData.stampImage} 
                alt="Company Stamp" 
                className="w-full h-full object-contain pointer-events-none"
                draggable={false}
              />
            </div>
          )}
        </div>

        {/* Footer for Michyaki - Full width with no margins */}
        {invoiceData.claimant?.footerImage && (
          <div className="w-full mt-6" style={{ width: 'calc(100% + 40px)', marginLeft: '-20px', marginRight: '-20px' }}>
            <img 
              src={invoiceData.claimant.footerImage} 
              alt="Company Footer" 
              className="w-full h-auto"
              style={{ 
                maxHeight: '100px', // Reduced for mobile
                width: '100%',
                display: 'block',
                margin: '0',
                padding: '0'
              }}
              onError={() => {
                console.error('Footer image failed to load:', invoiceData.claimant.footerImage);
              }}
              onLoad={() => console.log('Footer image loaded successfully:', invoiceData.claimant.footerImage)}
            />
          </div>
        )}

        <style jsx>{`
          @media print {
            .invoice-container {
              padding: 30px;
              border: none;
              width: 1000px;
              max-width: 1000px;
              margin: 0;
              box-sizing: border-box;
            }
            
            .export-button-container {
              display: none;
            }
          }
          
          @media (max-width: 768px) {
            .invoice-container {
              padding: 15px 20px !important;
              font-size: 12px;
            }
            
            table {
              font-size: 10px !important;
            }
            
            th, td {
              padding: 8px !important;
            }
            
            /* Limit stamp and signature sizes on mobile */
            .invoice-container .absolute img {
              max-width: 150px !important;
              max-height: 150px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default InvoicePreview;
