/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AM_TASK_ID: string
  readonly VITE_AM_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}