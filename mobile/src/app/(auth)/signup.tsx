import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import Checkbox from 'expo-checkbox';

import { BackgroundGrid } from '@/components/auth/BackgroundGrid';
import { AuthCard } from '@/components/auth/AuthCard';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { ThemedText } from '@/components/themed-text';
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
        callbackURL: Linking.createURL('/signup-success'),
      });

      if (error) {
        router.replace({
          pathname: '/(auth)/signup',
          params: {
            message:
              'We could not start Google sign-up right now. Please try again or use the form below to continue.',
          },
        });
      }
    } catch {
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
        <View className="flex-1 px-5 pt-20 items-center">
          <View className="items-center mb-5">
            <View className="py-2.5 px-5 rounded-2xl mb-4 bg-white shadow-md shadow-black/10">
              <Image 
                source={require('@/assets/images/logo.png')} 
                className="h-10 w-[150px]"
                contentFit="contain"
              />
            </View>
            <ThemedText type="title" className="text-white text-2xl mb-1.5 text-center">Create Account</ThemedText>
            <ThemedText className="text-white/90 text-sm text-center">Sign up to start tracking your net worth</ThemedText>
          </View>

          <AuthCard>
            <View className="bg-white/90 rounded-2xl px-4 py-3.5 mb-4.5 border border-gray-900/10">
              <ThemedText className="text-[11px] tracking-wider uppercase font-bold text-gray-500 mb-1">Registration required</ThemedText>
              <ThemedText className="text-[15px] leading-5 font-bold mb-1.5 text-gray-900">Google account not registered yet</ThemedText>
              <ThemedText className="text-[13px] leading-[18px] text-gray-700">
                {notice}
              </ThemedText>
            </View>

            <View className="flex-row items-center mb-5 px-1">
              <Checkbox
                className="mr-3"
                value={isChecked}
                onValueChange={setChecked}
                color={isChecked ? theme.primary : undefined}
              />
              <ThemedText className="text-[13px] flex-1">I agree to the Terms of Service and Privacy Policy</ThemedText>
            </View>
            
            <View className={!isChecked ? "opacity-50" : ""}>
              <GoogleButton 
                title="Sign up with Google" 
                onPress={handleGoogleSignup} 
                className="mb-5"
              />
            </View>

            <View className="flex-row justify-center items-center mt-2.5">
              <ThemedText className="text-sm">Already have an account? </ThemedText>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <ThemedText className="text-sm font-bold" style={{ color: theme.primary }}>Log in</ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          </AuthCard>
        </View>
      </SafeAreaView>
    </View>
  );
}
