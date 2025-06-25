<script setup lang="ts">

</script>

<template>
<div>
  <RouterView #default="{Component, route}">
    <template v-if="Component">
      <component :is="Component" :key="route.fullPath"/>
    </template>
  </RouterView>
</div>

</template>

<style scoped>

</style>
