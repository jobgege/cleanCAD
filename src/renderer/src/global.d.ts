declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    placeItemName: string
  }
}
