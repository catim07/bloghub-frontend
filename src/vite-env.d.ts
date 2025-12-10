/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // thêm các biến khác sau này nếu cần
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}