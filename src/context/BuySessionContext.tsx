import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { BuySession, BuySessionDisplay, BuySessionItem, createBuySession } from '../types/buySession';
import { useStore } from './StoreContext';
import { track } from '../lib/analytics/client';

interface BuySessionContextType {
  session: BuySessionDisplay | null;
  isOpen: boolean;
  openSession: (items: BuySessionItem[], storeId: string) => BuySession;
  closeSession: () => void;
  regenerateSession: () => void;
}

const SESSION_STORAGE_KEY = 'ecommerce_buy_session_v1';

const BuySessionContext = createContext<BuySessionContextType | undefined>(undefined);

function buildDisplay(session: BuySession, products: ReturnType<typeof useStore>['products']): BuySessionDisplay {
  const map = new Map(products.map((p) => [p.id, p]));
  const lines = session.items.flatMap((item) => {
    const product = map.get(item.id);
    if (!product) return [];
    const price = typeof product.price === 'number' ? product.price : 0;
    return [{ ...item, product, lineTotal: price * item.qty }];
  });
  const totalCount = session.items.reduce((s, i) => s + i.qty, 0);
  const totalSum = lines.reduce((s, l) => s + l.lineTotal, 0);
  const expiresAt = new Date(session.exp);
  const timeRemaining = Math.max(0, session.exp - Date.now());
  return { session, lines, totalCount, totalSum, expiresAt, timeRemaining };
}

export const BuySessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { products } = useStore();
  const [session, setSession] = useState<BuySession | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && typeof parsed.exp === 'number' && parsed.exp > Date.now()) {
          setSession(parsed);
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (session) {
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch {
        // ignore
      }
    } else {
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, [session]);

  const openSession = useCallback(
    (items: BuySessionItem[], storeId: string) => {
      const newSession = createBuySession(items, storeId);
      setSession(newSession);
      setIsOpen(true);
      return newSession;
    },
    []
  );

  const closeSession = useCallback(() => {
    setIsOpen(false);
  }, []);

  const regenerateSession = useCallback(() => {
    if (!session) return;
    const newSession = createBuySession(session.items, session.storeId);
    setSession(newSession);
    track('buy_session_regenerated', {
      metadata: {
        itemCount: session.items.length,
      },
    });
  }, [session]);

  const display = useMemo(() => (session ? buildDisplay(session, products) : null), [session, products]);

  // Auto-close when expired
  useEffect(() => {
    if (!display) return;
    const interval = setInterval(() => {
      if (display.timeRemaining <= 0) {
        track('buy_session_expired', { metadata: { code: session?.code } });
        setSession(null);
        setIsOpen(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [display, session]);

  return (
    <BuySessionContext.Provider
      value={{
        session: display,
        isOpen,
        openSession,
        closeSession,
        regenerateSession,
      }}
    >
      {children}
    </BuySessionContext.Provider>
  );
};

export const useBuySession = (): BuySessionContextType => {
  const context = useContext(BuySessionContext);
  if (!context) {
    throw new Error('useBuySession must be used within a BuySessionProvider');
  }
  return context;
};