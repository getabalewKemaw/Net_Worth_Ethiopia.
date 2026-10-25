import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router, useLocalSearchParams } from 'expo-router';
import ExpoCheckbox from 'expo-checkbox';

import { BackgroundGrid } from '@/components/auth/BackgroundGrid';
import { AuthCard } from '@/components/auth/AuthCard';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { useTheme } from '@/hooks/use-theme';
import { authClient } from '@/lib/auth-client';

const signupNotice =
  'Google sign-up is only available after you accept the Terms of Service and Privacy Policy.';

export default function SignupScreen() {
  const theme = useTheme();
  const [isChecked, setChecked] = useState(false);
  const { message } = useLocalSearchParams<{ message?: string }>();
  const notice = typeof message === 'string' && message.length > 0 ? message : signupNotice;

  const handleGoogleSignup = async () => {
    if (!isChecked) return;

    try {
      const { error } = await authClient.signIn.social({
        provider: 'google',
        requestSignUp: true,
        callbackURL: '/signup-success',
      });

      if (error) {
        console.warn('[handleGoogleSignup] Auth returned error:', error);
        router.replace({
          pathname: '/(auth)/signup',
          params: {
            message:
              'We could not start Google sign-up right now. Please try again or use the form below to continue.',
          },
        });
      }
    } catch (err) {
      console.error('[handleGoogleSignup] Exception during Google signup:', err);
      router.replace({
        pathname: '/(auth)/signup',
        params: {
          message:
            'We could not start Google sign-up right now. Please try again or use the form below to continue.',
        },
      });
    }
  };

  return (
    <View className="flex-1 bg-gray-200">
      <BackgroundGrid />
      
      <SafeAreaView className="flex-1 z-[2]">
        <View className="flex-1 px-5 pt-16 items-center">
          <View className="items-center mb-6">
            <View style={styles.logoCard}>
              <Image 
                source={require('@/assets/images/logo/networth.jpg')} 
                style={styles.logoImage}
                contentFit="cover"
              />
            </View>
            <Text className="text-white text-3xl font-extrabold mb-2 text-center tracking-tight" style={{ fontFamily: 'Lexend_800ExtraBold' }}>
              Create Account
            </Text>
            <Text className="text-white/95 text-base font-medium text-center px-4" style={{ fontFamily: 'Lexend_500Medium' }}>
              Sign up to start tracking your net worth
            </Text>
          </View>

          <AuthCard className="pt-6">
            <View className="bg-amber-50 rounded-xl px-5 py-4 mb-6 border border-amber-200">
              <Text className="text-[11px] tracking-widest uppercase font-bold text-amber-700 mb-1" style={{ fontFamily: 'Lexend_700Bold' }}>
                Registration Notice
              </Text>
              <Text className="text-sm font-semibold text-amber-900 leading-tight mb-2" style={{ fontFamily: 'Lexend_600SemiBold' }}>
                Google account not registered
              </Text>
              <Text className="text-[13px] leading-5 text-amber-800" style={{ fontFamily: 'Lexend_400Regular' }}>
                {notice}
              </Text>
            </View>

            <View className="flex-row items-center mb-6 px-2 bg-gray-50 py-3 rounded-lg border border-gray-100">
              <ExpoCheckbox
                className="mr-3 h-5 w-5"
                value={isChecked}
                onValueChange={setChecked}
                color={isChecked ? theme.primary : undefined}
              />
              <Text className="text-sm text-gray-700 flex-1 font-medium leading-tight" style={{ fontFamily: 'Lexend_500Medium' }}>
                I agree to the Terms of Service and Privacy Policy
              </Text>
            </View>
            
            <View className={!isChecked ? "opacity-50" : ""}>
              <GoogleButton 
                title="Sign up with Google" 
                onPress={handleGoogleSignup} 
                className="mb-5"
                disabled={!isChecked}
              />
            </View>

            <View className="flex-row justify-center items-center mt-2 mb-2">
              <Text className="text-sm text-gray-600 font-medium" style={{ fontFamily: 'Lexend_500Medium' }}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-sm font-bold ml-1" style={{ color: theme.primary, fontFamily: 'Lexend_700Bold' }}>Log in</Text>
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
    marginBottom: 16,
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
