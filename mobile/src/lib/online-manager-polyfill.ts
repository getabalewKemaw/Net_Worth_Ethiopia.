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

// Fallback for globalThis.expo to prevent early initialization crashes
if (!(globalThis as any).expo) {
  class FallbackEventEmitter {
    private listeners = new Map<string, Set<Function>>();
    addListener(eventName: string, listener: Function) {
      if (!this.listeners.has(eventName)) this.listeners.set(eventName, new Set());
      this.listeners.get(eventName)!.add(listener);
      return {
        remove: () => {
          this.listeners.get(eventName)?.delete(listener);
        },
      };
    }
    removeListener(eventName: string, listener: Function) {
      this.listeners.get(eventName)?.delete(listener);
    }
    removeAllListeners(eventName?: string) {
      if (eventName) this.listeners.get(eventName)?.clear();
      else this.listeners.clear();
    }
    emit(eventName: string, ...args: any[]) {
      this.listeners.get(eventName)?.forEach((l) => {
        try { l(...args); } catch (e) { console.error(e); }
      });
    }
    listenerCount(eventName: string) {
      return this.listeners.get(eventName)?.size ?? 0;
    }
  }

  (globalThis as any).expo = {
    EventEmitter: FallbackEventEmitter,
    modules: {},
  };
} else if (!(globalThis as any).expo.EventEmitter) {
  class FallbackEventEmitter {
    private listeners = new Map<string, Set<Function>>();
    addListener(eventName: string, listener: Function) {
      if (!this.listeners.has(eventName)) this.listeners.set(eventName, new Set());
      this.listeners.get(eventName)!.add(listener);
      return {
        remove: () => {
          this.listeners.get(eventName)?.delete(listener);
        },
      };
    }
    removeListener(eventName: string, listener: Function) {
      this.listeners.get(eventName)?.delete(listener);
    }
    removeAllListeners(eventName?: string) {
      if (eventName) this.listeners.get(eventName)?.clear();
      else this.listeners.clear();
    }
    emit(eventName: string, ...args: any[]) {
      this.listeners.get(eventName)?.forEach((l) => {
        try { l(...args); } catch (e) { console.error(e); }
      });
    }
    listenerCount(eventName: string) {
      return this.listeners.get(eventName)?.size ?? 0;
    }
  }

  (globalThis as any).expo.EventEmitter = FallbackEventEmitter;
}

