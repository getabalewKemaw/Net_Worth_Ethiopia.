import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

import { authClient } from '@/lib/auth-client';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export default function SignupSuccessScreen() {
  const theme = useTheme();
  
  useEffect(() => {
    const finalizeSignup = async () => {
      try {
        await authClient.updateUser({
          acceptedTerms: true,
        } as any);
        
        // Let the layout handle the final redirect once the session updates,
        // or forcefully redirect to dashboard here:
        router.replace('/');
      } catch (err) {
        console.error("Failed to finalize signup:", err);
      }
    };
    
    finalizeSignup();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-gray-200">
      <ActivityIndicator size="large" color={theme.primary} />
      <ThemedText className="mt-5 text-base">Finalizing your account...</ThemedText>
    </View>
  );
}
