import { ref } from "vue"
import { defineStore } from 'pinia'
export const userStore = defineStore('user', {
    state:()=>({
        
    }),
    persist: true
})