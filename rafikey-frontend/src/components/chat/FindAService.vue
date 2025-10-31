<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
  bgColor: string
}>()
const emits = defineEmits<{
  (event: 'closeGameButton'): void
}>()

const closePLayButton = () => {
  emits('closeGameButton')
}

const goToPlayPage = () => {
  router.push({
    name: 'welcome-page-quiz',
  })
}

const goToServiceFInder = () =>{
  window.location.href = 'https://askrafikey.com/service-finder'
}
</script>

<template>
  <div
    class="dark:bg-darkgray bg-white space-y-2 border-[1px] px-4 py-8 pb-[20px] rounded-[20px] dark:border-lightgrayThree"
  >
      <div class="">
        <p class="dark:text-white text-small">Find a service</p>
      </div>
    <div class="flex justify-center">
      <div
        :class="props.bgColor"
        class=" rounded-full flex justify-center items-center"
      >
        <span class="material-icons-outlined">health_and_safety</span>
      </div>
    </div>
    <div class="space-y-2">
      <div>
        <p class="dark:text-white text-extra-small">Find facilities of your preference</p>
      </div>
      <div class="w-full">
        <button
          @click="goToServiceFInder "
          class="btn btn-sm btn-ghost rounded-lg hover:scale-105 transition-all duration-300 ease-in-out w-full bg-casablanca-300"
        >
          <span class="text-extra-small">Find service</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
