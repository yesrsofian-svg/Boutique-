# Belle Flore — boutique de cosmétiques Flormar (France & Maroc)

Site vitrine/boutique statique en français, adapté au mobile (HTML, CSS, JavaScript, sans dépendance).

## Pages
- `index.html` — accueil (héros, catégories, coups de cœur)
- `catalogue.html` — fiches produits (photo, nom, prix en € et en DH, « Ajouter au panier »), filtres par catégorie et tri
- `panier.html` — panier (quantités, choix France/Maroc, frais de livraison, commande envoyée sur WhatsApp)
- `contact.html` — bouton WhatsApp, formulaire qui ouvre WhatsApp, FAQ

Le panier est enregistré dans le navigateur (localStorage).

## Personnaliser
Tout se règle dans `js/products.js` :
- `BOUTIQUE.whatsapp` : **remplacez le numéro d'exemple** (format international sans « + », ex. `212612345678`)
- `BOUTIQUE.nom`, `BOUTIQUE.email`, seuils et frais de livraison
- `PRODUITS` : produits d'exemple à remplacer. Pour une vraie photo, ajoutez `image: "images/mon-produit.jpg"` à un produit.

## Voir le site en local
```
python3 -m http.server 8000
```
puis ouvrir http://localhost:8000. Le site peut être hébergé tel quel (GitHub Pages, Netlify…).
