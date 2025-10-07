<script setup lang="ts">
import { usePWA } from  '@/composables/usePWA.ts'
import  {ref, watch} from "vue";
import DialogModal from '@/components/DialogModal.vue'
import { useNotificationStore } from '@/stores'
const {needRefresh, offlineReady,   updateSW} = usePWA()


const notificationStore = useNotificationStore()
const isShowDialog = ref(false)

watch(offlineReady, (ready) => {
  if (ready) {
    console.log("Offline is ready")
    notificationStore.addNotification('App ready to work offline', 'info')
  }
})

watch(needRefresh, (value)=>{
  if(value){
    isShowDialog.value = true
  }
})


const dontUpdateAppHandler = () =>{
  console.log("Don't update handler called")
  needRefresh.value = false
  updateSW(false)
  isShowDialog.value = false
}

const isLoadingUpdates = ref(false)

const updateAppHandler = () =>{
  updateSW(true)
  isLoadingUpdates.value = true

  setTimeout(()=>{
    isShowDialog.value = false
    window.location.reload()
  }, 2000)
}


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
