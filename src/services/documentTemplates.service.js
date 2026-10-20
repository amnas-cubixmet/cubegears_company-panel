import { settingsService } from './settings.service';

// Saved by the Django CompanySetting model, isolated per authenticated tenant.
// These defaults are also used while loading and for legacy finalized invoices.
export const templateDefaults = {
  invoiceTemplate: 'modern',
  estimateTemplate: 'modern',
  accent: 'teal',
  showOriginal: true,
  showSellerMark: true,
  compactTable: false,
  customName: 'My Custom Template',
  customHeader: 'Tax Invoice',
  customFooter: 'Thank you for your business.',
  customShowTransport: true,
  customShowTaxTable: true,
  businessLogo: '',
  businessName: 'CubixGear Workshop',
  businessLegalName: '',
  businessGstin: '',
  businessPhone: '',
  businessEmail: '',
  businessAddress: '',
  businessState: 'Kerala',
  businessStateCode: '32',
  businessWebsite: '',
  businessPan: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankIfsc: '',
  bankUpi: '',
  authorizedSignatory: '',
  termsText: 'Goods once sold will not be taken back.',
  showBusinessLogo: true,
  showBankDetails: true,
  showTerms: true,
  showSignature: true
};

export const loadDocumentTemplateSettings = async () => ({
  ...templateDefaults,
  ...(await settingsService.getSettings('document_templates')),
});

export const saveDocumentTemplateSettings = async (settings) =>
  settingsService.updateSettings('document_templates', settings);

export const resolveDocumentAppearance = (kind, currentSettings, savedSnapshot = null, finalized = false) => {
  const source = savedSnapshot && Object.keys(savedSnapshot).length
    ? savedSnapshot
    : finalized ? { ...templateDefaults, accent: 'blue' } : currentSettings;
  return { ...templateDefaults, ...(source || {}),
    selectedTemplate: kind === 'estimate'
      ? (source?.estimateTemplate || templateDefaults.estimateTemplate)
      : (source?.invoiceTemplate || templateDefaults.invoiceTemplate),
  };
};
