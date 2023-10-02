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
      :class="`p-3 flex items-center rounded-lg border ${
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
        {{ vm.text }} ({{ vm.distance }})
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const vm = reactive({
  text: "",
  type: "",
  distance: "",
  isResult: false,
  loading: false,
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

  const km = 1000;
  const m = 3;
  const radius = m / 1000;

  // Memeriksa apakah perangkat berada dalam wilayah geofencing

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
  latitude: -6.9008815,
  longitude: 107.6528374,
};

const isValidLocation = () => {
  vm.loading = true;
  // Menggunakan API Geolocation untuk mendapatkan lokasi saat ini
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const currentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setInterval(() => {
        // Memeriksa apakah perangkat berada dalam wilayah geofencing
        checkGeofence(base.latitude, base.longitude, currentLocation);
        vm.loading = false;
      }, 1000);
    },
    (error) => {
      console.error("Error getting current location:", error.message);
    },
  );
};
</script>
