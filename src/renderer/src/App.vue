<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component 
        :is="Component" 
      />
    </keep-alive>
  </router-view>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter()
window.api.routechange(()=>{
  router.push("/page/addSymbol")
})
</script>

<style scoped lang="scss">
</style>