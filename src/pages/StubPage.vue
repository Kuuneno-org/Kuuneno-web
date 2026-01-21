<template>
  <div class="wrap">
    <div class="card">
      <h1>Page en cours</h1>
      <p>Cette page sera implémentée ensuite.</p>
      <button class="btn" @click="$router.push('/')">Retour accueil</button>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.wrap {
  height: 100vh;
  display: grid;
  place-items: center;
  background: radial-gradient(ellipse at bottom, #0b1a33 0%, #050814 70%, #02040a 100%);
}
.card {
  width: min(520px, calc(100vw - 32px));
  padding: 20px;
  border-radius: 16px;
  background: rgba(10, 16, 30, 0.7);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 18px 60px rgba(0,0,0,0.45);
}
.btn {
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.06);
  color: white;
  cursor: pointer;
}
.btn:hover {
  background: rgba(255,255,255,0.10);
}
</style>
