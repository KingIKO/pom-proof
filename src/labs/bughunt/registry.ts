import type { ComponentType } from 'react';
import { CheckoutCart } from './CheckoutCart';
import { SignupForm } from './SignupForm';

export interface BugAppProps {
  onTrigger: (id: string) => void;
}

export const bugApps = new Map<string, ComponentType<BugAppProps>>([
  ['checkout-cart', CheckoutCart],
  ['signup-form', SignupForm],
]);
