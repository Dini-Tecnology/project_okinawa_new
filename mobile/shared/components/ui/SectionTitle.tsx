/**
 * SectionTitle - Uppercase section header label
 * Matches the demo pattern: text-sm font-semibold text-muted-foreground
 * uppercase tracking-wider, with optional right action link and left icon.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useColors } from '../../contexts/ThemeContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SectionAction {
  /** Label shown as a tappable text link */
  label: string;
  /** Press handler */
  onPress: () => void;
}

interface SectionTitleProps {
  /** The section heading text (rendered uppercase) */
  title: string;
  /** Optional action link on the right */
  action?: SectionAction;
  /** Optional icon node rendered before the title */
  icon?: React.ReactNode;
  /** Extra styles for the root container */
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  action,
  icon,
  style,
}) => {
  const colors = useColors();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftGroup}>
        {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
        <Text
          style={[
            styles.title,
            { color: colors.foregroundMuted },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      {action ? (
        <Pressable
          onPress={action.onPress}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={[styles.actionLabel, { color: colors.primary }]}>
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    marginRight: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default SectionTitle;
