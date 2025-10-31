<script setup lang="ts">
import { useAuthStore, useRafikeyChatbotStore } from '@/stores'
import { onMounted, ref } from 'vue'
import moment from 'moment'

interface UserProfile {
  id: number
  username: string
  email: string
  age: string
  gender: string
  relationship_status: string
  terms_accepted: boolean
  disabled: boolean
  created_at: string
}
const authStore = useAuthStore()
const isError = ref('')
const isAppLoading = ref(false)
const userProfile = ref<UserProfile | null>(null)
onMounted(() => {
  isAppLoading.value = true
  authStore
    .getUserProfile()
    .then((resp) => {
      if (resp.result === 'ok') {
        isAppLoading.value = false
        userProfile.value = resp.data
      } else {
        isAppLoading.value = false
        isError.value = resp.data
      }
    })
    .catch((err) => {
      isError.value = 'Something went wrong, please try again later.'
      isAppLoading.value = false
    })
})

const chatbotStore = useRafikeyChatbotStore()

const relationshipStatus = () => {
  if (userProfile.value) {
    if (userProfile.value.relationship_status === 'No') {
      return 'Single'
    } else if (userProfile.value.relationship_status === 'Yes') {
      return 'In a relationship'
    } else {
      return 'Prefer not to say'
    }
  }
}

const openEditDialog = ref(false)
const editProfileDetail = ref()
const editAge = () => {
  editProfileDetail.value = 'Age'
  openEditDialog.value = true
}

const editGender = () => {
  editProfileDetail.value = 'Gender'
  openEditDialog.value = true
}

const editRelationshipStatus = () => {
  editProfileDetail.value = 'Relationship Status'
  openEditDialog.value = true
}

const ageRange = [
  {
    name: '10-14',
    id: 1,
  },
  {
    name: '15-19',
    id: 2,
  },
  {
    name: '20-24',
    id: 3,
  },
  {
    name: '25-29',
    id: 4,
  },
] as Buttons[]

const getToKnowYouData = reactive({
  age: '',
  gender: '',
  relationship_status: '',
})

const selectedRadio = (value: Buttons) => {
  if (range(1, 5).includes(value.id)) {
    getToKnowYouData.age = value.name
  } else {
    if (range(5, 9).includes(value.id)) {
      getToKnowYouData.gender = value.name
    } else {
      getToKnowYouData.relationship_status = value.name
    }
  }
}

const loadingProfileUpdate = ref(false)
const notificationStore = useNotificationStore()
const updateProfileHandler = () => {
  console.log('Edit---', editProfileDetail.value)
  loadingProfileUpdate.value = true
  authStore
    .updateProfile(getToKnowYouData)
    .then((resp) => {
      if (resp?.result === 'ok') {
        loadingProfileUpdate.value = false
        openEditDialog.value = false
        notificationStore.addNotification(
          `${editProfileDetail.value} successfully updated`,
          'success',
        )
        setTimeout(()=>{
          fetchUserData()
        }, 2000)


        // refresh user profile data

      } else {
        loadingProfileUpdate.value = false
        loadingProfileUpdate.value = false
        notificationStore.addNotification(
          `Failed to update ${editProfileDetail.value} please try again`,
          'error',
        )
      }
    })
    .catch((err) => {
      loadingProfileUpdate.value = false
      notificationStore.addNotification(`An error occurred, please try again later`, 'error')
    })
}

const everyThingOk = computed(() => {
  return getToKnowYouData.age || getToKnowYouData.gender || getToKnowYouData.relationship_status
})
</script>

<template>
  <div
    class="lg:pt-8"
    :class="[chatbotStore.collapseSidebarLarge ? 'mx-auto xl:w-3/4 w-full ' : 'w-full']"
  >
    <div class="space-y-16 dark:bg-darkgray lg:p-16 p-10 rounded-[29px] bg-link-water-50">
      <div class="border-b pb-4 border-dashed border-veryLightFour dark:border-slate-600">
        <p class="dark:text-white text-extra-large">Profile</p>
        <span class="text-stone-400">View all your profile data here</span>
      </div>
      <div v-if="userProfile" class="grid grid-cols-3 lg:gap-8 gap-6">
        <div
          :class="[
            chatbotStore.collapseSidebarLarge
              ? 'lg:col-span-1   col-span-3 '
              : 'col-span-3 xl:col-span-1',
          ]"
          class="border-[1px] border-veryLightFour dark:border-veryLightFive lg:p-8 p-6 rounded-[20px]"
        >
          <div class="flex lg:flex-col w-full flex-row gap-0 items-center justify-start">
            <div class="flex lg:hidden">
              <img src="@/assets/images/profile-image.png" alt="profile-image" />
            </div>
            <div class="flex flex-col items-center">
              <p class="dark:text-white lg:text-extra-extra-large-1 text-extra-large text-center">
                {{ userProfile.username }}
              </p>
              <span class="text-stone-400 text-extra-small text-center">{{
                userProfile.email
              }}</span>
            </div>
            <div class="lg:flex hidden">
              <img src="@/assets/images/profile-image.png" alt="profile-image" />
            </div>
          </div>
          <!--          right side-->
        </div>
        <div
          :class="[
            chatbotStore.collapseSidebarLarge
              ? 'lg:col-span-2 col-span-3 '
              : 'col-span-3 xl:col-span-2',
          ]"
          class="lg:space-y-4 space-y-2 border-[1px] border-veryLightFour dark:border-veryLightFive lg:p-8 p-6 rounded-[20px]"
        >
          <div>
            <p class="dark:text-white lg:text-extra-large text-[18px]">Bio & Other details</p>
          </div>

          <div class="grid grid-cols-2 gap-2 lg:gap-0">
            <!--            Left side-->
            <div class="lg:space-y-6 space-y-2 lg:col-span-1 col-span-2">
              <div>
                <p class="text-stone-400">Username</p>
                <span class="dark:text-white">{{ userProfile.username }}</span>
              </div>
              <div>
                <p class="text-stone-400">Email</p>
                <span class="dark:text-white">{{ userProfile.email }}</span>
              </div>
              <div>
                <p class="text-stone-400">Account creation date</p>
                <span class="dark:text-white">{{
                  moment(userProfile.created_at).format('DD-MMMM-YYYY')
                }}</span>
              </div>
            </div>
            <!--              right side-->
            <div class="lg:space-y-6 space-y-2 lg:col-span-1 col-span-2">
              <div>
                <p class="text-stone-400">Age group</p>
                <span class="dark:text-white">{{ userProfile.age }}</span>
              </div>
              <div>
                <p class="text-stone-400">Gender</p>
                <span class="dark:text-white">{{ userProfile.gender }}</span>
              </div>
              <div>
                <p class="text-stone-400">Relationship status</p>
                <span class="dark:text-white">{{ relationshipStatus() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="isAppLoading">
        <p class="dark:text-white text-center">Loading...</p>
      </div>
      <div v-if="isError" class="flex space-y-2 justify-center items-center flex-col">
        <img src="@/assets/images/no-data.svg" alt="no-image" class="md:w-28 w-20" />
        <p class="dark:text-white text-center">{{ isError }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
