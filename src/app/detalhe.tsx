import { useCallback, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  deleteSerie,
  getSerieById,
  toggleSerieConcluida,
} from '../database/serieRepository';
import type { Serie } from '../types/serie';

function formatCreatedAt(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return date.toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' });
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="flex-1 rounded-xl border border-nord-polar3 bg-nord-polar0 p-4">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-nord-frost8">
        {label}
      </Text>
      <Text className="text-base font-medium text-nord-snow6">{children}</Text>
    </View>
  );
}

export default function DetailScreen() {
  const { id: routeId } = useLocalSearchParams<{ id?: string | string[] }>();
  const idValue = typeof routeId === 'string' ? routeId : '';
  const serieId = /^\d+$/.test(idValue) ? Number(idValue) : Number.NaN;
  const hasValidId = Number.isSafeInteger(serieId) && serieId > 0;
  const router = useRouter();
  const [serie, setSerie] = useState<Serie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setSerie(null);
      setActionError('');

      if (!hasValidId) {
        setLoadError('O ID informado não é válido.');
        setIsLoading(false);
        return () => {
          active = false;
        };
      }

      setIsLoading(true);
      setLoadError('');

      getSerieById(serieId)
        .then((result) => {
          if (!active) {
            return;
          }

          if (result === null) {
            setLoadError('Essa série não existe mais ou não está disponível.');
            return;
          }

          setSerie(result);
        })
        .catch(() => {
          if (active) {
            setLoadError('Não foi possível carregar essa série. Tente novamente.');
          }
        })
        .finally(() => {
          if (active) {
            setIsLoading(false);
          }
        });

      return () => {
        active = false;
      };
    }, [hasValidId, serieId])
  );

  async function changeCompletion() {
    if (!serie || isChanging) {
      return;
    }

    setIsChanging(true);
    setActionError('');

    try {
      await toggleSerieConcluida(serie.id);
      setSerie((current) =>
        current
          ? { ...current, concluida: current.concluida === 1 ? 0 : 1 }
          : current
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'Série não encontrada.') {
        setSerie(null);
        setLoadError('Essa série não existe mais ou não está disponível.');
      } else {
        setActionError('Não foi possível atualizar o status. Tente novamente.');
      }
    } finally {
      setIsChanging(false);
    }
  }

  async function removeSerie() {
    if (!serie || isChanging) {
      return;
    }

    setIsChanging(true);
    setActionError('');

    try {
      await deleteSerie(serie.id);
      router.replace('/');
    } catch (error) {
      if (error instanceof Error && error.message === 'Série não encontrada.') {
        router.replace('/');
      } else {
        setActionError('Não foi possível excluir a série. Tente novamente.');
      }
    } finally {
      setIsChanging(false);
    }
  }

  function confirmDelete() {
    if (!serie || isChanging) {
      return;
    }

    Alert.alert(
      'Excluir série?',
      `A série “${serie.titulo}” será removida do seu catálogo. Essa ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => void removeSerie() },
      ]
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-nord-polar0 px-8">
        <StatusBar style="light" />
        <ActivityIndicator color="#88c0d0" size="large" />
        <Text className="mt-4 text-base text-nord-snow6">Carregando série...</Text>
      </SafeAreaView>
    );
  }

  if (loadError || !serie) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-nord-polar0 px-8">
        <StatusBar style="light" />
        <Text className="mb-3 text-center text-xl font-semibold text-nord-snow6">
          Não foi possível abrir esta série
        </Text>
        <Text className="mb-7 text-center text-base leading-6 text-nord-snow6">
          {loadError || 'Essa série não está disponível.'}
        </Text>
        <Pressable
          accessibilityRole="button"
          className="rounded-full bg-nord-frost8 px-6 py-3"
          onPress={() => router.replace('/')}
        >
          <Text className="font-semibold text-nord-polar0">Voltar à lista</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isComplete = serie.concluida === 1;
  const rating =
    serie.nota === null
      ? 'Sem nota'
      : `${'★'.repeat(serie.nota)}${'☆'.repeat(5 - serie.nota)}  ${serie.nota}/5`;

  return (
    <SafeAreaView className="flex-1 bg-nord-polar0">
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          accessibilityRole="button"
          className="mb-6 mt-4 self-start py-2"
          onPress={() => router.back()}
        >
          <Text className="font-semibold text-nord-frost8">‹ Voltar à lista</Text>
        </Pressable>

        <View className="mb-7">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-nord-frost8">
            DETALHE DA SÉRIE
          </Text>
          <Text className="mt-2 text-3xl font-bold text-nord-snow6">{serie.titulo}</Text>
          <View className="mt-4 self-start rounded-full bg-nord-polar1 px-3 py-2">
            <Text
              className={`text-sm font-semibold ${
                isComplete ? 'text-nord-aurora14' : 'text-nord-frost8'
              }`}
            >
              {isComplete ? '✓ Concluída' : '○ Assistindo'}
            </Text>
          </View>
        </View>

        <View className="mb-7 rounded-2xl border border-nord-polar3 bg-nord-polar1 p-4">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-nord-frost8">
            Plataforma
          </Text>
          <Text className="text-lg font-semibold text-nord-snow6">{serie.plataforma}</Text>
        </View>

        <View className="mb-3 flex-row gap-3">
          <DetailField label="Temporadas assistidas">
            {`${serie.temporadas} ${serie.temporadas === 1 ? 'temporada' : 'temporadas'}`}
          </DetailField>
          <DetailField label="Nota">
            <Text className={serie.nota === null ? 'text-nord-snow6' : 'text-nord-frost8'}>
              {rating}
            </Text>
          </DetailField>
        </View>

        <View className="mb-7 flex-row gap-3">
          <DetailField label="ID da série">{String(serie.id)}</DetailField>
          <DetailField label="Adicionada em">{formatCreatedAt(serie.createdAt)}</DetailField>
        </View>

        {actionError ? (
          <Text className="mb-4 text-sm leading-5 text-nord-aurora11">{actionError}</Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isChanging }}
          className={`mb-3 items-center rounded-full px-6 py-4 ${
            isComplete ? 'bg-nord-aurora14' : 'bg-nord-frost8'
          } ${isChanging ? 'opacity-60' : ''}`}
          disabled={isChanging}
          onPress={() => void changeCompletion()}
        >
          <Text className="text-base font-bold text-nord-polar0">
            {isChanging
              ? 'Atualizando...'
              : isComplete
                ? 'Voltar para assistindo'
                : 'Marcar como concluída'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isChanging }}
          className={`mb-3 items-center rounded-full border border-nord-polar3 bg-nord-polar1 px-6 py-4 ${
            isChanging ? 'opacity-60' : ''
          }`}
          disabled={isChanging}
          onPress={() => router.push({ pathname: '/form', params: { id: String(serie.id) } })}
        >
          <Text className="text-base font-semibold text-nord-snow6">Editar série</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isChanging }}
          className={`items-center rounded-full border border-nord-aurora11 px-6 py-4 ${
            isChanging ? 'opacity-60' : ''
          }`}
          disabled={isChanging}
          onPress={confirmDelete}
        >
          <Text className="text-base font-semibold text-nord-aurora11">Excluir série</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
