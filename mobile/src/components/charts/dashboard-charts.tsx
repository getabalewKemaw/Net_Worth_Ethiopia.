import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  G,
} from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

const screenWidth = Dimensions.get('window').width;

export function SalesTrendAreaChart() {
  const colors = useTheme();

  // SVG Area Chart Dimensions
  const height = 150;
  const width = Math.min(screenWidth - 64, 500);

  // Smooth Area & Line Path Data
  // Mon: 12k, Tue: 14.5k, Wed: 9.8k, Thu: 16.2k, Fri: 19k, Sat: 15.4k, Sun: 18.45k
  const linePath = `M 10 90 Q 60 70, 110 50 T 210 85 T 310 35 T 410 15 T 510 40 T 600 20`;
  const areaPath = `${linePath} L 600 ${height - 20} L 10 ${height - 20} Z`;

  const dataPoints = [
    { x: 20, y: 85, val: '12k', label: 'Mon' },
    { x: 100, y: 65, val: '14.5k', label: 'Tue' },
    { x: 180, y: 95, val: '9.8k', label: 'Wed' },
    { x: 260, y: 50, val: '16.2k', label: 'Thu' },
    { x: 340, y: 20, val: '19k', label: 'Fri', peak: true },
    { x: 420, y: 55, val: '15.4k', label: 'Sat' },
    { x: 500, y: 30, val: '18.5k', label: 'Sun', active: true },
  ];

  return (
    <View className="w-full gap-3">
      {/* Chart Canvas */}
      <View className="items-center justify-center py-1">
        <Svg width="100%" height={height} viewBox={`0 0 520 ${height}`}>
          <Defs>
            {/* Emerald Gradient Fill */}
            <LinearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
              <Stop offset="80%" stopColor="#10B981" stopOpacity="0.02" />
            </LinearGradient>
            {/* Secondary Gold Gradient */}
            <LinearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Area Fill */}
          <Path
            d="M 20 85 C 60 70, 80 65, 100 65 C 140 65, 160 95, 180 95 C 220 95, 240 50, 260 50 C 300 50, 320 20, 340 20 C 380 20, 400 55, 420 55 C 460 55, 480 30, 500 30 L 500 130 L 20 130 Z"
            fill="url(#emeraldGradient)"
          />

          {/* Main Revenue Line */}
          <Path
            d="M 20 85 C 60 70, 80 65, 100 65 C 140 65, 160 95, 180 95 C 220 95, 240 50, 260 50 C 300 50, 320 20, 340 20 C 380 20, 400 55, 420 55 C 460 55, 480 30, 500 30"
            fill="none"
            stroke={colors.primary}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Secondary Profit Line */}
          <Path
            d="M 20 105 C 60 95, 80 90, 100 90 C 140 90, 160 110, 180 110 C 220 110, 240 80, 260 80 C 300 80, 320 55, 340 55 C 380 55, 400 85, 420 85 C 460 85, 480 65, 500 65"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeDasharray="4, 4"
            strokeLinecap="round"
          />

          {/* Interactive Glowing Datapoints */}
          {dataPoints.map((pt, idx) => (
            <G key={idx}>
              <Circle
                cx={pt.x}
                cy={pt.y}
                r={pt.peak || pt.active ? '6' : '4'}
                fill={pt.active ? colors.primary : pt.peak ? '#10B981' : colors.backgroundElement}
                stroke={colors.primary}
                strokeWidth="2"
              />
            </G>
          ))}
        </Svg>
      </View>

      {/* Days & Values Label Row */}
      <View className="flex-row items-center justify-between px-1 border-t border-gray-100 pt-2">
        {dataPoints.map((pt, idx) => (
          <View key={idx} className="items-center">
            <ThemedText className={`text-[11px] ${pt.active ? 'font-black text-[#10B981]' : 'font-medium'}`} style={{ color: pt.active ? '#10B981' : colors.textSecondary }}>
              {pt.label}
            </ThemedText>
            <ThemedText className="text-[10px] font-bold" style={{ color: colors.text }}>
              {pt.val}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

export function PaymentChannelDonutChart() {
  const colors = useTheme();

  return (
    <View className="flex-row items-center justify-between gap-4">
      {/* SVG Donut Ring Graphic */}
      <View className="relative items-center justify-center">
        <Svg width="120" height="120" viewBox="0 0 120 120">
          {/* Base Track */}
          <Circle
            cx="60"
            cy="60"
            r="45"
            stroke={colors.backgroundElement}
            strokeWidth="14"
            fill="none"
          />
          {/* Segment 1: Telebirr 55% (#0284C7) */}
          <Circle
            cx="60"
            cy="60"
            r="45"
            stroke="#0284C7"
            strokeWidth="14"
            fill="none"
            strokeDasharray="282.7"
            strokeDashoffset="127"
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
          {/* Segment 2: CBE Birr 30% (#2E7D32) */}
          <Circle
            cx="60"
            cy="60"
            r="45"
            stroke="#2E7D32"
            strokeWidth="14"
            fill="none"
            strokeDasharray="282.7"
            strokeDashoffset="197"
            strokeLinecap="round"
            transform="rotate(108 60 60)"
          />
          {/* Segment 3: Cash 15% (#D97706) */}
          <Circle
            cx="60"
            cy="60"
            r="45"
            stroke="#D97706"
            strokeWidth="14"
            fill="none"
            strokeDasharray="282.7"
            strokeDashoffset="240"
            strokeLinecap="round"
            transform="rotate(216 60 60)"
          />
        </Svg>
        {/* Center Text */}
        <View className="absolute items-center justify-center">
          <ThemedText className="text-[15px] font-black" style={{ color: colors.text }}>100%</ThemedText>
          <ThemedText className="text-[9px] font-bold uppercase text-[#60646C]">Payment</ThemedText>
        </View>
      </View>

      {/* Channel Breakdown Details */}
      <View className="flex-1 gap-2">
        {/* Telebirr */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full bg-[#0284C7]" />
            <ThemedText className="text-[13px] font-bold" style={{ color: colors.text }}>Telebirr</ThemedText>
          </View>
          <ThemedText className="text-[13px] font-black text-[#0284C7]">55% (10,147 ETB)</ThemedText>
        </View>

        {/* CBE Birr */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full bg-[#2E7D32]" />
            <ThemedText className="text-[13px] font-bold" style={{ color: colors.text }}>CBE Birr</ThemedText>
          </View>
          <ThemedText className="text-[13px] font-black text-[#2E7D32]">30% (5,535 ETB)</ThemedText>
        </View>

        {/* Cash */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full bg-[#D97706]" />
            <ThemedText className="text-[13px] font-bold" style={{ color: colors.text }}>Cash</ThemedText>
          </View>
          <ThemedText className="text-[13px] font-black text-[#D97706]">15% (2,768 ETB)</ThemedText>
        </View>
      </View>
    </View>
  );
}
