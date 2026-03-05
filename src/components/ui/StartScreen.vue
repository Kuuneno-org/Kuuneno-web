<template>
  <transition name="fade" appear>
    <div class="start-screen">
      <div class="content">
        <div class="logo-container">
          <img src="@/assets/logo/kuuneno_logo.png" alt="Kuuneno Logo" class="logo" />
        </div>

        <div class="actions">
          <button class="btn-start" @click="$emit('start')">
            <span>COMMENCER L'AVENTURE</span>
            <div class="btn-glow"></div>
          </button>

          <!-- <div class="secondary-actions">
            <button class="btn-social fb" @click="$emit('login-facebook')">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="icon">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
              <span>Connexion avec facebook</span>
            </button>

            <button class="btn-icon help" @click="$emit('help')" aria-label="Aide">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>
          </div> -->
        </div>
      </div>

      <div class="footer-info">
        <span class="copyright">© 2026 Kuunenos. Tous droits réservés.</span>
        <span class="version">v1.0.0</span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineEmits(['start', 'login-facebook', 'help']);
</script>

<style scoped>
.start-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at center, rgba(11, 20, 32, 0.4) 0%, rgba(3, 8, 20, 0.8) 100%);
  backdrop-filter: blur(4px);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  transform: translateY(-20px);
}

.logo-container {
  animation: float 6s ease-in-out infinite;
}

.logo {
  max-width: 400px;
  height: auto;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.2));
}

.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.btn-start {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 3rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 2px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  backdrop-filter: blur(10px);
  border-radius: 4px;
  text-transform: uppercase;
}

.btn-start:hover {
  background: rgba(255, 255, 255, 0.2);
  letter-spacing: 4px;
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transform: skewX(-20deg);
  animation: shine 3s infinite;
}

.secondary-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-social {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: #1877f2;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
  font-family: "Montserrat", sans-serif;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}

.btn-social:hover {
  background: #166fe5;
  transform: translateY(-2px);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(15deg);
}

.footer-info {
  position: absolute;
  bottom: 20px;
  width: 100%;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 300;
  letter-spacing: 1px;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes shine {
  0% { left: -100%; }
  20% { left: 200%; }
  100% { left: 200%; }
}
</style>
