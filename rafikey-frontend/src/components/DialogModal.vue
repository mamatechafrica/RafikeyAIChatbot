<script lang="ts" setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useRafikeyChatbotStore } from '@/stores'

interface DialogModalProps {
  isOpen: boolean
  maxWidth?: string
}

const chatbotStore =  useRafikeyChatbotStore()

// const props = defineProps<DialogModalProps>();

const props = withDefaults(defineProps<DialogModalProps>(), {
  isOpen: false,
  maxWidth: 'max-w-md'
})

const emits = defineEmits<{
  (event: 'closeModal'): void
}>()




const closeModal = () => {
  console.log('close modal')
  console.log(chatbotStore.isAnonymous)

  emits('closeModal')
}
</script>

<template>
  <TransitionRoot :show="props.isOpen" appear as="template">
    <Dialog as="div" class="relative z-50 " @close="closeModal">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-20  backdrop-blur-[4px]" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              :class="[props.maxWidth, chatbotStore.isAnonymous? '': 'dark:bg-lightgray ']"
            >
              <DialogTitle as="h3">
                <slot name="title">  </slot>
              </DialogTitle>
              <div class="mt-2">
                <slot name="body">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur amet labore
                  voluptatem accusamus distinctio, ab quia dicta, ut fugiat doloribus reprehenderit,
                  quod voluptates.
                </slot>
              </div>

              <div class="mt-4">
                <slot name="footer">
                  <!--                  <button-->
                  <!--                      class="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"-->
                  <!--                      type="button"-->
                  <!--                      @click="closeModal"-->
                  <!--                  >-->
                  <!--                  </button>-->
                </slot>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style scoped></style>
