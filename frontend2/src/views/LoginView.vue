<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Connexion Restaurant</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Nom d'utilisateur</label>
          <input type="text" v-model="username" required placeholder="Ex: chef_paul" />
        </div>
        <div class="form-group">
          <label>Mot de passe</label>
          <input type="password" v-model="password" required placeholder="••••••••" />
        </div>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <button type="submit" class="btn-login">Se connecter</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios'; // Centralized Axios instance.
import '../assets/css/LoginView.css';

const router = useRouter();
const username = ref('');
const password = ref('');
const errorMessage = ref('');

const handleLogin = async () => {
  try {
    const response = await api.post('/users/login', {
      username: username.value,
      password: password.value
    });

    const loggedUser = response.data.user;

    // Sauvegarde de l'utilisateur dans le localStorage
    // Au lieu de localStorage.setItem :
    sessionStorage.setItem('user', JSON.stringify(loggedUser));
    // Redirection conditionnelle selon le rôle
    if (loggedUser.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else if (loggedUser.role === 'KITCHEN') {
      router.push('/kitchen');
    } else {
      errorMessage.value = "Accès non autorisé pour ce rôle.";
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || "Erreur de connexion";
  }
};
</script>