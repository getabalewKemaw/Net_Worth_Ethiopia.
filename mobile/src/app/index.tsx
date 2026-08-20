import { Pressable, View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { authClient } from '@/lib/auth-client';
import { useBusinessStore } from '@/store/business-store';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const colors = useTheme();

  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const activeBranch = useBusinessStore((state) => state.activeBranch);
  const isPending = useBusinessStore((state) => state.isPending);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-1 p-6 justify-center items-center gap-6">
        <ThemedText type="title" className="mb-2">Dashboard</ThemedText>

        {isPending ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <View className="w-full max-w-[400px] gap-4">
            {/* Active Business */}
            <View className="p-5 rounded-[14px] gap-1.5 items-start" style={{ backgroundColor: colors.backgroundElement }}>
              <ThemedText className="text-[12px] text-[#60646C] font-semibold uppercase">Active Business</ThemedText>
              <ThemedText className="text-[18px] font-bold" style={{ color: colors.text }}>
                {activeBusiness?.name || "No Business"}
              </ThemedText>
              {activeBusiness?.type && (
                <View className="px-2.5 py-1 rounded-[20px] mt-1" style={{ backgroundColor: colors.primary }}>
                  <ThemedText className="text-white text-[12px] font-semibold">{activeBusiness.type}</ThemedText>
                </View>
              )}
            </View>

            {/* Active Branch */}
            <View className="p-5 rounded-[14px] gap-1.5 items-start" style={{ backgroundColor: colors.backgroundElement }}>
              <ThemedText className="text-[12px] text-[#60646C] font-semibold uppercase">Operating Branch</ThemedText>
              <ThemedText className="text-[18px] font-bold" style={{ color: colors.text }}>
                {activeBranch?.name || "No Active Branch"}
              </ThemedText>
              {activeBranch && (
                <ThemedText className="text-[12px] text-[#60646C] font-mono">
                  Code: {activeBranch.branchCode || "N/A"}
                </ThemedText>
              )}
            </View>

            {/* Actions */}
            <Pressable
              className="py-3.5 rounded-xl items-center justify-center mt-2 active:opacity-80"
              style={{ backgroundColor: colors.primary }}
              onPress={() => router.push('/(business)/branches')}
            >
              <ThemedText className="text-white font-semibold text-[16px]">Switch Business / Branches</ThemedText>
            </Pressable>

            <Pressable
              className="py-3.5 rounded-xl items-center justify-center border-[1.5px] active:opacity-80"
              style={{ borderColor: colors.primary }}
              onPress={() => router.push('/(business)/business-profile')}
            >
              <ThemedText className="font-semibold text-[16px]" style={{ color: colors.primary }}>Business Profile Settings</ThemedText>
            </Pressable>
          </View>
        )}

        <Pressable className="mt-3 px-5 py-3 rounded-[14px] bg-[#111827] active:opacity-80" onPress={handleLogout}>
          <ThemedText className="text-white font-semibold">Log out</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
