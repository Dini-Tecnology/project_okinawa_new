import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { List, Switch, Divider, RadioButton, Dialog, Portal, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import ApiService from '@/shared/services/api';
import { authService } from '@/shared/services/auth';
import { useI18n, SupportedLanguage } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import logger from '@okinawa/shared/utils/logger';
import { ScreenContainer } from '@okinawa/shared/components/ScreenContainer';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const { t, language, changeLanguage, languageOptions } = useI18n();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [languageDialogVisible, setLanguageDialogVisible] = React.useState(false);

  const handleLogout = async () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            await authService.logout();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profile.deleteAccount'),
      t('profile.deleteAccountWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('common.confirm'),
              t('profile.deleteAccountWarning'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('common.confirm'),
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await ApiService.deleteAccount();
                      Alert.alert(
                        t('common.success'),
                        t('success.deleted')
                      );
                      await authService.logout();
                    } catch (error) {
                      logger.error('Failed to delete account', error);
                      Alert.alert(t('common.error'), t('errors.generic'));
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const updateLanguage = async (lang: SupportedLanguage) => {
    await changeLanguage(lang);
    setLanguageDialogVisible(false);
  };

  const getLanguageLabel = (lang: string) => {
    const option = languageOptions.find((l) => l.code === lang);
    return option ? `${option.flag} ${option.name}` : lang;
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    subheader: {
      color: colors.foregroundSecondary,
    },
    listItem: {
      backgroundColor: colors.card,
    },
    listTitle: {
      color: colors.foreground,
    },
    listDescription: {
      color: colors.foregroundSecondary,
    },
    dangerZone: {
      padding: 20,
      marginTop: 20,
      marginBottom: 40,
    },
    dangerZoneTitle: {
      color: colors.error,
      fontWeight: 'bold' as const,
      marginBottom: 15,
    },
    deleteButton: {
      borderColor: colors.error,
    },
  }), [colors]);

  return (
    <ScreenContainer>
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader style={styles.subheader}>{t('notifications.title')}</List.Subheader>
        <List.Item
          title={t('settings.pushNotifications')}
          description={t('settings.pushNotificationsDesc')}
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDescription}
          style={styles.listItem}
          right={() => (
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
          )}
        />
        <List.Item
          title={t('settings.alertSound')}
          description={t('settings.alertSoundDesc')}
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDescription}
          style={styles.listItem}
          right={() => <Switch value={soundEnabled} onValueChange={setSoundEnabled} />}
        />
      </List.Section>

      <Divider style={{ backgroundColor: colors.border }} />

      <List.Section>
        <List.Subheader style={styles.subheader}>{t('settings.appearance')}</List.Subheader>
        <List.Item
          title={t('settings.language')}
          description={getLanguageLabel(language)}
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDescription}
          style={styles.listItem}
          left={(props) => <List.Icon {...props} icon="translate" color={colors.foregroundSecondary} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" color={colors.foregroundSecondary} />}
          onPress={() => setLanguageDialogVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={`${t('settings.language')}: ${getLanguageLabel(language)}`}
        />
      </List.Section>

      <Divider style={{ backgroundColor: colors.border }} />

      <List.Section>
        <List.Subheader style={styles.subheader}>{t('settings.account')}</List.Subheader>
        <List.Item
          title={t('settings.disconnect')}
          description={t('settings.disconnectDesc')}
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDescription}
          style={styles.listItem}
          left={(props) => <List.Icon {...props} icon="logout" color={colors.foregroundSecondary} />}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel={t('settings.disconnect')}
        />
      </List.Section>

      <Divider style={{ backgroundColor: colors.border }} />

      <View style={styles.dangerZone}>
        <Text variant="titleMedium" style={styles.dangerZoneTitle}>
          {t('settings.dangerZone')}
        </Text>
        <Button
          mode="outlined"
          textColor={colors.error}
          style={[styles.deleteButton, { borderColor: colors.error }]}
          onPress={handleDeleteAccount}
          accessibilityRole="button"
          accessibilityLabel={t('profile.deleteAccount')}
        >
          {t('profile.deleteAccount')}
        </Button>
      </View>

      {/* Language Dialog */}
      <Portal>
        <Dialog
          visible={languageDialogVisible}
          onDismiss={() => setLanguageDialogVisible(false)}
          style={{ backgroundColor: colors.card }}
        >
          <Dialog.Title style={{ color: colors.foreground }}>{t('settings.selectLanguage')}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) =>
                updateLanguage(value as SupportedLanguage)
              }
              value={language}
            >
              {languageOptions.map((option) => (
                <RadioButton.Item
                  key={option.code}
                  label={`${option.flag} ${option.name}`}
                  value={option.code}
                  labelStyle={{ color: colors.foreground }}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setLanguageDialogVisible(false)}
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}
            >
              {t('common.cancel')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
    </ScreenContainer>
  );
}
