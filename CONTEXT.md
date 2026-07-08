# 📘 CONTEXT — Projet Waqf, refactor Next.js 100%

> **À lire en premier avant toute action sur ce projet.**
> Ce fichier te donne le contexte complet : qui je suis, ce qu'on fait, comment on travaille ensemble.

---

## 👤 Qui je suis

Je m'appelle Amedy NDONGO, fondateur de l'agence **AND VISION** à Dakar, Sénégal. J'ai 27 ans. Je viens surtout du no-code, du design, du community management et de WordPress niveau interface. Je suis certifié Digital Referent via Sonatel Academy.

Mes forces : design, UX, gestion de projet, no-code, outils IA (v0, Lovable, Claude Code). Ma zone d'apprentissage active : le vrai code (backend, base de données, DevOps).

Je parle et travaille en français. Je préfère un style naturel, direct, sans jargon inutile.

---

## 🎯 Objectif de cette mission

Refactorer le projet **Waqf And Liggeyal Daara** pour passer d'une architecture **backend NestJS + frontend Next.js séparés** vers une architecture **Next.js 100% déployée sur Vercel**.

Ce n'est pas juste un projet de refactor. C'est **mon terrain d'apprentissage pour maîtriser le développement full-stack moderne**. Chaque étape est autant un exercice pédagogique qu'un livrable technique.

L'app originale de mon ami reste en production sur son VPS Hostinger (https://waqfald.com). On ne touche pas à son code. On crée notre propre version dans un nouveau dossier.

---

## 📦 Le projet Waqf en 3 phrases

**Waqf And Liggeyal Daara** est une plateforme de dons et de transparence pour une association sénégalaise qui soutient les daaras (écoles coraniques). Le site propose : dons ponctuels et mensuels via Wave, Orange Money, Free Money et carte bancaire, gestion de projets à financer, boutique solidaire, espace donateur avec historique et reçus fiscaux, back-office admin complet. Multilingue FR/EN/AR avec RTL pour l'arabe.

---

## 🗂️ État actuel du repo

Le dossier `waqf-site/` contient :

```
waqf-site/
├── backend/              → NestJS 11 + Prisma + PostgreSQL + JWT
├── frontend/             → Next.js 16 + React 19 + Tailwind + next-intl
├── nginx/                → config Nginx (on l'ignore, pas besoin sur Vercel)
├── scripts/              → scripts de déploiement VPS (on garde en référence)
├── ecosystem.config.js   → config PM2 (on ignore)
├── docs/                 → documentation du projet original
├── PHASES.md             → plan de dev en 9 phases
└── README.md             → ⚠️ contient un mot de passe DB en clair, à corriger
```

**⚠️ Point de sécurité (décision prise)** : le README du projet original expose l'URL de connexion PostgreSQL avec le mot de passe en clair. Décision : on ne modifie pas le dossier de l'ami (il reste en lecture seule), mais aucun secret ne sera jamais commité dans ce nouveau projet. Tout passe par `.env.local`, ignoré par Git.

---

## 🎯 L'architecture cible

Un seul projet Next.js qui contient tout :

```
waqf-nextjs/
├── app/
│   ├── (public)/           → pages publiques
│   ├── (donateur)/         → espace donateur connecté
│   ├── (admin)/            → back-office
│   └── api/                → les endpoints (ex-modules NestJS)
├── components/             → composants React
├── lib/
│   ├── db.ts               → client Prisma
│   ├── auth.ts             → helpers auth
│   └── ...
├── prisma/
│   └── schema.prisma       → schéma DB (copié depuis backend/prisma)
├── public/
├── locales/                → traductions FR/EN/AR
└── ...
```

Un seul déploiement, un seul repo, un seul `git push` pour tout mettre à jour.

---

## 🧰 Stack technique cible

| Couche | Choix | Pourquoi |
|--------|-------|----------|
| Framework | **Next.js 16 (App Router)** | Frontend + API dans un seul projet |
| Base de données | **PostgreSQL sur Neon** | Serverless, free tier généreux, intégration Vercel native, branching type Git |
| ORM | **Prisma** | Déjà utilisé dans le backend original, on garde le schéma tel quel |
| Auth | **Auth.js (ex-NextAuth) + adapter Prisma** | Standard Next.js, propre, sécurisé |
| Images | **Cloudinary + next-cloudinary** | Déjà utilisé par le projet original, CDN et transformations auto |
| Paiements | **Wave, Orange Money, Free Money, Stripe/PayDunya** | Providers spécifiques Sénégal + fallback carte |
| Multilingue | **next-intl** (FR/EN/AR + RTL) | Déjà utilisé par le frontend original |
| UI | **Tailwind + Radix UI** | Déjà en place |
| État | **Zustand + TanStack Query** | Déjà en place |
| Formulaires | **react-hook-form + zod** | Déjà en place |
| Emails transactionnels | **Resend** | Simple, moderne, free tier suffisant |
| Cron jobs | **Vercel Cron** | Inclus dans Vercel, pas besoin d'infra externe |
| Déploiement | **Vercel** | Zéro config, auto-deploy sur push |
| Repo | **GitHub** | Nouveau repo dédié, séparé de celui de mon ami |

---

## 🗺️ Les 8 étapes du refactor

On avance étape par étape, dans cet ordre. Chaque étape doit être terminée et testée avant de passer à la suivante.

**Étape 1 — Setup projet neuf**
Créer un nouveau dossier `waqf-nextjs/` à côté (pas dans) de `waqf-site/`. Init Next.js 16 avec TypeScript, Tailwind, App Router. Créer un nouveau repo GitHub `waqf-nextjs`. Premier commit propre.

**Étape 2 — Base de données**
Copier `backend/prisma/schema.prisma` dans le nouveau projet. Créer un compte Neon, récupérer l'URL de connexion, la mettre dans `.env.local`. Lancer `prisma generate` et `prisma migrate dev`. Vérifier que les tables sont créées.

**Étape 3 — Récup du frontend statique**
Copier les composants et pages "pures affichage" du `frontend/` original : accueil, à propos, contact, footer, header, layout. Faire tourner en local avec des données mockées.

**Étape 4 — Premier module API : Projects**
Créer les API routes `/api/projects` (GET liste, GET détail, POST création admin). Brancher au frontend. C'est le module le plus simple, il sert de modèle pour les suivants.

**Étape 5 — Auth avec Auth.js**
Setup Auth.js avec Prisma adapter. Inscription email + mot de passe. Login. Protection des routes. Roles : donateur, admin.

**Étape 6 — Cloudinary**
Créer un compte Cloudinary. Setup `next-cloudinary`. Upload d'images de projets côté admin. Affichage optimisé sur le site.

**Étape 7 — Paiements**
Un provider à la fois : Wave d'abord (le plus utilisé au Sénégal), puis Orange Money, puis Free Money, puis carte via Stripe ou PayDunya. Webhooks sécurisés, transactions en DB, reçus PDF.

**Étape 8 — Déploiement et features avancées**
Push sur Vercel, connexion Neon depuis le dashboard Vercel, variables d'env, custom domain. Puis : espace donateur, back-office admin, statistiques, notifications email via Resend.

---

## 🧑‍🏫 Comment je veux qu'on travaille ensemble

**Pédagogie avant productivité.** Je n'ai pas besoin que tu ailles vite. J'ai besoin de comprendre ce que tu fais. Avant chaque action importante : explique-moi pourquoi tu le fais, ce que ça va changer, et ce que je dois retenir.

**Petits pas.** Découpe les tâches en morceaux digestes. Fais une chose à la fois. Attends ma validation avant de passer à la suivante quand c'est important.

**Explique le vocabulaire.** Si tu utilises un mot ou concept que je ne connais peut-être pas, définis-le rapidement. Traite-moi comme un designer intelligent qui apprend le code, pas comme un débutant total ni comme un dev senior.

**Analogies avec WordPress.** Quand pertinent, compare avec ce que je connais de WordPress. Ça m'aide à ancrer mentalement les concepts.

**Français par défaut.** Écris-moi en français. Les commentaires de code peuvent être en anglais si c'est la convention.

**Style naturel.** Pas de jargon inutile, pas de tournures trop lisses ou trop IA. Je préfère quand tu écris comme un vrai développeur qui parle à un collègue, style WhatsApp ou Slack pro.

**Zéro tirets longs (—).** Vraiment, jamais.

---

## ⚠️ Règles importantes

**Ne jamais modifier le dossier `waqf-site/original`**. C'est le code de mon ami, il reste en référence. On lit dedans, on ne touche à rien.

**Ne jamais commit de secrets.** Toutes les clés, mots de passe, URLs de DB doivent être dans `.env.local` (ignoré par Git). Vérifier systématiquement le `.gitignore`.

**Toujours travailler sur une branche Git**, jamais direct sur `main`. Convention : `feature/nom-de-la-feature`, `fix/nom-du-bug`.

**Message de commit clair et court**, en anglais, verbe à l'infinitif : "Add projects API route", "Fix header responsive on mobile", "Configure Neon connection".

**Prévenir avant les actions destructives** : suppression de fichier, `git reset`, migration DB de production. Toujours demander confirmation.

**Si tu n'es pas sûr, demande.** Mieux vaut poser une question que faire un choix implicite que je ne comprends pas.

---

## 🚀 Point de départ

Quand tu prends ce projet en main pour la première fois :

1. Lis ce fichier en entier
2. Fais un tour du dossier `waqf-site/` pour comprendre l'existant : lis `README.md`, `PHASES.md`, la structure de `backend/src/` et `frontend/src/`
3. Fais-moi un résumé de ce que tu as compris, avec tes questions éventuelles
4. Ensuite on démarre l'Étape 1 ensemble

Pas d'action sur le code avant qu'on ait aligné notre compréhension.

---

## 📞 Info utile

- Repo GitHub actuel de mon ami (référence) : https://github.com/aldwaqf/waqf-site
- Site en production de mon ami : https://waqfald.com
- Mon agence : AND VISION, andvisionagency.com
- Localisation : Dakar, Sénégal

---

*Document vivant. À mettre à jour au fil de l'avancement.*
