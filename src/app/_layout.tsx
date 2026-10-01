import '../../global.css';

import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { runMigrations } from '../database/database';

type DatabaseStatus = 'loading' | 'ready' | 'error';

function RootLayoutContent() {
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>('loading');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    runMigrations()
      .then(() => {
        if (active) {
          setDatabaseStatus('ready');
        }
      })
      .catch(() => {
        if (active) {
          setDatabaseStatus('error');
        }
      });

    return () => {
      active = false;
    };
  }, [retryCount]);

  if (databaseStatus !== 'ready') {
    const hasError = databaseStatus === 'error';

    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-nord-polar0 px-8">
        <StatusBar style="light" />
        {hasError ? (
          <>
            <Text className="mb-2 text-center text-xl font-semibold text-nord-snow6">
              Não foi possível abrir o catálogo
            </Text>
            <Text className="mb-6 text-center text-base text-nord-snow6">
              Não foi possível preparar o banco local. Tente novamente.
            </Text>
            <Pressable
              accessibilityRole="button"
              className="rounded-full bg-nord-frost8 px-6 py-3"
              onPress={() => {
                setDatabaseStatus('loading');
                setRetryCount((count) => count + 1);
              }}
            >
              <Text className="font-semibold text-nord-polar0">Tentar novamente</Text>
            </Pressable>
          </>
        ) : (
          <>
            <ActivityIndicator color="#88c0d0" size="large" />
            <Text className="mt-4 text-base text-nord-snow6">Preparando seu catálogo...</Text>
          </>
        )}
      </SafeAreaView>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#2e3440' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Minhas séries' }} />
      <Stack.Screen name="form" options={{ title: 'Cadastro de série' }} />
      <Stack.Screen name="detalhe" options={{ title: 'Detalhe da série' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootLayoutContent />
    </SafeAreaProvider>
  );
}
