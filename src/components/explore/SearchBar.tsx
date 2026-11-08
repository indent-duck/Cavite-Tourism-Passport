import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

/**
 * SearchBar Component
 * 
 * A search input with search icon and conditional clear button.
 * 
 * **Visual Specifications:**
 * - Height: 40px
 * - Background: surface color (#F4F6FA)
 * - Border: 1px border color
 * - Search icon on the left (20px)
 * - Clear button (X) on the right when value is present
 * - 12px border radius, 12px horizontal padding
 * 
 * **Behavior:**
 * - Shows clear button only when value has text
 * - Keyboard dismisses on scroll (handled by parent ScrollView)
 * - Card taps work while keyboard is open
 * 
 * **Validates:** Requirements 2.2.1, 5.1
 */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search sites...',
  onClear,
}: SearchBarProps) {
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View style={styles.container}>
      <Ionicons 
        name="search" 
        size={20} 
        color={colors.textSecondary} 
        style={styles.searchIcon}
      />
      
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      
      {value.length > 0 && (
        <Pressable
          onPress={handleClear}
          style={({ pressed }) => [
            styles.clearButton,
            pressed && styles.clearButtonPressed,
          ]}
          hitSlop={8}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
        >
          <Ionicons 
            name="close-circle" 
            size={20} 
            color={colors.textSecondary} 
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: colors.surface,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
    padding: 0,
    height: '100%',
  },
  clearButton: {
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonPressed: {
    opacity: 0.5,
  },
});
