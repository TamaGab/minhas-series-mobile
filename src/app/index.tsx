import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-nord-polar0 px-6">
      <StatusBar style="light" />
      <Text className="text-2xl font-semibold text-nord-snow6">
        Configuração OK
      </Text>
    </View>
  );
}
