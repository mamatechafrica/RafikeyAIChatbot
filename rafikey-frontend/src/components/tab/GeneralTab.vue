<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRafikeyChatbotStore } from '@/stores/rafikeyChatbotStore'


const chatbotStore = useRafikeyChatbotStore()

const isNotificationEnabled = ref(chatbotStore.getOtherSettings.notificationsEnabled || false)
watch(()=> isNotificationEnabled.value, () =>{
  chatbotStore.setOtherSettings({
    key: 'notificationsEnabled',
    value: isNotificationEnabled.value
  })

})
</script>

<template>
  <div class="px-[16px]  ">
    <div  class="py-4 flex items-center justify-between">
      <p class="dark:text-white">Notifications</p>
      <div>
        <div class="flex gap-16">
          <span class="dark:text-white">Off</span>
          <span class="dark:text-white">On</span>

        </div>
        <label
          for="Toggle1"
          class="inline-flex items-center space-x-4 cursor-pointer dark:text-gray-800"
        >
          <span class="relative">
            <input id="Toggle1" type="checkbox" class=" hidden peer" v-model="isNotificationEnabled" />
            <div
              class="w-28 h-6 rounded-full shadow  bg-veryLight dark:bg-veryLight peer-checked:bg-veryLight"
            ></div>
            <div
              class="absolute  transition-all inset-y-0 left-0 w-8 h-6 m-0 rounded-full shadow peer-checked:right-0 peer-checked:bg-bg-veryLight peer-checked:left-auto bg-casablanca-300"
            ></div>
          </span>
        </label>

      </div>
    </div>
    <div class="border-b-[1px] dark:border-veryLightFive border-veryLightFour "></div>
    <div class="py-6   flex justify-between">
      <div>
        <p class="dark:text-white">Chat History</p>
      </div>
      <div class="flex gap-4 flex-col items-end ">
        <div class="cursor-pointer w-fit border dark:border-white border-darkgray rounded-2xl px-3 py-1">
          <span class="dark:text-white">View Archived Chats</span>
        </div>
        <div class="cursor-pointer w-fit border   dark:border-white border-darkgray   rounded-2xl px-3 py-1">
          <span class="dark:text-white">Archive All Chats</span>
        </div>
        <div class="cursor-pointer w-fit border border-red-700 rounded-2xl px-3 py-1">
          <span class="text-red-700">Clear All Chats</span>
        </div>
      </div>
    </div>
    <div class="border-b-[1px] dark:border-veryLightFive border-veryLightFour "></div>
  </div>
</template>

<style scoped></style>
