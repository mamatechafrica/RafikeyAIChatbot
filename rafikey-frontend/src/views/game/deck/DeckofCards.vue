<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useNotificationStore } from '@/stores'

interface Card {
  id: number
  quiz: string
}

const cards = ref<Card[]>([
  { id: 1, quiz: 'Question 1' },
  { id: 2, quiz: 'Question 2' },
  { id: 3, quiz: 'Question 3' },
  { id: 4, quiz: 'Question 4' },
  { id: 5, quiz: 'Question 5' },
  { id: 6, quiz: 'Question 6' },
])

const startDrag = (event: DragEvent, item: Card) => {
  console.log('start drag', item)
  event.dataTransfer!.dropEffect = 'move'
  event.dataTransfer!.effectAllowed = 'move'
  event.dataTransfer!.setData('itemId', item.id.toString())
}

const activeTrueButton = ref(false)
const activeFalseButton = ref(false)
const activeSkipButton = ref(false)


const onDropLeft = (event: DragEvent) => {
  console.log('drop', event)
  cards.value.shift()
  // const itemId = event.dataTransfer!.getData('itemId')
  // console.log("dragging item id", itemId)
  activeFalseButton.value = true
  // const cardItem =   cards.value.find(card => card.id.toString()  === itemId)
}

const onDropRight = (event: DragEvent) => {
  console.log('drop', event)
  cards.value.shift()
  activeTrueButton.value = true
}

const onDropSkip = (event: DragEvent) => {
  console.log('drop', event)
  activeSkipButton.value = true
  cards.value.shift()
}

watch(
  () => activeFalseButton.value,
  (val: boolean) => {
    if (val) {
      setTimeout(() => {
        activeFalseButton.value = false
      }, 500)
    }
  },
)

watch(
  () => activeTrueButton.value,
  (val: boolean) => {
    if (val) {
      setTimeout(() => {
        activeTrueButton.value = false
      }, 500)
    }
  },
)


const notificationStore = useNotificationStore()
watch(
  () => activeSkipButton.value,
  (val: boolean) => {
    if (val) {
      notificationStore.addNotification('You have skipped the question', 'info')
      setTimeout(() => {
        activeSkipButton.value = false
      }, 500)
    }
  },
)

const cardBgColors = [
  {
    bgOne: '#9643FFB2',
    bgTwo: '#F2B04D99',
  },
  {
    bgOne: '#00F2FF66',
    bgTwo: '#F2B04D80',
  },
  {
    bgOne: '#FF0F7B80',
    bgTwo: '#F2B04D80',
  },
]

const stackStyle = (i: number) => {
  const rand = Math.random() * 10
  const bgIndex = Math.floor(rand % cardBgColors.length)
  const rotate = i * 3
  const gradient = `linear-gradient(135deg, ${cardBgColors[bgIndex]?.bgOne}, ${cardBgColors[bgIndex]?.bgTwo})` // replace or randomize
  return {
    transform: ` rotate(${rotate}deg) `,
    background: gradient,
    zIndex: cards.value.length - i,
  }
}

const totalQuiz = ref<Number>(0)
onMounted(()=>{
  totalQuiz.value =  cards.value.length

})
</script>

<template>
  <div class="relative">
    <div class="flex flex-col items-center space-y-8">
      <div class="space-y-8 flex flex-col items-center">
        <div class="space-y-4">
          <p class="text-center dark:text-white">Drag the cards to either the true or false side</p>
          <p class="text-center dark:text-white">Card {{cards[0].quiz || ''}} of {{totalQuiz}}</p>
        </div>
        <div class="dark:bg-darkgray rounded-[12px] py-2 w-44 flex justify-center">
          <span class="text-greenTime text-extra-small">20.00s</span>
        </div>
      </div>

      <div class="relative w-2/5 h-[354px]">
        <div
          draggable="true"
          @dragstart="startDrag($event, card)"
          v-for="(card, index) in cards.slice(0, 3)"
          :key="card.id"
          :style="stackStyle(index)"
          class="absolute inset-0 border border-none rounded-lg shadow-md flex items-center justify-center"
        >
          {{ card.quiz }}
        </div>
      </div>

<!--Feedback for right and wrong answers-->
      <div class="text-coral-red-600 text-center ">
        <p>Opps! you got it wrong</p>
        <p>You can get pregnant the first time you have sex</p>
      </div>
    </div>
    <!--    drop zone-->
    <div
      @drop="onDropLeft($event)"
      @dragover.prevent
      @dragenter.prevent
      class="z-999 absolute top-[60%] left-0 -translate-y-1/2 rounded-[15px] px-6"
      :class="[activeFalseButton ? 'dark:bg-coral-red-600 z-50' : 'dark:bg-lightgrayThree']"
    >
      <span class="dark:text-white text-[20px]">False</span>
    </div>

    <!--    drop zone-->
    <div
      @drop="onDropRight($event)"
      @dragover.prevent
      @dragenter.prevent
      :class="[activeTrueButton ? 'dark:bg-greenButtonGame z-50' : 'dark:bg-lightgrayThree']"
      class="rounded-[15px] px-6 absolute top-[60%] -translate-y-1/2 right-0"
    >
      <span class="dark:text-white text-[20px]">True</span>
    </div>

    <div
      @drop="onDropSkip($event)"
      @dragover.prevent
      @dragenter.prevent

      class="fixed bottom-0 left-1/2 -translate-x-1/2 mb-10">
      <button
        :class="[activeSkipButton ? 'dark:bg-button-light border-none' : 'dark:bg-darkgray border-casablanca-300 borer-[1px] ']"
        class="btn btn-sm text-extra-small shadow-none dark:text-white py-5 rounded-[12px]  px-20  btn-ghost  ">
        <span>Skip</span>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
