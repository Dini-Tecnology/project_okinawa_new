/**
 * useWaiterPayment — Payment flow state machine hook
 *
 * Manages the 4-step payment flow:
 *   1. Guest selection
 *   2. Method selection (TAP/PIX/Card/Cash)
 *   3. Processing (NFC animation)
 *   4. Confirmation
 *
 * @module waiter/hooks/useWaiterPayment
 */

import { useState, useCallback } from 'react';
import type { PaymentStep, PaymentMethod } from '../types/waiter.types';

interface UseWaiterPaymentReturn {
  step: PaymentStep;
  selectedGuestName: string | null;
  selectedMethod: PaymentMethod | null;
  isProcessing: boolean;

  selectGuest: (guestName: string) => void;
  selectMethod: (method: PaymentMethod) => void;
  confirmPayment: () => Promise<void>;
  goBack: () => void;
  reset: () => void;
  goToNext: () => void;
}

export function useWaiterPayment(): UseWaiterPaymentReturn {
  const [step, setStep] = useState<PaymentStep>('guests');
  const [selectedGuestName, setSelectedGuestName] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectGuest = useCallback((guestName: string) => {
    setSelectedGuestName(guestName);
    setStep('method');
  }, []);

  const selectMethod = useCallback((method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('processing');
  }, []);

  const confirmPayment = useCallback(async () => {
    setIsProcessing(true);
    try {
      // In production: await apiClient.post('/payments/process', { ... })
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStep('done');
    } catch (error) {
      console.error('Payment failed:', error);
      // Keep on processing step so user can retry
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const goBack = useCallback(() => {
    switch (step) {
      case 'method':
        setStep('guests');
        setSelectedGuestName(null);
        break;
      case 'processing':
        setStep('method');
        setSelectedMethod(null);
        break;
      case 'done':
        setStep('guests');
        setSelectedGuestName(null);
        setSelectedMethod(null);
        break;
      default:
        break;
    }
  }, [step]);

  const reset = useCallback(() => {
    setStep('guests');
    setSelectedGuestName(null);
    setSelectedMethod(null);
    setIsProcessing(false);
  }, []);

  const goToNext = useCallback(() => {
    setStep('guests');
    setSelectedGuestName(null);
    setSelectedMethod(null);
  }, []);

  return {
    step,
    selectedGuestName,
    selectedMethod,
    isProcessing,
    selectGuest,
    selectMethod,
    confirmPayment,
    goBack,
    reset,
    goToNext,
  };
}
