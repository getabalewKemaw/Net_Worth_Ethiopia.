import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { RefreshCwIcon } from '@/components/icons';
import { useTextFetchingStore } from '@/store/text-fetching-store';

interface ScanHeaderProps {
  onScan: () => void;
}

function formatRelativeTime(isoString: string | null): string {
  if (!isoString) return 'Not scanned yet';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 10) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ScanHeader({ onScan }: ScanHeaderProps) {
  const colors = useTheme();
  const { isScanning, lastScanTime, getPendingCount } = useTextFetchingStore();
  const pendingCount = getPendingCount();

  return (
    <View className="px-4 pt-1 pb-2 flex-row items-center justify-between">
      {/* Title & Sync Status */}
      <View className="flex-1 pr-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-black text-slate-900 dark:text-slate-100">
            Bank SMS Inbox
          </Text>
          {pendingCount > 0 && (
            <View className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
              <Text className="text-[10.5px] font-black text-emerald-700 dark:text-emerald-300">
                {pendingCount} new
              </Text>
            </View>
          )}
        </View>
        <Text className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
          Last scan: {formatRelativeTime(lastScanTime)}
        </Text>
      </View>

      {/* Sync Action Button */}
      <Pressable
        onPress={onScan}
        disabled={isScanning}
        className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl active:opacity-80"
        style={{
          backgroundColor: isScanning ? '#E2E8F0' : '#065F46',
        }}
      >
        {isScanning ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <RefreshCwIcon size={13} color="#FFFFFF" strokeWidth={2.5} />
        )}
        <Text
          className="text-xs font-bold text-white"
          style={{ color: isScanning ? '#94A3B8' : '#FFFFFF' }}
        >
          {isScanning ? 'Scanning...' : 'Sync SMS'}
        </Text>
      </Pressable>
    </View>
  );
}
