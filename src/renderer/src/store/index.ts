import { ref } from "vue"
import { defineStore } from 'pinia'
export const useSymbolStore = defineStore('user', {
    state:()=>({
        currentSymbol:ref()
    }),
    persist: true
})