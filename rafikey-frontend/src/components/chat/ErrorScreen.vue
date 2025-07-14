<script setup lang="ts">
const emits = defineEmits<{
  (event: 'regenerateResponse'): void
}>()
const refreshPage = () => {
emits('regenerateResponse')
}
</script>

<template>
  <div class="">
    <div class="border border-rose-500 bg-rose-200 rounded-xl">
      <div class="p-4 space-y-3">
        <div class="flex items-center gap-2">
          <div>
            <span class="material-icons-outlined text-rose-400">info</span>
          </div>
          <div>
            <span class="lg:text-lg text-sm">Network Issue</span>
          </div>
        </div>
        <div class="flex justify-between">
          <p class="lg:text-lg text-sm">Hmm... it looks like you're offline. Check your network connection and refresh to continue</p>
          <button class="btn btn-sm bg-black shadow-none  rounded-xl p-6 " v-on:click="refreshPage">
            <span class="text-white lg:text-lg text-sm">Refresh chat</span>
          </button>
        </div>
      </div>

    </div>

    <div class="fixed bottom-32  left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">

        <button class="bg-casablanca-300 p-4 rounded-xl flex">
          <span class="material-icons-outlined lg:text-lg text-sm">loop</span>
          <span class="lg:text-lg text-sm">Regenerate Response</span>
        </button>


    </div>

  </div>


</template>

<style scoped>

</style>
