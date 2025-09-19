<script setup lang="ts"></script>

<template>
  <div class="flex flex-col items-center">
    <div class="pb-4">
      <div class="flex justify-center">
        <img src="@/assets/images/video-game.png" alt="video-game-image" />
      </div>

      <div class="dark:bg-darkgray rounded-[12px] py-2 w-44 flex justify-center">
        <span class="text-greenTime text-extra-small">20.00s</span>
      </div>
    </div>
    <div
      class="lg:w-1/3 md:w-2/3 w-3/4 border-veryLightEight py-[27px] px-[33px] border-[1px] rounded-[14px]"
    >
      <div class="space-y-8">
        <div class="flex justify-center">
          <p class="font-bold text-[20px] dark:text-white">Question 1 of 10</p>
        </div>
        <div class="flex justify-center">
          <p class="font-bold text-[20px] dark:text-white">What does SRHR stand for?</p>
        </div>
        <div>
          <p class="text-center pb-2 dark:text-lightgrayOne text-extra-extra-small">
            Select one option
          </p>
          <div class="space-y-4">
            <div class="border-lightgrayThree flex justify-center p-3 border-[1px] rounded-[12px]">
              <p class="text-extra-small dark:text-white">Sexual Rights & Human Responsibility</p>
            </div>
            <div class="border-lightgrayThree flex justify-center p-3 border-[1px] rounded-[12px]">
              <p class="text-extra-small dark:text-white">Sexual Rights & Human Responsibility</p>
            </div>
            <div class="border-lightgrayThree flex justify-center p-3 border-[1px] rounded-[12px]">
              <p class="text-extra-small dark:text-white">Sexual Rights & Human Responsibility</p>
            </div>
            <div class="border-lightgrayThree flex justify-center p-3 border-[1px] rounded-[12px]">
              <p class="text-extra-small dark:text-white">Sexual Rights & Human Responsibility</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="pt-6">
      <button class="btn btn-sm text-extra-small shadow-none dark:text-white py-5 px-20  btn-ghost dark:bg-darkgray rounded-[12px]  border-casablanca-300 borer-[1px] ">
        <span>Skip</span>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
