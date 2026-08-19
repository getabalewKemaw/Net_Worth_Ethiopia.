import { Platform, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
  className?: string;
};

export function ThemedText({ style, type = 'default', themeColor, className, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  const typeClasses = {
    small: 'text-[14px] leading-[20px] font-medium',
    smallBold: 'text-[14px] leading-[20px] font-bold',
    default: 'text-[16px] leading-[24px] font-medium',
    title: 'text-[48px] font-semibold leading-[52px]',
    subtitle: 'text-[32px] font-semibold leading-[44px]',
    link: 'text-[14px] leading-[30px]',
    linkPrimary: 'text-[14px] leading-[30px] text-[#3c87f7]',
    code: 'text-[12px] font-medium', // Android bold is handled via style to match original
  };

  const getFontFamily = (typeStr: string) => {
    if (typeStr === 'code') return Fonts.mono;
    return Fonts.sans;
  };

  // Check if custom text color is supplied via className (e.g. text-white, text-brand, text-red-600, etc.)
  const hasTextColorClass = Boolean(
    className &&
    /\btext-(?!(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|left|center|right|justify|wrap|nowrap|\[?\d+px\]?)\b)[a-zA-Z0-9_#\[\]-]+/.test(className)
  );

  const styleObject = typeof style === 'object' && style !== null && !Array.isArray(style) ? style : {};
  const hasStyleColor = 'color' in styleObject || (Array.isArray(style) && style.some((s) => s && typeof s === 'object' && 'color' in s));

  const applyDefaultColor = !themeColor && !hasTextColorClass && !hasStyleColor;

  return (
    <Text
      style={[
        {
          fontFamily: getFontFamily(type),
        },
        themeColor ? { color: theme[themeColor] } : undefined,
        applyDefaultColor ? { color: theme.text } : undefined,
        type === 'code' && Platform.OS === 'android' ? { fontWeight: 'bold' } : undefined,
        style,
      ]}
      className={`${typeClasses[type]} ${className || ''}`}
      {...rest}
    />
  );
}
