<script setup lang="ts">

</script>

<template>
  <div>
    <div class="h-screen w-full hidden lg:block">
      <div class="w-10/12 grid grid-cols-2 mx-auto">
        <!--      left-side-->
        <div class="col-span-1">
          <div>
            <img src="@/assets/images/rafikey-icon.png" alt="rafikey-icon" />
          </div>
          <div class="flex flex-col space-y-12">
            <div
              class="flex  cursor-pointer text-gray-1000 justify-start w-fit hover:bg-transparent border-none hover:border-none btn btn-sm btn-ghost shadow-none">
              <span class="material-icons-outlined">chevron_left</span>
              <span class="text-lg font-light">Back to login</span>
            </div>
            <div class="flex flex-col space-y-6">
              <h2 class="lg:text-4xl text-2xl font-semibold">Forgot your password?</h2>
              <p class="lg:text-xl text-lg text-gray-700">Don't worry, happens to all of us. Enter
                your email bellow to recover your password</p>
            </div>
            <!--          forgot password form-->
            <div>
              <form class="flex flex-col space-y-12 w-10/12">
                <div class="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    class="w-full border-2 border-gray-500 rounded-2xl p-4 lg:text-lg text-sm"
                    placeholder="johndoe@gmail.com"
                  />
                  <label
                    class="absolute left-1 -top-3 text-slate-600 px-1 lg:text-lg text-sm bg-white"
                    for="email">
                    Email address
                  </label>
                </div>
                <div
                  class="btn btn-sm bg-casablanca-400 hover:bg-casablanca-300 text-lg rounded-2xl py-6">
                  <span>Submit</span>
                </div>
              </form>
            </div>
          </div>
        </div>
        <!--      right--side-->
        <div class="col-span-1 flex items-center justify-center h-screen">
          <img src="@/assets/images/forgot-password.png" alt="forgot-password-image" />
        </div>
      </div>
    </div>

    <!--    Small screens-->
    <div class="lg:hidden block h-screen w-full">

      <div class="flex justify-center">
        <img src="@/assets/images/rafikey-key.png" alt="rafikey-logo" />
      </div>
      <div class="flex flex-col px-20 space-y-8">
        <div class="flex flex-col items-center space-y-4">
          <h2 class="text-2xl font-semibold">Forgot Password</h2>
          <div class="space-y-2">
            <p class="text-lg text-gray-700 text-center">Don't worry. Happens to all of us. </p>
            <p class="text-lg text-gray-700 text-center">Enter your Email below to recover your password</p>
          </div>
        </div>
        <div class="border-b border-gray-400 w-full"></div>
        <form class="space-y-8">

          <div class="space-y-3">
            <label for="email" class="text-black text-lg ">Email</label>
            <input id="email"
                   type="email"
                   class=" w-full border-2 border-gray-500 rounded-2xl p-4 text-lg"
                   required
                   placeholder="Enter your email"
            />
          </div>
        </form>
        <div class="border-b border-gray-400 w-full pt-6"></div>

        <div class="w-3/4 mx-auto flex justify-between items-center pt-6">
          <button
            class="btn w-full btn-sm bg-casablanca-300 hover:bg-casablanca-400 text-lg rounded-2xl py-6">
            Submit
          </button>
        </div>


      </div>
    </div>
  </div>

</template>

<style scoped>

</style>
