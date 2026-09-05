// Polyfill for Better Auth online manager to prevent native ExpoNetwork crash on APKs built without expo-network
const kOnlineManager = Symbol.for('better-auth:online-manager');

if (!(globalThis as any)[kOnlineManager]) {
  (globalThis as any)[kOnlineManager] = {
    isOnline: true,
    listeners: new Set(),
    subscribe(listener: (online: boolean) => void) {
      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    },
    setOnline(online: boolean) {
      this.isOnline = online;
      this.listeners.forEach((l: (online: boolean) => void) => l(online));
    },
    setup() {
      // Safe no-op setup that avoids calling missing native ExpoNetwork module
      return () => {};
    },
  };
}
