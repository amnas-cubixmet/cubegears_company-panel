import { useEffect, useState } from 'react';
import { Coins, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFeatureAccess } from '../../context/FeatureAccessContext';
import { creditWalletService } from '../../services/creditWallet.service';

const format = (v) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(v));

export function CreditBalanceChip({ compact = false }) {
  const navigate = useNavigate();
  const { isCompanyOwner, companyId } = useFeatureAccess();
  const [wallet, setWallet] = useState(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setWallet(null);
    if (!isCompanyOwner) return undefined;
    let active = true;
    const refresh = async () => {
      try {
        const state = await creditWalletService.overview();
        if (active) { setWallet(state); setOffline(false); }
      } catch {
        if (active) { setWallet(null); setOffline(true); }
      }
    };
    refresh();
    window.addEventListener('cubegear:credits-updated', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      window.removeEventListener('cubegear:credits-updated', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [isCompanyOwner, companyId]);

  if (!isCompanyOwner) return null;

  return <button
    className={`cg-credit-chip ${wallet?.lowBalance ? 'is-low' : ''}`}
    type="button" onClick={() => navigate('/account/credits/buy')}
    aria-label={offline ? 'Credits unavailable; open credit wallet' : `Credit balance: ${wallet?.balance ?? 'unavailable'}; buy credits`}
    title={offline ? 'Unable to load wallet' : 'Your verified credit balance'}
  >
    <Coins size={compact ? 16 : 18} aria-hidden="true"/>
    <span>{wallet?.balance == null ? '—' : format(wallet.balance)} <small>{compact ? 'cr' : 'credits'}</small></span>
    {wallet?.lowBalance && <em>LOW</em>}
    {!compact && <ArrowUpRight size={13} aria-hidden="true"/>}
  </button>;
}
