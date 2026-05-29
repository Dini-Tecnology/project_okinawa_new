import React, { ReactNode } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

interface V2ShellProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  headerRight?: ReactNode;
  children: ReactNode;
  scroll?: boolean;
  bottomPadding?: number;
}

export function V2Shell({
  title,
  subtitle,
  showBack = false,
  headerRight,
  children,
  scroll = true,
  bottomPadding = 100,
}: V2ShellProps) {
  const colors = useColors();
  const navigation = useNavigation();

  const header = (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {showBack && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              accessibilityLabel="Voltar"
            >
              <ChevronLeft size={22} color={colors.foregroundSecondary} />
            </TouchableOpacity>
          )}
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: colors.foregroundSecondary }]}>{subtitle}</Text>
            ) : null}
          </View>
        </View>
        {headerRight}
      </View>
    </View>
  );

  if (!scroll) {
    return (
      <ScreenContainer>
        {header}
        <View style={[styles.body, { paddingBottom: bottomPadding }]}>{children}</View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {header}
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 999,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});
