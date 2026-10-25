import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface StepIndicatorProps {
  currentStep: number;  // 1-indexed
  totalSteps: number;
  labels?: string[];
  testID?: string;
}

/**
 * StepIndicator Component
 * 
 * Displays progress through multi-step flows (signup, forgot password).
 * 
 * **Visual Specifications:**
 * - Step circles: 32px diameter
 * - Active step: primary blue background, white text
 * - Completed step: success green background, white checkmark
 * - Upcoming step: 1px border only, text secondary color
 * - Connector lines: 1px height, border color, 8px length
 * - Optional labels below circles with 4px spacing
 * 
 * **Validates:** Requirements 1.2.5
 */
export function StepIndicator({
  currentStep,
  totalSteps,
  labels,
  testID,
}: StepIndicatorProps) {
  // Validate that labels match totalSteps if provided
  if (labels && labels.length !== totalSteps) {
    console.warn(
      `StepIndicator: labels length (${labels.length}) does not match totalSteps (${totalSteps})`
    );
  }

  // Generate array of step numbers
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  const renderStep = (step: number, index: number) => {
    const isActive = step === currentStep;
    const isCompleted = step < currentStep;

    // Determine circle style
    const getCircleStyle = () => {
      if (isActive) {
        return styles.circleActive;
      }
      if (isCompleted) {
        return styles.circleCompleted;
      }
      return styles.circleUpcoming;
    };

    // Determine text/icon color
    const getContentColor = () => {
      if (isActive || isCompleted) {
        return colors.background; // white
      }
      return colors.textSecondary;
    };

    return (
      <View key={step} style={styles.stepContainer}>
        {/* Step circle */}
        <View style={[styles.circle, getCircleStyle()]}>
          {isCompleted ? (
            <Ionicons
              name="checkmark"
              size={18}
              color={getContentColor()}
              testID={testID ? `${testID}-step-${step}-check` : undefined}
            />
          ) : (
            <Text
              style={[styles.stepNumber, { color: getContentColor() }]}
              testID={testID ? `${testID}-step-${step}-number` : undefined}
            >
              {step}
            </Text>
          )}
        </View>

        {/* Optional label */}
        {labels && labels[index] && (
          <Text
            style={styles.label}
            testID={testID ? `${testID}-step-${step}-label` : undefined}
          >
            {labels[index]}
          </Text>
        )}
      </View>
    );
  };

  const renderConnector = (index: number) => {
    // Don't render connector after the last step
    if (index >= totalSteps - 1) {
      return null;
    }

    return (
      <View
        key={`connector-${index}`}
        style={styles.connector}
        testID={testID ? `${testID}-connector-${index}` : undefined}
      />
    );
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.stepsRow}>
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            {renderStep(step, index)}
            {renderConnector(index)}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const CIRCLE_SIZE = 32;
const CONNECTOR_LENGTH = 8;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContainer: {
    alignItems: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    backgroundColor: colors.primary,
  },
  circleCompleted: {
    backgroundColor: colors.success,
  },
  circleUpcoming: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepNumber: {
    ...typography.labelMedium,
    fontWeight: '700',
  },
  connector: {
    width: CONNECTOR_LENGTH,
    height: 1,
    backgroundColor: colors.border,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs, // 4px
    textAlign: 'center',
  },
});
