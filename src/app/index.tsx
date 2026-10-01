import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSeries, getSeriesSummary } from '../database/serieRepository';
import type { Serie, SerieFilter, SerieSortOrder } from '../types/serie';

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

function EmptyList({
  filtro,
  busca,
  onClearSearch,
}: {
  filtro: SerieFilter;
  busca: string;
  onClearSearch: () => void;
}) {
  const hasSearch = busca.trim().length > 0;
  const isAll = filtro === 'todas';

  return (
    <View className="items-center rounded-2xl border border-nord-polar3 bg-nord-polar1 px-6 py-8">
      <Text className="mb-2 text-center text-lg font-semibold text-nord-snow6">
        {hasSearch
          ? 'Nenhum título encontrado'
          : isAll
            ? 'Seu catálogo está vazio'
            : 'Nenhuma série neste filtro'}
      </Text>
      <Text className="mb-5 text-center text-sm leading-5 text-nord-snow6">
        {hasSearch
          ? 'Tente outro título ou limpe a busca para ver o catálogo completo.'
          : isAll
            ? 'Adicione sua primeira série para começar a acompanhar o que assiste.'
            : 'Quando você tiver séries nesta categoria, elas vão aparecer aqui.'}
      </Text>
      {hasSearch ? (
        <Pressable
          accessibilityRole="button"
          className="rounded-full bg-nord-polar3 px-5 py-3"
          onPress={onClearSearch}
        >
          <Text className="font-semibold text-nord-snow6">Limpar busca</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function Index() {
  const router = useRouter();
  const [filtro, setFiltro] = useState<SerieFilter>('todas');
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<SerieSortOrder>('recentes');
  const [series, setSeries] = useState<Serie[]>([]);
  const [summary, setSummary] = useState<{ total: number; concluidas: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState(false);
  const loadGeneration = useRef(0);
  const summaryGeneration = useRef(0);

  const loadSeries = useCallback(async () => {
    const generation = loadGeneration.current + 1;
    loadGeneration.current = generation;
    setIsLoading(true);
    setError(null);

    try {
      const results = await getSeries(filtro, busca, ordenacao);
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
  }, [busca, filtro, ordenacao]);

  const loadSummary = useCallback(async () => {
    const generation = summaryGeneration.current + 1;
    summaryGeneration.current = generation;
    setIsSummaryLoading(true);
    setSummaryError(false);

    try {
      const result = await getSeriesSummary();
      if (summaryGeneration.current === generation) {
        setSummary(result);
      }
    } catch {
      if (summaryGeneration.current === generation) {
        setSummaryError(true);
      }
    } finally {
      if (summaryGeneration.current === generation) {
        setIsSummaryLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSeries();
      return () => {
        loadGeneration.current += 1;
      };
    }, [loadSeries])
  );

  useFocusEffect(
    useCallback(() => {
      void loadSummary();
      return () => {
        summaryGeneration.current += 1;
      };
    }, [loadSummary])
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

    return <EmptyList filtro={filtro} busca={busca} onClearSearch={() => setBusca('')} />;
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
              <Text className="mt-2 text-3xl font-bold text-nord-snow6">Seu acervo</Text>
            </View>

            <View className="mb-6 flex-row rounded-2xl border border-nord-polar3 bg-nord-polar1 px-5 py-4">
              <View className="flex-1 border-r border-nord-polar3 pr-4">
                <Text className="text-3xl font-bold text-nord-frost8">
                  {summary ? String(summary.total).padStart(2, '0') : '—'}
                </Text>
                <Text className="mt-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-nord-snow6">
                  No catálogo
                </Text>
              </View>
              <View className="flex-1 pl-5">
                <Text className="text-3xl font-bold text-nord-aurora14">
                  {summary ? String(summary.concluidas).padStart(2, '0') : '—'}
                </Text>
                <Text className="mt-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-nord-snow6">
                  Concluídas
                </Text>
              </View>
              {isSummaryLoading ? (
                <ActivityIndicator
                  accessibilityLabel="Atualizando o resumo do catálogo"
                  className="absolute right-4 top-4"
                  color="#88c0d0"
                  size="small"
                />
              ) : null}
              {summaryError ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Tentar carregar o resumo novamente"
                  className="absolute right-3 top-3 rounded-full p-2"
                  onPress={() => void loadSummary()}
                >
                  <Text className="text-xs font-semibold text-nord-aurora11">Tentar</Text>
                </Pressable>
              ) : null}
            </View>

            <View className="mb-4 flex-row items-center rounded-xl border border-nord-polar3 bg-nord-polar1 px-4">
              <Text accessibilityElementsHidden className="mr-3 text-xl text-nord-frost8">
                ⌕
              </Text>
              <TextInput
                accessibilityLabel="Buscar série pelo título"
                autoCapitalize="none"
                autoCorrect={false}
                className="min-h-12 flex-1 py-3 text-base text-nord-snow6"
                keyboardAppearance="dark"
                onChangeText={setBusca}
                placeholder="Buscar pelo título"
                placeholderTextColor="#d8dee9"
                returnKeyType="search"
                selectionColor="#88c0d0"
                value={busca}
              />
              {busca.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Limpar busca"
                  className="min-h-10 min-w-10 items-center justify-center"
                  onPress={() => setBusca('')}
                >
                  <Text className="text-xl text-nord-snow6">×</Text>
                </Pressable>
              ) : null}
            </View>

            <View className="mb-4 flex-row gap-2">
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

            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xs font-semibold uppercase tracking-wide text-nord-snow6">
                {isLoading ? 'Buscando...' : `${series.length} ${series.length === 1 ? 'resultado' : 'resultados'}`}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ordenação: ${ordenacao === 'recentes' ? 'mais recentes' : 'maior nota'}. Toque para alternar.`}
                className="min-h-10 flex-row items-center rounded-full border border-nord-polar3 bg-nord-polar1 px-3"
                onPress={() =>
                  setOrdenacao((current) => (current === 'recentes' ? 'maior-nota' : 'recentes'))
                }
              >
                <Text className="mr-2 text-sm text-nord-frost8">
                  {ordenacao === 'recentes' ? '↕' : '★'}
                </Text>
                <Text className="text-xs font-semibold text-nord-snow6">
                  {ordenacao === 'recentes' ? 'Mais recentes' : 'Maior nota'}
                </Text>
              </Pressable>
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
          <Text className="text-base font-bold text-nord-polar0">+ Adicionar série</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
