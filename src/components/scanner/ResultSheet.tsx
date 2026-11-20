import React from 'react';
import { SimpleModalSheet } from './SimpleModalSheet';

/**
 * Base Result Sheet Component
 *
 * Wrapper around SimpleModalSheet for scanner result modals.
 */

export interface ResultSheetProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  heightPercentage?: number;
}

export function ResultSheet({ visible, onDismiss, children, heightPercentage }: ResultSheetProps) {
  return (
    <SimpleModalSheet visible={visible} onDismiss={onDismiss} heightPercentage={heightPercentage}>
      {children}
    </SimpleModalSheet>
  );
}
