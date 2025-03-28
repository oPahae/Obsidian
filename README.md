# Application de Chat en Temps Réel

## 🚀 Aperçu du Projet

**Obsidian** est une application web moderne conçue pour offrir une communication fluide entre utilisateurs en temps réel. Avec des fonctionnalités avancées comme l'authentification, la création de salons et la messagerie dynamique, elle propose un environnement interactif et sécurisé.

---

## 🛠️ Fonctionnalités

### 🔒 Authentification
- Connexion/Inscription avec email et mot de passe.
- Récupération de mot de passe via email.
- Intégration de connexion Google.
- Gestion sécurisée des sessions avec **Cookie.js** et **JWT**.
- Accès restreint aux pages selon l'état de connexion.

### 🏠 Gestion des Salons
- Consultation des salons déjà rejoints.
- Création de salons avec :
  - Noms personnalisés, IP et PORT.
  - Images simples ou animées.
  - Type de salon, description, restrictions (âge, sexe).
  - Limites maximales de membres.
- Recherche et connexion à des salons par IP et PORT.
- Contrôle des restrictions (impossible de rejoindre un salon déjà rejoint).
- Ajout automatique des salons créés au profil utilisateur.
- Suppression et gestion des membres des salons.

### 📡 Messagerie en Temps Réel
- Envoi et réception de messages instantanés avec **Socket.io**.
- Support des messages multimédias (texte, images, vidéos, audio).
- Consultation des informations des salons et des profils des membres.
- Possibilité de quitter les salons.

### ⚙️ Profil Utilisateur
- Modification des informations personnelles et de l'image de profil.
- Consultation et gestion des salons créés.
- Suppression définitive du compte.

---

## 💻 Technologies Utilisées

### Frontend
- **Next.js** : Interfaces utilisateur dynamiques et réactives.
- **Tailwind CSS**, **GSAP**, **Animate.css** : Animations élégantes et design moderne.

### Backend
- **Next.js REST API** : Intégration backend flexible.
- **MongoDB** et **Mongoose** : Gestion de bases de données non relationnelles.
- **Socket.io** : Gestion des événements en temps réel.

### Sécurité et Authentification
- **JWT** : Gestion sécurisée des sessions.
- **bcrypt.js** : Hachage des mots de passe.
- **NextAuth** et **Google Auth** : Intégrations d'authentification.

### Communication
- **Axios** : Requêtes serveur-client efficaces.
- **Nodemailer** et **Brevo (SendGrid)** : Gestion automatisée des emails.

---

## 📂 Structure du Projet

```
app
├── .env                  # Variables secrètes (URI BD, clés API, etc.)
├── public                # Ressources statiques (images, icônes, etc.)
├── src
│   ├── components        # Composants réutilisables
│   │   ├── GoogleLoginBtn.jsx
│   │   ├── Header.jsx
│   │   ├── Infos.jsx
│   │   ├── Message.jsx
│   │   ├── Room.jsx
│   │   ├── Sidebar.jsx
│   │   └── sidebarElements.js
│   ├── middlewares       # Middleware pour la gestion des sessions
│   │   └── auth.js
│   ├── pages             # Pages frontend
│   │   ├── _app.jsx
│   │   ├── index.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Forgot.jsx
│   │   ├── Create.jsx
│   │   ├── Locate.jsx
│   │   ├── Profile.jsx
│   │   └── Room.jsx
│   │   ├── User.jsx
│   ├── api               # Routes backend
│   │   ├── auth
│   │   │   ├── login.js
│   │   │   ├── register.js
│   │   │   ├── logout.js
│   │   │   ├── googleLogin.js
│   │   │   ├── sendCode.js
│   │   │   ├── verifyCode.js
│   │   │   └── resetPassword.js
│   │   ├── lib
│   │   │   ├── connect.js
│   │   │   └── socket.js
│   │   ├── models
│   │   │   ├── Msg.js
│   │   │   ├── Room.js
│   │   │   ├── User.js
│   │   │   └── VerifCode.js
│   │   ├── msg
│   │   │   ├── getMsgs.js
│   │   │   └── sendMsg.js
│   │   ├── room
│   │   │   ├── check.js
│   │   │   ├── create.js
│   │   │   ├── drop.js
│   │   │   ├── join.js
│   │   │   ├── check.js
│   │   │   ├── leave.js
│   │   │   ├── locate.js
│   │   │   ├── getInfos.js
│   │   │   ├── getRooms.js
│   │   │   ├── getOwnRooms.js
│   │   │   └── leave.js
│   │   └── user
│   │       ├── drop.js
│   │       ├── getInfos.js
│   │       └── updateInfos.js
│   └── styles            # Styles CSS globaux
│       └── globals.css
└── README.md             # Documentation
```

---

## 📋 Pré-requis

- Node.js v16+
- MongoDB (instance locale ou cloud)

---

## 🛠️ Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/oPahae/Obsidian.git
   ```

2. Accédez au répertoire du projet :
   ```bash
   cd app
   ```

3. Installez les dépendances :
   ```bash
   npm install
   ```

4. Configurez les variables d'environnement dans un fichier `.env` :
   ```env
   MONGODB_URI=votre_mongodb_uri
   GOOGLE_CLIENT_ID=votre_google_client_id
   GOOGLE_CLIENT_SECRET=votre_google_client_secret
   JWT_SECRET=votre_jwt_secret
   MAIL_SENDER=votre_email
   ```

5. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

6. Accédez à l'application via `http://localhost:3000`.

---

## 🤝 Contributions

Les contributions sont les bienvenues ! Forkez le dépôt et soumettez une pull request.

---

## 🐞 Problèmes Connus

- La connexion Google est limitée aux emails uniques pour les comptes normaux et basés sur Google.
- Le service email (Brevo) est limité à 300 emails par jour.

---

## 📝 Licence

Ce projet est sous le cadre du module "Architecture n-tière et Développement Web" en FST Settat.

---

## ✨ Remerciements

- Merci à [Brevo](https://www.brevo.com) pour les services email.
- Construit avec passion pour le développement web moderne.

---

## 📧 Contact

Pour des questions ou suggestions, contactez-moi :

- **Email** : [lam.bahae7@gmail.com](mailto:lam.bahae7@gmail.com)
- **GitHub** : [oPahae](https://github.com/oPahae)
