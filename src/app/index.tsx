import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSeries } from '../database/serieRepository';
import type { Serie, SerieFilter } from '../types/serie';

const filters: { value: SerieFilter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'assistindo', label: 'Assistindo' },
  { value: 'concluidas', label: 'Concluídas' },
];

function SeriesCard({ serie, onPress }: { serie: Serie; onPress: () => void }) {
  const isComplete = serie.concluida === 1;
  const rating =
    serie.nota === null
      ? 'Sem nota'
      : `${'★'.repeat(serie.nota)}${'☆'.repeat(5 - serie.nota)}  ${serie.nota}/5`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${serie.titulo}`}
      className={`rounded-2xl border border-nord-polar3 bg-nord-polar1 p-4 ${
        isComplete ? 'border-l-4 border-l-nord-aurora14' : 'border-l-4 border-l-nord-frost8'
      }`}
      onPress={onPress}
    >
      <View className="mb-2 flex-row items-start justify-between gap-3">
        <Text className="flex-1 text-lg font-semibold text-nord-snow6" numberOfLines={2}>
          {serie.titulo}
        </Text>
        <Text
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            isComplete ? 'bg-nord-aurora14 text-nord-polar0' : 'bg-nord-polar3 text-nord-snow6'
          }`}
        >
          {isComplete ? '✓ Concluída' : 'Assistindo'}
        </Text>
      </View>
      <Text className="text-sm text-nord-snow6">
        {serie.plataforma} · {serie.temporadas} {serie.temporadas === 1 ? 'temporada' : 'temporadas'}
      </Text>
      <Text className="mt-3 text-sm font-medium text-nord-frost8">{rating}</Text>
    </Pressable>
  );
}

function EmptyList({ filtro }: { filtro: SerieFilter }) {
  const isAll = filtro === 'todas';

  return (
    <View className="items-center rounded-2xl border border-nord-polar3 bg-nord-polar1 px-6 py-8">
      <Text className="mb-2 text-center text-lg font-semibold text-nord-snow6">
        {isAll ? 'Seu catálogo está vazio' : 'Nenhuma série neste filtro'}
      </Text>
      <Text className="text-center text-sm leading-5 text-nord-snow6">
        {isAll
          ? 'Adicione sua primeira série para começar a acompanhar sua programação.'
          : 'Quando você tiver séries nesta categoria, elas vão aparecer aqui.'}
      </Text>
    </View>
  );
}

export default function Index() {
  const router = useRouter();
  const [filtro, setFiltro] = useState<SerieFilter>('todas');
  const [series, setSeries] = useState<Serie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadGeneration = useRef(0);

  const loadSeries = useCallback(async () => {
    const generation = loadGeneration.current + 1;
    loadGeneration.current = generation;
    setIsLoading(true);
    setError(null);

    try {
      const results = await getSeries(filtro);
      if (loadGeneration.current === generation) {
        setSeries(results);
      }
    } catch {
      if (loadGeneration.current === generation) {
        setSeries([]);
        setError('Não foi possível carregar suas séries. Tente novamente.');
      }
    } finally {
      if (loadGeneration.current === generation) {
        setIsLoading(false);
      }
    }
  }, [filtro]);

  useFocusEffect(
    useCallback(() => {
      void loadSeries();
      return () => {
        loadGeneration.current += 1;
      };
    }, [loadSeries])
  );

  function renderEmptyState() {
    if (isLoading) {
      return (
        <View className="items-center py-10">
          <ActivityIndicator color="#88c0d0" size="large" />
          <Text className="mt-4 text-sm text-nord-snow6">Carregando séries...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="items-center rounded-2xl border border-nord-aurora11 bg-nord-polar1 px-6 py-8">
          <Text className="mb-4 text-center text-sm text-nord-snow6">{error}</Text>
          <Pressable
            accessibilityRole="button"
            className="rounded-full bg-nord-frost8 px-5 py-3"
            onPress={() => void loadSeries()}
          >
            <Text className="font-semibold text-nord-polar0">Tentar novamente</Text>
          </Pressable>
        </View>
      );
    }

    return <EmptyList filtro={filtro} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-nord-polar0">
      <StatusBar style="light" />
      <FlatList
        className="flex-1"
        contentContainerClassName="px-6 pb-5"
        data={series}
        keyExtractor={(item) => String(item.id)}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={
          <>
            <View className="pb-5 pt-7">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-nord-frost8">
                MINHAS SÉRIES
              </Text>
              <Text className="mt-2 text-3xl font-bold text-nord-snow6">Sua programação</Text>
            </View>
            <View className="mb-5 flex-row gap-2">
              {filters.map((option) => {
                const isSelected = filtro === option.value;

                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    className={`flex-1 items-center justify-center rounded-full px-2 py-3 ${
                      isSelected ? 'bg-nord-frost8' : 'bg-nord-polar1'
                    }`}
                    onPress={() => setFiltro(option.value)}
                  >
                    <Text
                      className={`text-center text-xs font-semibold ${
                        isSelected ? 'text-nord-polar0' : 'text-nord-snow6'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <SeriesCard
            serie={item}
            onPress={() => router.push({ pathname: '/detalhe', params: { id: String(item.id) } })}
          />
        )}
      />
      <View className="border-t border-nord-polar3 px-6 py-4">
        <Pressable
          accessibilityRole="button"
          className="items-center rounded-full bg-nord-frost8 px-6 py-4"
          onPress={() => router.push('/form')}
        >
          <Text className="text-base font-bold text-nord-polar0">+ Nova série</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
