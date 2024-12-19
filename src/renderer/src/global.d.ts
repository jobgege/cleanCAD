declare global {
  interface Window {
    electron: ElectronAPI
    api: ElectronAPI
    placeItemName: string
  }
}
