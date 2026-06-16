# Caisse Lucie — ticket de caisse PDF

Application web (PWA) : on choisit les plats/desserts/boissons, le panier calcule le
total, et on exporte un **ticket de caisse PDF** identique au modèle LUCIE.

## Tester sur le PC

```
python -m http.server 8123 --directory "A:/3.CODING/BipBip/app"
```
Puis ouvrir http://localhost:8123/index.html

## Installer sur le téléphone Android

1. Mettre le dossier `app/` en ligne (au choix) :
   - hébergement gratuit : **Netlify Drop** (glisser le dossier sur app.netlify.com/drop),
     GitHub Pages, Cloudflare Pages… → on obtient une URL `https://…`
   - ou sur le réseau local : lancer la commande ci-dessus sur le PC et, depuis le
     téléphone connecté au même Wi-Fi, ouvrir `http://IP-DU-PC:8123/index.html`
2. Ouvrir cette URL dans **Chrome** sur le téléphone.
3. Menu ⋮ → **« Ajouter à l'écran d'accueil »**. L'app s'installe et fonctionne
   ensuite en plein écran et **hors-ligne**.

> L'export PDF marche aussi simplement en ouvrant le fichier, mais l'installation PWA
> et le mode hors-ligne nécessitent une URL en `http(s)://` (pas `file://`).

## Modifier le menu / les prix

Tout est dans **`menu.js`** :
- `MENU` : catégories et articles (`nom`, `prix` en euros).
- `COMMERCE` : nom, SIRET, adresse, téléphone, taux de TVA (5,5 %).

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | structure de la page |
| `style.css` | apparence |
| `menu.js` | **menu + coordonnées du commerce (à éditer)** |
| `app.js` | panier + génération du PDF |
| `vendor/jspdf.umd.min.js` | librairie PDF |
| `logo.jpeg` | logo Lucie |
| `manifest.webmanifest`, `sw.js` | installation + hors-ligne |

Le **numéro de facture** s'incrémente tout seul à chaque export (stocké sur l'appareil).

## Plus tard : un vrai .apk ?

La même app web s'emballe dans un APK Play Store avec **Capacitor** sans réécrire le
code. À voir si le besoin se présente.
