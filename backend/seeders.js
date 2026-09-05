import mongoose from 'mongoose';
import User from './models/User.js';

// Remplacez par votre URI MongoDB si nécessaire
mongoose.connect('mongodb://127.0.0.1:27017/cafe_db')
  .then(async () => {
    console.log("Connecté à MongoDB...");

    // Création de 2 serveurs de test
    await User.create([
      { username: 'Sami', passwordHash: 'Sami123', role: 'WAITER' },
      { username: 'Youssef', passwordHash: 'Youssef123', role: 'WAITER' },
      { username: 'moataz', passwordHash: 'moataz123', role: 'ADMIN' }

    ]);

    console.log("✅ Serveurs créés avec succès !");
    mongoose.connection.close();
  })
  .catch(err => console.error("❌ Erreur :", err));