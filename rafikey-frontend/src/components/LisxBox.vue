<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'


interface ListItem {
  name: string
  id: number
}
const props = defineProps<{
  listItems: ListItem[]
  placeHolder: string
}>()

const selectedListItem = ref<ListItem>()

const emits = defineEmits<{
  (event: 'selectedListItem', value: ListItem): void
}>()

watch(()=>
  selectedListItem.value
, (newValue) => {
  emits('selectedListItem', newValue as ListItem )
})
</script>

<template>
  <div class="border-2 border-slate-300 rounded-lg  w-full">
    <Listbox v-model="selectedListItem">
      <div class="relative mt-1">
        <ListboxButton
          class="relative w-full cursor-default rounded-lg bg-transparent py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-casablanca-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-casablanca-300 sm:text-sm"
        >
          <span v-if="selectedListItem" class="block truncate text-gray-950 dark:text-stone-400  text-lg">{{ selectedListItem.name}}</span>
          <span v-else class="block truncate text-gray-400 text-lg ">{{props.placeHolder}}</span>

          <span
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
          >
            <ChevronUpDownIcon
              class="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </ListboxButton>

        <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions
            class="absolute mt-1 max-h-60 z-40 w-full overflow-auto rounded-md bg-white dark:bg-darkgray py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
          >
            <ListboxOption
              v-slot="{ active, selected }"
              v-for="item in props.listItems"
              :key="item.name"
              :value="item"
              as="template"
            >
              <li
                :class="[
                  active ? 'bg-amber-100 text-casablanca-900 text-lg' : 'text-gray-900 dark:text-stone-400   text-lg',
                  'relative cursor-default select-none py-2 pl-10 pr-4',
                ]"
              >
                <span
                  :class="[
                    selected ? 'font-medium' : 'font-normal',
                    'block truncate',
                  ]"
                >{{ item.name }}</span
                >
                <span
                  v-if="selected"
                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-casablanca-600"
                >
                  <CheckIcon class="h-5 w-5" aria-hidden="true" />
                </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
  </div>
</template>

<style scoped>

</style>


