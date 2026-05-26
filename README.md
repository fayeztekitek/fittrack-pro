# 🏃 FitTrack Pro

> Application fitness complète — fonctionne directement dans le navigateur Android (PWA)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat&logo=pwa&logoColor=white)

## ✨ Fonctionnalités

### 🔐 Authentification
- Connexion / Création de compte (stockage local sécurisé)
- Session persistante entre les visites
- Compte démo : `demo@fit.com` / `demo123`

### 👣 Compteur de pas réel
- Algorithme avancé de détection de pas via **accéléromètre** (DeviceMotion API)
- Filtre passe-bas pour isoler laccelération linéaire (soustraction gravité)
- Fenêtre glissante de lissage + détection de pics avec debounce (250ms)
- Fonctionne en poche, à la main, sur brassard

### 📡 GPS temps réel
- Tracé de parcours en **Canvas** mis à jour en temps réel
- Calcul de distance via formule **Haversine**
- Vitesse GPS native (`coords.speed`)
- Dénivelé positif (altitude GPS)
- Pré-acquisition du signal GPS au lancement

### 🚴 Module Vélo — Performance avancée
- **Puissance estimée** (Watts) via modèle physique (résistance rolling + aérodynamisme)
- **Zones de puissance** (Z1 Récup → Z6 Anaérobie)
- **Cadence de pédalage** (RPM) via accéléromètre
- Vitesse max, vitesse moyenne, dénivelé
- **Segments kilométriques** automatiques
- Calories via calcul MET (7.5 MET pour vélo modéré)

### 🏃 Activités supportées
| Activité | Détection | Calories |
|---|---|---|
| 🚶 Marche | 0.5–4 km/h | 0.57 × dist × poids |
| 🚶‍♂️ Marche rapide | 4–7 km/h | 0.72 × dist × poids |
| 🏃 Course | 7–20 km/h | 1.0 × dist × poids |
| 🚴 Vélo | 5+ km/h | MET × poids × durée |

### 📊 Statistiques & Historique
- Graphiques semaine / mois (barres + courbe)
- Répartition des activités
- Historique complet des sessions avec détails
- 9 succès & badges débloquables

### 👤 Profil personnalisé
- Poids, taille, âge, genre
- Calcul IMC en temps réel
- Objectif de pas réglable (3 000–20 000)

## 🚀 Installation sur Android

### Option 1 — Fichier direct (le plus simple)
1. Télécharger `FitTrackPro.html`
2. Ouvrir avec Chrome
3. ✅ Lapplication tourne immédiatement

### Option 2 — Installer comme app (PWA)
1. Ouvrir dans Chrome Android
2. Menu ⋮ → **"Ajouter à lécran daccueil"**
3. Licône apparaît comme une vraie application

## 🛠 Technologies utilisées
- **HTML5** — structure
- **CSS3** — animations, glassmorphism, responsive
- **Vanilla JavaScript** — zéro dépendance externe
- **DeviceMotion API** — accéléromètre natif
- **Geolocation API** — GPS haute précision
- **Canvas 2D** — tracé de parcours
- **LocalStorage** — persistance des données
- **Google Fonts** — Bebas Neue, Barlow Condensed

## 📁 Structure du projet
```
fittrack-pro/
└── FitTrackPro.html    # Application complète (fichier unique)
```

## 📄 Licence
MIT — Libre dutilisation et de modification.

---
Développé avec ❤️ par [@fayeztekitek](https://github.com/fayeztekitek)

