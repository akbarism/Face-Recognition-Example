<template>
  <div class="p-3 min-h-screen bg-slate-100">
    <button
      class="p-3 text-sm font-medium rounded-lg bg-blue-500 text-white active:bg-blue-600 mb-3"
      @click="isValidLocation"
    >
      Check Location
    </button>
    <Icon
      v-if="vm.loading"
      icon="mdi:circle"
      height="15"
      class="animate-ping"
    />
    <div
      v-if="vm.isResult && !vm.loading"
      :class="`p-3 flex items-center rounded-lg border mb-5 ${
        vm.type == 'success'
          ? 'bg-blue-50 border-blue-500'
          : 'bg-red-50 border-red-500'
      }`"
    >
      <Icon
        :icon="
          vm.type == 'success'
            ? 'heroicons:check-circle-20-solid'
            : 'heroicons:x-circle-20-solid'
        "
        :class="` ${
          vm.type == 'success' ? 'text-blue-500' : 'text-red-500'
        } mr-2`"
        height="20"
      />
      <p
        :class="`text-sm font-medium ${
          vm.type == 'success' ? 'text-blue-500' : 'text-red-500'
        }`"
      >
        {{ vm.text }}
      </p>
    </div>
    <p>
      {{
        day(vm.updated_location)
          .locale("id")
          .format("dddd, DD MMMM YYYY | HH:mm:ss")
      }}
    </p>
    <pre lang="json">{{
      JSON.stringify(
        {
          latitude: vm.current.latitude,
          longitude: vm.current.longitude,
          distance: vm.distance,
        },
        null,
        2,
      )
    }}</pre>
  </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import day from "../plugin/day";
const vm = reactive({
  text: "",
  type: "",
  distance: "",
  isResult: false,
  loading: false,
  current: null,
  updated_location: "",
});
// Fungsi untuk mengecek apakah perangkat berada dalam wilayah geofencing
const checkGeofence = (latitude, longitude, currentLocation) => {
  // Menghitung jarak antara lokasi saat ini dan pusat geofencing
  const distance = calculateDistance(
    latitude,
    longitude,
    currentLocation.latitude,
    currentLocation.longitude,
  );
  vm.isResult = true;

  const radius = 3 / 1000;

  // Memeriksa apakah perangkat berada dalam wilayah geofencing
  console.log(radius);
  vm.distance = distance;
  if (distance <= radius) {
    vm.text = "Perangkat berada dalam wilayah geofencing.";
    vm.type = "success";
  } else {
    vm.text = "Perangkat di luar wilayah geofencing.";
    vm.type = "error";
  }
};

// Fungsi untuk menghitung jarak antara dua titik koordinat menggunakan formula Haversine
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius bumi dalam kilometer
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Jarak dalam kilometer

  return distance;
};

// Fungsi untuk mengonversi derajat menjadi radian
const toRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

// Contoh penggunaan

const base = {
  latitude: -6.9008807,
  longitude: 107.6528414,
};

const updateLocation = (position) => {
  const currentLocation = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
  vm.current = currentLocation;
  vm.updated_location = position.timestamp;
};

const isValidLocation = () => {
  vm.loading = true;
  setTimeout(() => {
    checkGeofence(base.latitude, base.longitude, vm.current);
    vm.loading = false;
  }, 1000);
};

onMounted(() => {
  const watchId = navigator.geolocation.watchPosition(
    updateLocation,
    (error) => {
      console.error("Error getting current location:", error.message);
    },
  );
});
</script>
