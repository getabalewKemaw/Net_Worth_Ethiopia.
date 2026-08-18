import { View, ViewProps } from 'react-native';

export function AuthCard({ children, style, className, ...rest }: ViewProps & { className?: string }) {
  return (
    <View 
      className={`bg-white rounded-3xl py-7 px-6 mt-2.5 w-full shadow-lg shadow-black/10 ${className || ''}`} 
      style={style}
      {...rest}
    >
      {children}
    </View>
  );
}
