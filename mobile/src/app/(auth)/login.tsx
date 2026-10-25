import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { Link, router } from 'expo-router';

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
      const errorCallbackURL = Linking.createURL('/(auth)/signup', {
        queryParams: { message: signupMessage },
      });

      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
        errorCallbackURL,
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
            <View style={styles.logoCard}>
              <Image 
                source={require('@/assets/images/logo/networth.jpg')} 
                style={styles.logoImage}
                contentFit="cover"
              />
            </View>
            <Text className="text-white text-3xl font-extrabold mb-2 text-center tracking-tight" style={{ fontFamily: 'Lexend_800ExtraBold' }}>
              Welcome Back
            </Text>
            <Text className="text-white/95 text-base font-medium text-center px-4" style={{ fontFamily: 'Lexend_500Medium' }}>
              Log in to continue to NetWorth Ethiopia
            </Text>
          </View>

          <AuthCard>
            <GoogleButton 
              title="Log in with Google" 
              onPress={handleGoogleLogin} 
              className="mb-5"
            />

            <View className="flex-row justify-center items-center mt-4 mb-2">
              <Text className="text-sm text-gray-600 font-medium" style={{ fontFamily: 'Lexend_500Medium' }}>Don&apos;t have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text className="text-sm font-bold ml-1" style={{ color: theme.primary, fontFamily: 'Lexend_700Bold' }}>Sign up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </AuthCard>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  logoCard: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
});
