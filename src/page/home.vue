<template>
  <div class="p-5 min-h-screen bg-slate-100">
    <div v-if="allRoute.length">
      <div
        class="p-3 bg-white rounded-md shadow text-sm mb-3 w-full"
        v-for="(item, i) in allRoute"
        :key="i"
      >
        <router-link :to="item.path">
          <p class="font-medium">{{ item.name }}</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
const router = useRouter();
const allRoute = ref([]);
const getRoute = () => {
  let listRoute = router.options.routes[0].children;
  allRoute.value = listRoute.filter((el) => el.path);
};
onMounted(() => {
  getRoute();
});
</script>
