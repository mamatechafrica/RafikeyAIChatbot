<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'

import DOMPurify from 'dompurify'

interface UserInputProps {
  isGenerating: boolean
  disabled: boolean
  displayBottom: boolean
}

const props = defineProps<UserInputProps>()
const textAreaRef = ref<HTMLTextAreaElement | null>(null)
const inputHasFocus = ref(false)
const userInput = ref('')

const emits = defineEmits<{
  (event: 'userInput', value: string, formatted: string): void
}>()

// check if the user input is empty
const hasText = computed(() => {
  return userInput.value.length > 0 && userInput.value.trim().length > 0
})

// adjust the textarea height
const adjustTextAreaHeight = (element: HTMLTextAreaElement) => {
  if (element.scrollHeight > element.clientHeight) {
    element.style.paddingBottom = '44px'
  }
  element.style.height = 'auto'
  element.style.height = `${element.scrollHeight}px`
}

// watch for  user input
watch(
  () => userInput.value,
  (newValue) => {
    nextTick(() => {
      adjustTextAreaHeight(textAreaRef.value as HTMLTextAreaElement)
    })
  },
)

// add focus to the text area
const addFocus = () => {
  if (inputHasFocus.value) {
    return
  } else {
    inputHasFocus.value = true
    textAreaRef.value?.focus()
  }
}

// format user input and sanitize for xxs
const formattedUserInput = computed(() => {
  let purifiedBreak = userInput.value.replace(/\n/g, '<br>')
  purifiedBreak = DOMPurify.sanitize(purifiedBreak, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['br'],
  })
  return purifiedBreak
})

const onTextAreaKeydown = (e: KeyboardEvent) => {
  //   If user presses enter and shift key at go
  if (e.shiftKey && e.key === 'Enter') {
    if (!hasText.value) {
      e.preventDefault()
      return
    } else {
      if (props.isGenerating) {
        e.preventDefault()
        return
      } else {
        emits('userInput', userInput.value, formattedUserInput.value)
        userInput.value = ''
        e.preventDefault()
        adjustTextAreaHeight(textAreaRef.value as HTMLTextAreaElement)
      }
    }
  }
  // if user press Enter key alone
  else if (e.key === 'Enter') {
    if (!hasText.value) {
      e.preventDefault()
      return
    } else {
      if (!props.isGenerating) {
        emits('userInput', userInput.value, formattedUserInput.value)
        userInput.value = ''
        e.preventDefault()
        adjustTextAreaHeight(textAreaRef.value as HTMLTextAreaElement)
      } else {
        e.preventDefault()
        return
      }
    }
  }

  //   if user press Backspace key with no input at all
  else if (e.key === 'Backspace' && !hasText.value) {
    e.preventDefault()
    return
  }
}

// If user press send button
const sendRequest = () => {
  if (!hasText.value || props.isGenerating) {
    return
  } else {
    emits('userInput', userInput.value, formattedUserInput.value)
    userInput.value = ''
    adjustTextAreaHeight(textAreaRef.value as HTMLTextAreaElement)
  }
}
</script>

<template>
  <div
    @click.stop="addFocus"
    :class="[inputHasFocus ? '' : '', props.displayBottom? 'bottom-0': '' ]"
    class="relative grid grid-cols-12   border-2 bg-link-water-50 dark:bg-lightgray shadow-lg rounded-full"
  >

    <div class="absolute col-span-1 left-3 pt-4">
      <span class="material-icons-outlined dark:text-white">attach_file</span>
      <span class="material-icons-outlined dark:text-white">bolt</span>
    </div>
    <div class="col-span-10 ms-16 w-full" id="text-area">
      <textarea
        class="px-4 pt-4 hover:cursor-text dark:text-white overflow-hidden w-full grow bg-transparent border-none focus:outline-none resize-none"
        placeholder="Messagee Rafikey..."
        v-model="userInput"
        ref="textAreaRef"
        @blur="inputHasFocus = false"
        @focus="inputHasFocus = true"
        @keydown="onTextAreaKeydown"
      >
      </textarea>
    </div>

    <div class="absolute col-span-1 bottom-0 flex justify-end items-end lg:pb-4 w-full">
      <button class="btn btn-sm btn-ghost normal-case hover:bg-transparent hover:border-none focus:outline-none">
        <span class="material-icons dark:text-white">mic</span>
      </button>

      <button
        v-if="hasText"
        class="btn btn-sm btn-ghost normal-case btn-circle"
        :disabled="props.isGenerating || !hasText"
        @click.prevent="sendRequest"
      >
        <span
          class="material-icons-outlined !text-xl rotate-"
          :class="[hasText && !props.isGenerating ? 'bg-casablanca-400 px-2 py-1 rounded-full' : '']"
        >
          arrow_upward
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
