import React, { forwardRef } from 'react';
import { SimpleModalSheet, type SimpleModalSheetRef } from './SimpleModalSheet';

/**
 * Base Result Sheet Component
 * 
 * Wrapper around SimpleModalSheet for scanner result modals.
 */

export interface ResultSheetProps {
  children: React.ReactNode;
  heightPercentage?: number;
}

export const ResultSheet = forwardRef<SimpleModalSheetRef, ResultSheetProps>(
  ({ children, heightPercentage }, ref) => {
    return (
      <SimpleModalSheet ref={ref} heightPercentage={heightPercentage}>
        {children}
      </SimpleModalSheet>
    );
  }
);

ResultSheet.displayName = 'ResultSheet';
