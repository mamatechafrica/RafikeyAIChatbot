declare module 'virtual:pwa-register' {
  export type RegisterSWOptions = {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: any) => void
  }
  export type ServiceWorkerRegistration = {
    update: () => Promise<void>
    unregister: () => Promise<boolean>
    installing: ServiceWorker | null
    waiting: ServiceWorker | null
    active: ServiceWorker | null
    scope: string
  }
  export type ServiceWorker = {
    state: 'installing' | 'installed' | 'activating' | 'activated' | 'redundant'
    onstatechange: ((this: ServiceWorker, ev: Event) => any) | null
  }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => void
}
