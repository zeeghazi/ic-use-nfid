// node_modules/@xstate/store/dist/xstate-store.esm.js
var symbolObservable = (() => typeof Symbol === "function" && Symbol.observable || "@@observable")();
function toObserver(nextHandler, errorHandler, completionHandler) {
  const isObserver = typeof nextHandler === "object";
  const self = isObserver ? nextHandler : void 0;
  return {
    next: (isObserver ? nextHandler.next : nextHandler)?.bind(self),
    error: (isObserver ? nextHandler.error : errorHandler)?.bind(self),
    complete: (isObserver ? nextHandler.complete : completionHandler)?.bind(self)
  };
}
function setter(context, recipe) {
  return recipe(context);
}
var inspectionObservers = /* @__PURE__ */ new WeakMap();
function createStoreCore(initialContext2, transitions, updater) {
  let observers;
  let listeners;
  const initialSnapshot = {
    context: initialContext2,
    status: "active",
    output: void 0,
    error: void 0
  };
  let currentSnapshot = initialSnapshot;
  const emit = (ev) => {
    if (!listeners) {
      return;
    }
    const type = ev.type;
    const typeListeners = listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach((listener) => listener(ev));
    }
  };
  const transition = createStoreTransition(transitions, updater);
  function receive(event) {
    let emitted;
    [currentSnapshot, emitted] = transition(currentSnapshot, event);
    inspectionObservers.get(store2)?.forEach((observer) => {
      observer.next?.({
        type: "@xstate.snapshot",
        event,
        snapshot: currentSnapshot,
        actorRef: store2,
        rootId: store2.sessionId
      });
    });
    observers?.forEach((o) => o.next?.(currentSnapshot));
    emitted.forEach(emit);
  }
  const store2 = {
    on(emittedEventType, handler) {
      if (!listeners) {
        listeners = /* @__PURE__ */ new Map();
      }
      let eventListeners = listeners.get(emittedEventType);
      if (!eventListeners) {
        eventListeners = /* @__PURE__ */ new Set();
        listeners.set(emittedEventType, eventListeners);
      }
      const wrappedHandler = handler.bind(void 0);
      eventListeners.add(wrappedHandler);
      return {
        unsubscribe() {
          eventListeners.delete(wrappedHandler);
        }
      };
    },
    sessionId: uniqueId(),
    send(event) {
      inspectionObservers.get(store2)?.forEach((observer) => {
        observer.next?.({
          type: "@xstate.event",
          event,
          sourceRef: void 0,
          actorRef: store2,
          rootId: store2.sessionId
        });
      });
      receive(event);
    },
    getSnapshot() {
      return currentSnapshot;
    },
    getInitialSnapshot() {
      return initialSnapshot;
    },
    subscribe(observerOrFn) {
      const observer = toObserver(observerOrFn);
      observers ??= /* @__PURE__ */ new Set();
      observers.add(observer);
      return {
        unsubscribe() {
          return observers?.delete(observer);
        }
      };
    },
    [symbolObservable]() {
      return this;
    },
    inspect: (observerOrFn) => {
      const observer = toObserver(observerOrFn);
      inspectionObservers.set(store2, inspectionObservers.get(store2) ?? /* @__PURE__ */ new Set());
      inspectionObservers.get(store2).add(observer);
      observer.next?.({
        type: "@xstate.actor",
        actorRef: store2,
        rootId: store2.sessionId
      });
      observer.next?.({
        type: "@xstate.snapshot",
        snapshot: initialSnapshot,
        event: {
          type: "@xstate.init"
        },
        actorRef: store2,
        rootId: store2.sessionId
      });
      return {
        unsubscribe() {
          return inspectionObservers.get(store2)?.delete(observer);
        }
      };
    }
  };
  return store2;
}
function createStore(initialContextOrObject, transitions) {
  if (transitions === void 0) {
    return createStoreCore(initialContextOrObject.context, initialContextOrObject.on);
  }
  return createStoreCore(initialContextOrObject, transitions);
}
function createStoreTransition(transitions, updater) {
  return (snapshot, event) => {
    let currentContext = snapshot.context;
    const assigner = transitions?.[event.type];
    const emitted = [];
    const enqueue = {
      emit: (ev) => {
        emitted.push(ev);
      }
    };
    if (!assigner) {
      return [snapshot, emitted];
    }
    if (typeof assigner === "function") {
      currentContext = updater ? updater(currentContext, (draftContext) => assigner?.(draftContext, event, enqueue)) : setter(currentContext, (draftContext) => Object.assign({}, currentContext, assigner?.(
        draftContext,
        event,
        // TODO: help me
        enqueue
      )));
    } else {
      const partialUpdate = {};
      for (const key of Object.keys(assigner)) {
        const propAssignment = assigner[key];
        partialUpdate[key] = typeof propAssignment === "function" ? propAssignment(currentContext, event, enqueue) : propAssignment;
      }
      currentContext = Object.assign({}, currentContext, partialUpdate);
    }
    return [{
      ...snapshot,
      context: currentContext
    }, emitted];
  };
}
function uniqueId() {
  return Math.random().toString(36).slice(6);
}

// node_modules/@xstate/store/react/dist/xstate-store-react.esm.js
import { useSyncExternalStore, useCallback, useRef } from "react";
function defaultCompare(a, b) {
  return a === b;
}
function useSelectorWithCompare(selector, compare) {
  const previous = useRef();
  return (state) => {
    const next = selector(state);
    return compare(previous.current, next) ? previous.current : previous.current = next;
  };
}
function useSelector(store2, selector, compare = defaultCompare) {
  const selectorWithCompare = useSelectorWithCompare(selector, compare);
  return useSyncExternalStore(useCallback((handleStoreChange) => store2.subscribe(handleStoreChange).unsubscribe, [store2]), () => selectorWithCompare(store2.getSnapshot()), () => selectorWithCompare(store2.getInitialSnapshot()));
}

// src/index.tsx
import { useEffect } from "react";
import {
  AuthClient
} from "@dfinity/auth-client";
var initialContext = {
  providerComponentPresent: false,
  authClient: void 0,
  createOptions: void 0,
  loginOptions: void 0,
  isInitializing: false,
  loginStatus: "idle",
  loginError: void 0,
  identity: void 0
};
var store = createStore({
  context: initialContext,
  on: {
    setProviderComponentPresent: {
      providerComponentPresent: (_, event) => event.providerComponentPresent
    },
    setAuthClient: {
      authClient: (_, event) => event.authClient
    },
    setCreateOptions: {
      createOptions: (_, event) => event.createOptions
    },
    setLoginOptions: {
      loginOptions: (_, event) => event.loginOptions
    },
    setIsInitializing: {
      isInitializing: (_, event) => event.isInitializing
    },
    setLoginStatus: {
      loginStatus: (_, event) => event.loginStatus
    },
    setIdentity: {
      identity: (_, event) => event.identity
    },
    setLoginError: {
      loginError: (_, event) => event.loginError
    }
  }
});
async function createAuthClient() {
  const createOptions = store.getSnapshot().context.createOptions;
  const options = {
    idleOptions: {
      // Default behaviour of this hook is not to logout and reload window on indentity expiration
      disableDefaultIdleCallback: true,
      disableIdle: true,
      ...createOptions?.idleOptions
    },
    ...createOptions
  };
  const authClient = await AuthClient.create(options);
  store.send({ type: "setAuthClient", authClient });
  return authClient;
}
async function login() {
  const context = store.getSnapshot().context;
  if (!context.providerComponentPresent) {
    console.error(
      "The InternetIdentityProvider component is not present. Make sure to wrap your app with it."
    );
  }
  let authClient = context.authClient;
  if (!authClient) {
    authClient = await createAuthClient();
  }
  if (await authClient.isAuthenticated()) {
    throw new Error("User is already authenticated");
  }
  const loginOptions = context.loginOptions;
  const options = {
    identityProvider: process.env.NFID_URL,
    onSuccess: onLoginSuccess,
    onError: onLoginError,
    maxTimeToLive: BigInt(36e11),
    // Defaults to 1 hour
    ...loginOptions
  };
  store.send({ type: "setLoginStatus", loginStatus: "logging-in" });
  authClient.login(options);
}
function onLoginSuccess() {
  const identity = store.getSnapshot().context.authClient?.getIdentity();
  if (!identity) {
    throw new Error("Identity not found after successful login");
  }
  store.send({ type: "setIdentity", identity });
  store.send({ type: "setLoginStatus", loginStatus: "success" });
}
function onLoginError(error) {
  store.send({ type: "setLoginStatus", loginStatus: "error" });
  store.send({ type: "setLoginError", loginError: new Error(error) });
}
async function clear() {
  const authClient = store.getSnapshot().context.authClient;
  if (!authClient) {
    throw new Error("Auth client not initialized");
  }
  await authClient.logout();
  store.send({ type: "setIdentity", identity: void 0 });
  store.send({ type: "setLoginStatus", loginStatus: "idle" });
  store.send({ type: "setLoginError", loginError: void 0 });
  store.send({ type: "setAuthClient", authClient: void 0 });
}
var useNFID = () => {
  const context = useSelector(store, (state) => state.context);
  return {
    isInitializing: context.isInitializing,
    login,
    loginStatus: context.loginStatus,
    loginError: context.loginError,
    isLoggingIn: context.loginStatus === "logging-in",
    isLoginError: context.loginStatus === "error",
    isLoginSuccess: context.loginStatus === "success",
    isLoginIdle: context.loginStatus === "idle",
    clear,
    identity: context.identity
  };
};
function NFIDProvider({
  children,
  createOptions,
  loginOptions
}) {
  useEffect(() => {
    (async () => {
      store.send({
        type: "setProviderComponentPresent",
        providerComponentPresent: true
      });
      store.send({ type: "setIsInitializing", isInitializing: true });
      store.send({ type: "setCreateOptions", createOptions });
      store.send({ type: "setLoginOptions", loginOptions });
      let authClient = store.getSnapshot().context.authClient;
      if (!authClient) {
        authClient = await createAuthClient();
      }
      const isAuthenticated = await authClient.isAuthenticated();
      if (isAuthenticated) {
        const identity = authClient.getIdentity();
        if (identity) {
          store.send({ type: "setIdentity", identity });
        }
      }
      store.send({ type: "setIsInitializing", isInitializing: false });
    })();
  }, [createOptions, loginOptions]);
  return children;
}
export {
  NFIDProvider,
  useNFID
};
