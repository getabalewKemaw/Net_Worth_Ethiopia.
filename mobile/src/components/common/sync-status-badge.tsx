import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useNetworkSync } from '@/hooks/use-network-sync';

/**
 * Compact, modern status badge displaying live network and synchronization state.
 * Adapts dynamically between Online, Offline (with pending count), and Syncing.
 */
export function SyncStatusBadge() {
  const { isOnline, isSyncing, pendingCount, triggerSync } = useNetworkSync();

  if (!isOnline) {
    return (
      <View style={[styles.badge, styles.offlineBadge]}>
        <View style={[styles.dot, styles.offlineDot]} />
        <ThemedText style={[styles.text, styles.offlineText]}>
          Offline {pendingCount > 0 ? `(${pendingCount})` : ''}
        </ThemedText>
      </View>
    );
  }

  if (isSyncing) {
    return (
      <View style={[styles.badge, styles.syncingBadge]}>
        <View style={[styles.dot, styles.syncingDot]} />
        <ThemedText style={[styles.text, styles.syncingText]}>
          Syncing...
        </ThemedText>
      </View>
    );
  }

  if (pendingCount > 0) {
    return (
      <Pressable onPress={() => triggerSync()} style={[styles.badge, styles.pendingBadge]}>
        <View style={[styles.dot, styles.pendingDot]} />
        <ThemedText style={[styles.text, styles.pendingText]}>
          ↑ {pendingCount} to sync
        </ThemedText>
      </Pressable>
    );
  }

  // Fully connected & synced
  return (
    <View style={[styles.badge, styles.onlineBadge]}>
      <View style={[styles.dot, styles.onlineDot]} />
      <ThemedText style={[styles.text, styles.onlineText]}>
        Online
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  onlineBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  onlineDot: {
    backgroundColor: '#10B981',
  },
  onlineText: {
    color: '#065F46',
  },
  offlineBadge: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  offlineDot: {
    backgroundColor: '#D97706',
  },
  offlineText: {
    color: '#B45309',
  },
  syncingBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  syncingDot: {
    backgroundColor: '#059669',
  },
  syncingText: {
    color: '#065F46',
  },
  pendingBadge: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  pendingDot: {
    backgroundColor: '#2563EB',
  },
  pendingText: {
    color: '#1D4ED8',
  },
});
