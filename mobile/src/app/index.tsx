import { Pressable, StyleSheet, View, ActivityIndicator } from 'react-native';
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>Dashboard</ThemedText>

        {isPending ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <View style={styles.cardContainer}>
            {/* Active Business */}
            <View style={[styles.infoCard, { backgroundColor: colors.backgroundElement }]}>
              <ThemedText style={styles.cardLabel}>Active Business</ThemedText>
              <ThemedText style={[styles.cardValue, { color: colors.text }]}>
                {activeBusiness?.name || "No Business"}
              </ThemedText>
              {activeBusiness?.type && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <ThemedText style={styles.badgeText}>{activeBusiness.type}</ThemedText>
                </View>
              )}
            </View>

            {/* Active Branch */}
            <View style={[styles.infoCard, { backgroundColor: colors.backgroundElement }]}>
              <ThemedText style={styles.cardLabel}>Operating Branch</ThemedText>
              <ThemedText style={[styles.cardValue, { color: colors.text }]}>
                {activeBranch?.name || "No Active Branch"}
              </ThemedText>
              {activeBranch && (
                <ThemedText style={styles.branchCode}>
                  Code: {activeBranch.branchCode || "N/A"}
                </ThemedText>
              )}
            </View>

            {/* Actions */}
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(business)/branches')}
            >
              <ThemedText style={styles.actionButtonText}>Switch Business / Branches</ThemedText>
            </Pressable>

            <Pressable
              style={[styles.outlineButton, { borderColor: colors.primary }]}
              onPress={() => router.push('/(business)/business-profile')}
            >
              <ThemedText style={[styles.outlineButtonText, { color: colors.primary }]}>Business Profile Settings</ThemedText>
            </Pressable>
          </View>
        )}

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText style={styles.logoutText}>Log out</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  title: {
    marginBottom: 8,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  infoCard: {
    padding: 20,
    borderRadius: 14,
    gap: 6,
    alignItems: 'flex-start',
  },
  cardLabel: {
    fontSize: 12,
    color: '#60646C',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  branchCode: {
    fontSize: 12,
    color: '#60646C',
    fontFamily: 'monospace',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  outlineButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  outlineButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#111827',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
