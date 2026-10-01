import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createSerie, getSerieById, updateSerie } from '../database/serieRepository';
import type { Serie, UpdateSerieInput } from '../types/serie';

type FormErrors = {
  titulo?: string;
  plataforma?: string;
  temporadas?: string;
};

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  keyboardType?: TextInputProps['keyboardType'];
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  autoCapitalize,
  keyboardType,
}: FormFieldProps) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-semibold text-nord-snow6">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={autoCapitalize}
        className={`rounded-xl border bg-nord-polar1 px-4 py-3 text-base text-nord-snow6 ${
          error ? 'border-nord-aurora11' : 'border-nord-polar3'
        }`}
        keyboardAppearance="dark"
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#4c566a"
        selectionColor="#88c0d0"
        value={value}
      />
      {error ? <Text className="mt-2 text-sm text-nord-aurora11">{error}</Text> : null}
    </View>
  );
}

export default function FormScreen() {
  const { id: routeId } = useLocalSearchParams<{ id?: string | string[] }>();
  const routeKey = Array.isArray(routeId) ? routeId.join(',') : routeId ?? 'create';

  return <FormContent key={routeKey} routeId={routeId} />;
}

function FormContent({ routeId }: { routeId: string | string[] | undefined }) {
  const router = useRouter();
  const idValue = Array.isArray(routeId) ? routeId[0] : routeId;
  const hasId = routeId !== undefined;
  const serieId = idValue === undefined ? Number.NaN : Number(idValue);
  const hasValidId = Number.isSafeInteger(serieId) && serieId > 0;

  const [titulo, setTitulo] = useState('');
  const [plataforma, setPlataforma] = useState('');
  const [temporadas, setTemporadas] = useState('');
  const [nota, setNota] = useState<number | null>(null);
  const [original, setOriginal] = useState<Serie | null>(null);
  const [loadError, setLoadError] = useState('');
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = hasId;

  useEffect(() => {
    let active = true;

    if (!hasId || !hasValidId) {
      return;
    }

    getSerieById(serieId)
      .then((serie) => {
        if (!active) {
          return;
        }

        if (serie === null) {
          setLoadError('Essa série não existe mais ou não está disponível.');
          return;
        }

        setOriginal(serie);
        setTitulo(serie.titulo);
        setPlataforma(serie.plataforma);
        setTemporadas(String(serie.temporadas));
        setNota(serie.nota);
        setLoadError('');
      })
      .catch(() => {
        if (active) {
          setLoadError('Não foi possível carregar essa série. Tente novamente mais tarde.');
        }
      });

    return () => {
      active = false;
    };
  }, [hasId, hasValidId, serieId]);

  const loadErrorMessage = hasId && !hasValidId ? 'O ID informado não é válido.' : loadError;
  const isLoading = hasId && hasValidId && original === null && loadError.length === 0;

  async function saveSerie() {
    if (isSaving) {
      return;
    }

    const tituloFinal = titulo.trim();
    const plataformaFinal = plataforma.trim();
    const temporadasText = temporadas.trim();
    const temporadasFinal = Number(temporadasText);
    const errors: FormErrors = {};

    if (tituloFinal.length === 0) {
      errors.titulo = 'Informe o título da série.';
    }

    if (plataformaFinal.length === 0) {
      errors.plataforma = 'Informe a plataforma.';
    }

    if (temporadasText.length === 0) {
      errors.temporadas = 'Informe quantas temporadas você assistiu.';
    } else if (!Number.isSafeInteger(temporadasFinal) || temporadasFinal < 0) {
      errors.temporadas = 'Use um número inteiro igual ou maior que zero.';
    }

    setValidationErrors(errors);
    setSaveError('');

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSaving(true);

    try {
      if (isEditing) {
        if (!original || !hasValidId) {
          return;
        }

        const changes: UpdateSerieInput = {};

        if (tituloFinal !== original.titulo) {
          changes.titulo = tituloFinal;
        }
        if (plataformaFinal !== original.plataforma) {
          changes.plataforma = plataformaFinal;
        }
        if (temporadasFinal !== original.temporadas) {
          changes.temporadas = temporadasFinal;
        }
        if (nota !== original.nota) {
          changes.nota = nota;
        }

        if (Object.keys(changes).length === 0) {
          Alert.alert('Nenhuma alteração', 'Você não modificou os dados desta série.', [
            { text: 'Continuar editando', style: 'cancel' },
            { text: 'Voltar à lista', onPress: () => router.replace('/') },
          ]);
          return;
        }

        await updateSerie(serieId, changes);
      } else {
        await createSerie({
          titulo: tituloFinal,
          plataforma: plataformaFinal,
          temporadas: temporadasFinal,
          nota,
        });
      }

      router.back();
    } catch (error) {
      if (error instanceof Error && error.message === 'Série não encontrada.') {
        setSaveError('Essa série não está mais disponível. Volte à lista e tente novamente.');
      } else {
        setSaveError('Não foi possível salvar a série. Confira os dados e tente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-nord-polar0 px-8">
        <StatusBar style="light" />
        <Text className="text-base text-nord-snow6">Carregando série...</Text>
      </SafeAreaView>
    );
  }

  if (loadErrorMessage) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-nord-polar0 px-8">
        <StatusBar style="light" />
        <Text className="mb-3 text-center text-xl font-semibold text-nord-snow6">
          Não foi possível abrir o formulário
        </Text>
        <Text className="mb-7 text-center text-base leading-6 text-nord-snow6">
          {loadErrorMessage}
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

  return (
    <SafeAreaView className="flex-1 bg-nord-polar0">
      <StatusBar style="light" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
            <Text className="font-semibold text-nord-frost8">‹ Voltar</Text>
          </Pressable>

          <View className="mb-7">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-nord-frost8">
              {isEditing ? 'EDITAR CATÁLOGO' : 'NOVO NO CATÁLOGO'}
            </Text>
            <Text className="mt-2 text-3xl font-bold text-nord-snow6">
              {isEditing ? 'Editar série' : 'Nova série'}
            </Text>
            <Text className="mt-2 text-base leading-6 text-nord-snow6">
              {isEditing
                ? 'Atualize as informações que você quiser.'
                : 'Registre o que você está acompanhando.'}
            </Text>
          </View>

          <FormField
            autoCapitalize="words"
            error={validationErrors.titulo}
            label="Título"
            onChangeText={(value) => {
              setTitulo(value);
              setValidationErrors((current) => ({ ...current, titulo: undefined }));
            }}
            placeholder="Ex.: Ruptura"
            value={titulo}
          />
          <FormField
            autoCapitalize="words"
            error={validationErrors.plataforma}
            label="Plataforma"
            onChangeText={(value) => {
              setPlataforma(value);
              setValidationErrors((current) => ({ ...current, plataforma: undefined }));
            }}
            placeholder="Ex.: Apple TV+"
            value={plataforma}
          />
          <FormField
            error={validationErrors.temporadas}
            keyboardType="numeric"
            label="Temporadas assistidas"
            onChangeText={(value) => {
              setTemporadas(value);
              setValidationErrors((current) => ({ ...current, temporadas: undefined }));
            }}
            placeholder="0 ou mais"
            value={temporadas}
          />

          <View className="mb-7">
            <Text className="mb-2 text-sm font-semibold text-nord-snow6">Nota</Text>
            <View accessibilityLabel="Nota da série" className="flex-row items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => {
                const isSelected = nota !== null && value <= nota;

                return (
                  <Pressable
                    key={value}
                    accessibilityLabel={`Nota ${value} de 5`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: nota === value }}
                    className="min-h-12 min-w-10 items-center justify-center rounded-lg"
                    onPress={() => setNota(nota === value ? null : value)}
                  >
                    <Text
                      className={`text-3xl ${isSelected ? 'text-nord-frost8' : 'text-nord-polar3'}`}
                    >
                      {isSelected ? '★' : '☆'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="mt-2 text-sm text-nord-snow6">
              {nota === null
                ? 'Sem nota. Toque em uma estrela para avaliar.'
                : `Nota ${nota} de 5. Toque na estrela selecionada para remover.`}
            </Text>
          </View>

          {saveError ? (
            <Text className="mb-4 text-sm leading-5 text-nord-aurora11">{saveError}</Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isSaving }}
            className={`items-center rounded-full bg-nord-frost8 px-6 py-4 ${
              isSaving ? 'opacity-60' : ''
            }`}
            disabled={isSaving}
            onPress={() => void saveSerie()}
          >
            <Text className="text-base font-bold text-nord-polar0">
              {isSaving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Adicionar à lista'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
