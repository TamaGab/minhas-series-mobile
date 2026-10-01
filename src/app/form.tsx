import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function FormPlaceholder() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-nord-polar0 px-8">
      <StatusBar style="light" />
      <Text className="mb-2 text-xs font-semibold uppercase tracking-[2px] text-nord-frost8">
        ETAPA 6
      </Text>
      <Text className="mb-3 text-center text-2xl font-bold text-nord-snow6">
        Cadastro de série
      </Text>
      <Text className="mb-7 text-center text-base leading-6 text-nord-snow6">
        O formulário para cadastrar e editar séries será feito na próxima etapa.
      </Text>
      <Pressable
        accessibilityRole="button"
        className="rounded-full bg-nord-frost8 px-6 py-3"
        onPress={() => router.back()}
      >
        <Text className="font-semibold text-nord-polar0">Voltar à lista</Text>
      </Pressable>
    </SafeAreaView>
  );
}
