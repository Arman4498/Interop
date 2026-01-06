# Interop

Projet d'interopérabilité web

## 📋 Description

Ce projet comprend deux applications principales :

### 🌤️ Atmosphere
Application de prévisions météorologiques qui :
- Détecte la localisation de l'utilisateur via son adresse IP
- Récupère les données météo depuis Infoclimat
- Transforme les données XML via XSLT pour l'affichage
- Affiche les prévisions météorologiques de la journée (matin, après-midi, soir, nuit)

### 🚴 Circulations
Application de visualisation de la circulation à Nancy qui :
- Affiche une carte interactive des stations VélOstan (vélos partagés)
- Montre la qualité de l'air en temps réel
- Intègre les données météorologiques
- Géolocalise l'utilisateur pour personnaliser l'affichage

## 🛠️ Technologies utilisées

- **HTML5** : Structure et style des pages
- **JavaScript** : Logique côté client et interactions
- **PHP** : Traitement serveur et gestion du proxy
- **XSLT** : Transformation XML vers HTML
- **Leaflet.js** : Cartographie interactive
- **APIs externes** :
  - ip-api.com / ipapi.co : Géolocalisation IP
  - Infoclimat : Données météorologiques
  - Cyclocity : Stations de vélos partagés
  - Atmo Grand Est : Qualité de l'air
  - Open-Meteo : Données météo

## 📁 Structure du projet

```
Interop/
├── Atmosphere/
│   ├── index.html          # Page principale météo
│   ├── atmosphere.php      # Script PHP de traitement
│   ├── script.js           # JavaScript client
│   ├── meteo.xsl           # Feuille de style XSLT
│   └── DTDmeteo.dtd        # Définition de type de document
└── Circulations/
    ├── index.html          # Page principale circulation
    ├── script2.js          # JavaScript avec cartographie
    └── style.css           # Styles CSS
```

## 🌐 Accès au projet

- **Dépôt GitHub** : [https://github.com/Arman4498/Interop.git](https://github.com/Arman4498/Interop.git)
- **Hébergement web** : [https://webetu.iutnc.univ-lorraine.fr/www/e46897u/Interop/](https://webetu.iutnc.univ-lorraine.fr/www/e46897u/Interop/)

## 🚀 Utilisation

### Atmosphere
1. Accédez à `Atmosphere/index.html`
2. L'application détecte automatiquement votre localisation
3. Les prévisions météorologiques s'affichent automatiquement

### Circulations
1. Accédez à `Circulations/index.html`
2. La carte interactive se charge avec les stations de vélos
3. Les informations de qualité de l'air et météo s'affichent dans le panneau d'information

## 📝 Notes techniques

- Le projet utilise un proxy configuré pour fonctionner sur le serveur webetu
- Les données sont récupérées en temps réel depuis les APIs externes
- La transformation XSLT permet de convertir les données XML en HTML formaté

## 👤 Auteur

Arman4498

## 📄 Licence

Ce projet est fourni tel quel à des fins éducatives.

