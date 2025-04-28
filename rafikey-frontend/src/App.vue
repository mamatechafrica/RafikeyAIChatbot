<script setup lang="ts">
import  {onMounted} from "vue";

onMounted(() => {
  document.documentElement.setAttribute('data-theme', 'light')
})
</script>

<template>

    <RouterView  #default="{ Component, route}">
      <template v-if="Component">
        <component :is="Component" :key="route.fullPath"/>
      </template>
    </RouterView>



</template>

<style scoped>

</style>
