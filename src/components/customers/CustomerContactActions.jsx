import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { customerContactLinks } from '../jobs/customerContact.utils';

/**
 * Contact actions never navigate to the customer's profile.
 * Their own links stay interactive even when the containing customer row is clickable.
 */
export const CustomerContactActions = ({ customer, compact = false }) => {
  const { callUrl, whatsappUrl } = customerContactLinks({
    customerPhone: customer?.phone,
    customerWhatsapp: customer?.whatsapp,
  });
  const name = customer?.name || 'customer';

  return (
    <div className={'customer-directory-contact' + (compact ? ' is-compact' : '')}
      aria-label={'Contact ' + name} onClick={(event) => event.stopPropagation()}>
      {callUrl ? (
        <a href={callUrl} className="customer-directory-contact__button is-call"
          title={'Call ' + name} aria-label={'Call ' + name}>
          <Phone size={15} aria-hidden="true" /><span>Call</span>
        </a>
      ) : (
        <span className="customer-directory-contact__button is-disabled"
          aria-label="Customer phone number unavailable"><Phone size={15} aria-hidden="true"/><span>Call</span></span>
      )}
      {whatsappUrl ? (
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
          className="customer-directory-contact__button is-whatsapp"
          title={'WhatsApp ' + name} aria-label={'WhatsApp ' + name}>
          <MessageCircle size={15} aria-hidden="true"/><span>WhatsApp</span>
        </a>
      ) : (
        <span className="customer-directory-contact__button is-disabled"
          aria-label="Customer WhatsApp number unavailable"><MessageCircle size={15} aria-hidden="true"/><span>WhatsApp</span></span>
      )}
    </div>
  );
};
