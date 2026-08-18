import { View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import * as Linking from 'expo-linking';

import { BackgroundGrid } from '@/components/auth/BackgroundGrid';
import { AuthCard } from '@/components/auth/AuthCard';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { authClient } from '@/lib/auth-client';

const signupMessage =
  "That Google account does not have a NetWorth account yet. Please register first and accept the terms before logging in.";

export default function LoginScreen() {
  const theme = useTheme();

  const handleGoogleLogin = async () => {
    try {
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: Linking.createURL('/'),
        errorCallbackURL: Linking.createURL(
          `/(auth)/signup?message=${encodeURIComponent(signupMessage)}`
        ),
      });

      if (error) {
        router.replace({
          pathname: '/(auth)/signup',
          params: { message: signupMessage },
        });
      }
    } catch {
      router.replace({
        pathname: '/(auth)/signup',
        params: { message: signupMessage },
      });
    }
  };

  return (
    <View className="flex-1 bg-gray-200">
      <BackgroundGrid />
      
      <SafeAreaView className="flex-1 z-[2]">
        <View className="flex-1 px-5 pt-20 items-center">
          <View className="items-center mb-5">
            <View className="py-2.5 px-5 rounded-2xl mb-4 bg-white shadow-md shadow-black/10">
              <Image 
                source={require('@/assets/images/logo.png')} 
                className="h-10 w-[150px]"
                contentFit="contain"
              />
            </View>
            <ThemedText type="title" className="text-white text-2xl mb-1.5 text-center">Welcome Back</ThemedText>
            <ThemedText className="text-white/90 text-sm text-center">Log in to continue to NetWorth</ThemedText>
          </View>

          <AuthCard>
            <GoogleButton 
              title="Log in with Google" 
              onPress={handleGoogleLogin} 
              className="mb-5"
            />

            <View className="flex-row justify-center items-center mt-2.5">
              <ThemedText className="text-sm">Don't have an account? </ThemedText>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <ThemedText className="text-sm font-bold" style={{ color: theme.primary }}>Sign up</ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          </AuthCard>
        </View>
      </SafeAreaView>
    </View>
  );
}
