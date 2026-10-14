import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { customerContactLinks } from './customerContact.utils';

export const JobCustomerContactActions = ({ job }) => {
  const { callUrl, whatsappUrl } = customerContactLinks(job);
  const customerName = job.customerName || 'customer';

  return (
    <div className="jobs-customer-contact-actions" aria-label={'Contact ' + customerName}>
      {callUrl ? (
        <a className="jobs-customer-contact-button is-call" href={callUrl}
          aria-label={'Call ' + customerName} title={'Call ' + customerName}>
          <Phone size={14} aria-hidden="true" /><span>Call</span>
        </a>
      ) : (
        <span className="jobs-customer-contact-button is-disabled" aria-label="Customer phone number unavailable"
          title="Phone number unavailable"><Phone size={14} aria-hidden="true"/><span>Call</span></span>
      )}
      {whatsappUrl ? (
        <a className="jobs-customer-contact-button is-whatsapp" href={whatsappUrl}
          target="_blank" rel="noopener noreferrer"
          aria-label={'WhatsApp ' + customerName} title={'WhatsApp ' + customerName}>
          <MessageCircle size={14} aria-hidden="true" /><span>WhatsApp</span>
        </a>
      ) : (
        <span className="jobs-customer-contact-button is-disabled" aria-label="Customer WhatsApp number unavailable"
          title="WhatsApp number unavailable"><MessageCircle size={14} aria-hidden="true"/><span>WhatsApp</span></span>
      )}
    </div>
  );
};
