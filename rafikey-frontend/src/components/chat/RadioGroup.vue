<script lang="ts" setup>
import {ref, watch} from 'vue'
import {RadioGroup, RadioGroupDescription, RadioGroupLabel, RadioGroupOption,} from '@headlessui/vue'


export interface RadioGroup {
  name: string
  id: number
}

interface RadioProps {
  radioType: RadioGroup []
}

const props = defineProps<RadioProps>()
const selected = ref()

const emits = defineEmits<{
  (event: 'change', value: RadioGroup): void;
}>();

watch(() => selected.value, (newVal) => {
  emits('change', newVal)
})
</script>


<template>
  <div class="w-full ">
    <div class="w-full">
      <RadioGroup v-model="selected">
        <div class="gap-4 flex justify-center flex-wrap">
          <RadioGroupOption
            v-for="rad in props.radioType"
            :key="rad.name"
            v-slot="{ active, checked }"
            :value="rad"
            as="template"
          >
            <div
              :class="[
                active
                  ? ''
                  : '',
                checked ? 'bg-casablanca-600/75' : ' border-button-light dark:bg-transparent bg-link-water-50 border ',
              ]"
              class="relative flex cursor-pointer rounded-xl px-10  py-1  focus:outline-none"
            >
              <div class="flex w-full  items-center justify-between">
                <div class="flex items-center">
                  <div class="text-sm">
                    <div class="flex flex-row  gap-3 items-center">
                      <RadioGroupDescription
                        :class="checked ? 'text-sky-100' : 'text-gray-500'"
                        as="span"
                        class="col-span-1"
                      >
                        <p class="text-small text-nowrap" :class="[checked? 'text-white': 'text-black dark:text-white']">{{ rad.name }}</p>

                      </RadioGroupDescription>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RadioGroupOption>
        </div>
      </RadioGroup>
    </div>
  </div>
</template>

