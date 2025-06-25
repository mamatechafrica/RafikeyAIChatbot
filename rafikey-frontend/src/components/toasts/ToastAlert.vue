<script lang="ts" setup>
import {computed, ref} from "vue";
import {useNotificationStore} from "@/stores/";

const notificationsStore = useNotificationStore();

interface NotificationItem {
  message: string;
  type: "success" | "error" | "warning" | "info";
  id: string;
  isShown: boolean;
}

const props = defineProps<NotificationItem>();

const alertBgColor = computed(() => {
  if (props.type === "success") {
    return "bg-green-100";
  } else if (props.type === "error") {
    return "bg-red-100";
  } else if (props.type === "warning") {
    return "bg-yellow-100";
  } else if (props.type === "info") {
    return "bg-blue-100";
  } else {
    return "bg-gray-100";
  }
});

const alertBgDashColor = computed(() => {
  if (props.type === "success") {
    return "bg-green-500";
  } else if (props.type === "error") {
    return "bg-red-500";
  } else if (props.type === "warning") {
    return "bg-yellow-500";
  } else if (props.type === "info") {
    return "bg-blue-500";
  } else {
    return "bg-gray-500";
  }
});

const alertTextColor = computed(() => {
  if (props.type === "success") {
    return "text-green-500";
  } else if (props.type === "error") {
    return "text-red-500";
  } else if (props.type === "warning") {
    return "text-yellow-500";
  } else if (props.type === "info") {
    return "text-blue-500";
  } else {
    return "text-gray-500";
  }
});

const iconName = computed(() => {
  if (props.type === "success") {
    return "check_circle";
  } else if (props.type === "error") {
    return "error";
  } else if (props.type === "warning") {
    return "warning";
  } else if (props.type === "info") {
    return "info";
  } else {
    return "info";
  }
});

const isToastShown = ref(props.isShown);

const onCloseClick = () => {
  isToastShown.value = false;
  notificationsStore.removeNotification(props.id);
};

</script>

<template>
  <div
    :class="[alertTextColor, alertBgColor, !(isToastShown || isShown) ? 'hiding': '']"
    class="grid grid-cols-12 flex-1 w-full relative rounded-md overflow-hidden drop-shadow-lg py-5 transition duration-300 ease-in-out"
    tabindex="0">
    <div :class="alertBgDashColor" class="absolute inset-y-0 left-0 w-1"></div>
    <div class="col-span-2 flex items-center justify-center">
      <i :class="alertTextColor" class="material-icons-round text-3xl">
        {{ iconName }}
      </i>
    </div>
    <div class="flex flex-row flex-wrap text-start items-center col-span-8">
      <div class="w-full inline max-h-14 md:max-h-18 lg:max-h-20 overflow-y-auto">
        <p :class="alertTextColor" class="text-sm font-medium whitespace-normal break-words w-full">
          {{ message }}
        </p>
      </div>
    </div>
    <div class="col-span-2 flex items-center justify-center px-1">
      <button class="btn btn-ghost btn-sm btn-circle" @click="onCloseClick">
        <i :class="alertTextColor" class="material-icons-round text-sm">
          close
        </i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.hiding {
  animation: slide-out-up 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
}

@keyframes slide-out-up {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-100%);
    opacity: 0;
  }
}
</style>
