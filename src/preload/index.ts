import { contextBridge , ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { rejects } from 'assert'

// Custom APIs for renderer
const api = {
  routechange: (callbak) => ipcRenderer.on("routechange",()=>{
    callbak()
  }),
  // getDrawFn: (name) => {
  //   return new Promise((resolve,reject)=>{
  //     ipcRenderer.send("getDrawFn",name)
  //     ipcRenderer.once("getDrawFnResponse", (event, data) => {
  //       if(data.success){
  //         resolve(data.data)
  //       }else{
  //         reject(data.error)
  //       }
  //     })
  //   })
  // },
  getSymbolLibrary:()=>{
    return new Promise((resolve,reject)=>{
      ipcRenderer.send("getSymbolLibrary")
      ipcRenderer.once("getSymbolLibraryResponse", (event, data) => {
        if(data.success){
          resolve(data.data)
        }else{
          reject(data.error)
        }
      })
    })
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
