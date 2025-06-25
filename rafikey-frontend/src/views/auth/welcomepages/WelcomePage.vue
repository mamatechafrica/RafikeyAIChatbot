<script setup lang="ts">
import LoadingPage_1 from '@/views/auth/welcomepages/LoadingPage_1.vue'
import LoadingPage_2 from '@/views/auth/welcomepages/LoadingPage_2.vue'
import LoadingPage_3 from '@/views/auth/welcomepages/LoadingPage_3.vue'
import LoadingPage_4 from '@/views/auth/welcomepages/LoadingPage_4.vue'
import { useRouter } from 'vue-router'
import { shallowRef, ref } from 'vue'

const router = useRouter()
const delayTime = 3000

const pages = [
  {
    component: LoadingPage_1,
    delay: delayTime,
  },
  {
    component: LoadingPage_2,
    delay: delayTime,
  },
  // {
  //   component: LoadingPage_3,
  //   delay: delayTime,
  // },
  {
    component: LoadingPage_4,
    delay: delayTime,
  },
]

const currentPageIndex = ref(0)
const currentPage = shallowRef(pages[currentPageIndex.value].component)

// displaying the welcome pages before the signup pages
const displayPages = () => {
  // console.log('Here********', currentPage.value)
  if (currentPageIndex.value < pages.length) {

    setTimeout(() => {
      currentPageIndex.value++
      if(currentPageIndex.value < pages.length){
        currentPage.value = pages[currentPageIndex.value].component
        displayPages()
      }
   else {
    console.log('Here********')
    router.push({
      name: 'set-profile',
    })
  }
  }, pages[currentPageIndex.value].delay)
}
}
// calling the displayPages function recursively until all pages are displayed
displayPages()
</script>

<template>
  <component :is="currentPage" :key="currentPageIndex" />
</template>

<style scoped></style>
