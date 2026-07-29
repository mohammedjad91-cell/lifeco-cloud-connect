import React, { useState } from 'react';

interface ReportShareButtonsProps {
  reportId: string;
  reportName: string;
  onShare?: (method: 'email' | 'link' | 'download') => void;
}

export const ReportShareButtons: React.FC<ReportShareButtonsProps> = ({
  reportId,
  reportName,
  onShare,
}) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/reports/${reportId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onShare?.('link');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Report: ${reportName}`);
    const body = encodeURIComponent(`Check out this report: ${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    onShare?.('email');
  };

  const handleDownload = () => {
    // Implement download logic based on your backend
    onShare?.('download');
  };

  return (
    <div className="report-share-buttons">
      <button
        onClick={handleCopyLink}
        className="btn btn-secondary"
        title="نسخ رابط المشاركة"
      >
        {copied ? '✓ تم النسخ' : '📋 نسخ الرابط'}
      </button>
      <button
        onClick={handleShareEmail}
        className="btn btn-secondary"
        title="مشاركة عبر البريد الإلكتروني"
      >
        📧 البريد الإلكتروني
      </button>
      <button
        onClick={handleDownload}
        className="btn btn-secondary"
        title="تنزيل التقرير"
      >
        📥 تنزيل
      </button>
    </div>
  );
};

export default ReportShareButtons;
