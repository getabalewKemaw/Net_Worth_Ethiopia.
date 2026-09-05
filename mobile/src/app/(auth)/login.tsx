import { View, TouchableOpacity, Text } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import * as Linking from 'expo-linking';

import { BackgroundGrid } from '@/components/auth/BackgroundGrid';
import { AuthCard } from '@/components/auth/AuthCard';
import { GoogleButton } from '@/components/auth/GoogleButton';
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
        console.warn('[handleGoogleLogin] Auth returned error:', error);
        router.replace({
          pathname: '/(auth)/signup',
          params: { message: signupMessage },
        });
      }
    } catch (err) {
      console.error('[handleGoogleLogin] Exception during Google login:', err);
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
          <View className="items-center mb-8">
            <View className="py-3 px-6 rounded-2xl mb-5 bg-white shadow-lg shadow-black/10">
              <Image 
                source={require('@/assets/images/logo.png')} 
                className="h-12 w-[160px]"
                contentFit="contain"
              />
            </View>
            <Text className="text-white text-3xl font-extrabold mb-2 text-center tracking-tight">Welcome Back</Text>
            <Text className="text-white/95 text-base font-medium text-center px-4">Log in to continue to NetWorth</Text>
          </View>

          <AuthCard>
            <GoogleButton 
              title="Log in with Google" 
              onPress={handleGoogleLogin} 
              className="mb-5"
            />

            <View className="flex-row justify-center items-center mt-4 mb-2">
              <Text className="text-sm text-gray-600 font-medium">Don't have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text className="text-sm font-bold ml-1" style={{ color: theme.primary }}>Sign up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </AuthCard>
        </View>
      </SafeAreaView>
    </View>
  );
}
