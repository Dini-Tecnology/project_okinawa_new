import React, { useEffect, useMemo, useState } from 'react';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { authService } from '../../services/auth';
import { resetPasswordSchema } from '../../validation/schemas';
import logger from '../../utils/logger';

type NavigationLike = {
  reset?: (state: { index: number; routes: Array<{ name: string }> }) => void;
};

interface ResetPasswordScreenProps {
  navigation?: NavigationLike;
  route?: {
    params?: {
      url?: string;
    };
  };
  onComplete?: () => void;
}

function leaveReset(navigation?: NavigationLike, onComplete?: () => void) {
  if (onComplete) {
    onComplete();
    return;
  }

  if (navigation?.reset) {
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    return;
  }

  router.replace('/');
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function ResetPasswordScreen({ navigation, route, onComplete }: ResetPasswordScreenProps) {
  const localParams = useLocalSearchParams<{ url?: string | string[] }>();
  const resolvedRoute = useMemo(
    () =>
      route ?? {
        params: {
          url: firstParam(localParams.url),
        },
      },
    [localParams.url, route]
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('Validando link de recuperacao...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function prepareRecoverySession() {
      try {
        const url = resolvedRoute?.params?.url ?? (await Linking.getInitialURL());
        if (url) {
          await authService.recoverSessionFromUrl(url);
        } else if (!(await authService.isAuthenticated())) {
          throw new Error('Link de recuperacao ausente ou expirado.');
        }

        if (!active) return;
        setReady(true);
        setMessage('Digite sua nova senha.');
      } catch (prepareError) {
        if (!active) return;
        logger.warn('[Auth] Password recovery session failed:', prepareError);
        setError(prepareError instanceof Error ? prepareError.message : 'Nao foi possivel validar este link.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    prepareRecoverySession();

    return () => {
      active = false;
    };
  }, [resolvedRoute]);

  const handleSubmit = async () => {
    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Confira a nova senha.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await authService.updatePassword(password);
      await authService.logout();
      setMessage('Senha atualizada. Entre novamente com a nova senha.');
      setTimeout(() => leaveReset(navigation, onComplete), 900);
    } catch (saveError) {
      logger.warn('[Auth] Password update failed:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Nao foi possivel atualizar sua senha.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Redefinir senha</Text>
      <Text style={styles.message}>{error ?? message}</Text>

      {loading && <ActivityIndicator style={styles.loader} size="large" color="#FF6B35" />}

      {!loading && ready && (
        <View style={styles.form}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Nova senha"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            textContentType="newPassword"
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirmar nova senha"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            textContentType="newPassword"
          />
          <Pressable style={[styles.button, saving && styles.buttonDisabled]} onPress={handleSubmit} disabled={saving}>
            <Text style={styles.buttonText}>{saving ? 'Salvando...' : 'Atualizar senha'}</Text>
          </Pressable>
        </View>
      )}

      {!loading && !ready && (
        <Pressable style={styles.secondaryButton} onPress={() => leaveReset(navigation, onComplete)}>
          <Text style={styles.secondaryButtonText}>Voltar para login</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  title: {
    color: '#1A1A1A',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    marginTop: 10,
    color: '#4B5563',
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
  loader: {
    marginTop: 28,
  },
  form: {
    marginTop: 26,
    gap: 14,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    color: '#111827',
    fontSize: 16,
    paddingHorizontal: 14,
  },
  button: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FF6B35',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 24,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ResetPasswordScreen;
