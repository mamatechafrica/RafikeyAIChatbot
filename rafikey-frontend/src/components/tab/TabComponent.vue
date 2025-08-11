<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

export interface Tabs {
  id: number;
  name: string;
}

const tabs = [
  {
    id: 1,
    name: 'General'
  },
  {
    id: 2,
    name: 'Personalisation'
  },
  {
    id: 3,
    name: 'Security'
  }
] as Tabs []

const activeTab = ref(1)
const emits = defineEmits<{
  (event: 'tabChange', tab: Tabs): void;
}>();



const tabHandler = (tab:Tabs) => {
  activeTab.value = tab.id
  emits('tabChange', tab)
}


</script>

<template>
  <div

    class="rounded-lg w-11/12  pt-5 mx-auto  ">
    <div class="border-b border-veryLightThree   dark:border-stone-600 md:w-3/4 md:mx-auto ">
      <nav
        class="cursor-pointer flex w-full" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
        <div
          @click="tabHandler(tab)"
          v-for="tab in tabs" :key="tab.id"
          :class="[activeTab === tab.id? 'border-b-[1px] dark:bg-veryLightSix bg-veryLightOne  rounded-t-[10px]  border-casablanca-300 transition-all duration-300 ': '']"
          class="w-full py-3 items-center text-sm whitespace-nowrap"
          id="basic-tabs-item-1"
          aria-selected="true"
          data-hs-tab="#basic-tabs-1"
          aria-controls="basic-tabs-1"
          role="tab"
        >
          <span class="dark:text-white text-extra-small flex justify-center"> {{tab.name}}</span>

        </div>


      </nav>
    </div>
  </div>
</template>

<style scoped></style>
