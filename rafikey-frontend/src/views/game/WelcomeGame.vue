<script setup lang="ts">

import { useRouter } from 'vue-router'

const router = useRouter();

const startGame = () =>{
router.push({
  name: 'game-page'
})
}
</script>

<template>
  <div>
      <div class="flex flex-col items-center space-y-24 pt-10">
        <div class="flex flex-col items-center">
          <p class="dark:text-white text-extra-extra-large-1">RAFIKEY</p>
          <P class="dark:text-white text-extra-extra-large-1">Play and Learn</P>
        </div>
        <div class="relative">
          <div
            class="flex flex-col dark:bg-darkgray space-y-4 items-center border-[1px] w-[419px] dark:border-veryLightEight rounded-[14px] py-[27px] px-[33px]"
          >
            <div class="flex flex-col space-y-5 items-center">
              <p class="dark:text-white text-[20px]">Trivia</p>
              <p class="dark:text-white text-[20px]">Test your knowledge and learn</p>
            </div>
            <div class="w-full flex justify-center">
              <button
                @click="startGame"
                class="btn btn-sm py-4 px-10 rounded-[12px] bg-casablanca-300 shadow-none border-none"
              >
                <span class="text-extra-small">Start Game</span>
              </button>
            </div>
          </div>
          <div class="absolute -top-14 -left-10">
            <img src="@/assets/images/video-game.png" alt="video-game-image"/>
          </div>
        </div>
        <div class="w-2/5 pt-10">
          <p class="text-center dark:text-white text-small">Explore fun and interactive games that test your knowledge, challenge your skills and help you learn in exciting new ways.</p>
        </div>
      </div>
    </div>

</template>

<style scoped></style>
