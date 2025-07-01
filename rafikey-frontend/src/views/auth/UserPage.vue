<script setup lang="ts">
import { useDark, useStorage } from '@vueuse/core'

const isDark = useDark()
const darkMode = useStorage('darkMode', isDark.value)


</script>

<template>
  <div>
    <RouterView #default="{Component, route}">
      <template v-if="Component">
        <component :is="Component" :key="route.fullPath" />
      </template>
    </RouterView>
  </div>

</template>

<style scoped>

</style>
