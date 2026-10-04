import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { RefreshCwIcon } from '@/components/icons';
import { useTextFetchingStore } from '@/store/text-fetching-store';

interface ScanHeaderProps {
  onScan: () => void;
}

function formatRelativeTime(isoString: string | null): string {
  if (!isoString) return 'Never scanned';
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
  const { isScanning, lastScanTime, useMockData, toggleMockMode, getPendingCount } =
    useTextFetchingStore();

  const pendingCount = getPendingCount();

  return (
    <View
      className="mx-4 mt-2 mb-3 p-4 rounded-3xl border"
      style={{
        backgroundColor: colors.backgroundElement,
        borderColor: colors.backgroundSelected,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between">
        {/* Left: Title & Subtitle */}
        <View className="flex-1 pr-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-xl font-black text-slate-900 dark:text-slate-100">
              Bank & SMS Fetching
            </Text>
            {pendingCount > 0 && (
              <View className="bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                <Text className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                  {pendingCount} new
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-xs font-medium text-slate-500">
              Last scanned: {formatRelativeTime(lastScanTime)}
            </Text>

            {/* Mock Data Badge & Toggle */}
            <Pressable
              onPress={() => toggleMockMode()}
              className="flex-row items-center px-1.5 py-0.5 rounded border"
              style={{
                backgroundColor: useMockData ? '#FEF3C7' : '#F1F5F9',
                borderColor: useMockData ? '#FCD34D' : '#CBD5E1',
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  color: useMockData ? '#B45309' : '#64748B',
                }}
              >
                {useMockData ? 'Demo Mock SMS' : 'Live SIM SMS'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Right: Scan Now Action Button */}
        <Pressable
          onPress={onScan}
          disabled={isScanning}
          className="flex-row items-center gap-2 px-3.5 py-2.5 rounded-2xl active:opacity-80"
          style={{
            backgroundColor: isScanning ? '#E2E8F0' : colors.primary,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          {isScanning ? (
            <ActivityIndicator size="small" color="#0F172A" />
          ) : (
            <RefreshCwIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
          )}
          <Text
            className="text-xs font-bold"
            style={{ color: isScanning ? '#64748B' : '#FFFFFF' }}
          >
            {isScanning ? 'Scanning...' : 'Scan Now'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
