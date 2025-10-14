import { defineStore } from 'pinia'
import type { CreateAccountPayload } from '@/stores/authStore.ts'

export const useCreateAccountFormStore = defineStore('createAccountFormStore', {
  // id: 'createAccountFormStore',
  state: () => ({
    profile: {
      username: '',
      email: '',
      password: '',
      age: '',
      gender: '',
      relationship_status: '',
      terms_accepted: false,
    },
  }),

  getters: {
    getProfile: (state) => state.profile,
  },

  actions: {
    setProfile(value: Partial<CreateAccountPayload>) {
      this.profile = {
        ...this.profile,
        ...value,
      }
    },
    clearProfile() {
      this.$reset()
    },
  },
})
