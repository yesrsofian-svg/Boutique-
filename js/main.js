/* =========================================================
   Belle Flore — scripts communs (panier, rendu, menu)
   ========================================================= */
(function () {
  "use strict";

  const CLE_PANIER = "belleflore_panier";

  /* ---------- Formatage des prix ---------- */
  const fmtEUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
  const fmtMAD = (v) =>
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(v) + " DH";
  const euro = (v) => fmtEUR.format(v);

  const echapper = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Panier (localStorage) ---------- */
  function lirePanier() {
    try {
      const data = JSON.parse(localStorage.getItem(CLE_PANIER));
      return Array.isArray(data) ? data.filter((l) => trouverProduit(l.id)) : [];
    } catch (e) {
      return [];
    }
  }
  function ecrirePanier(panier) {
    try {
      localStorage.setItem(CLE_PANIER, JSON.stringify(panier));
    } catch (e) { /* stockage indisponible */ }
    majCompteur();
  }
  function trouverProduit(id) {
    return PRODUITS.find((p) => p.id === id);
  }
  function ajouterAuPanier(id, qte = 1) {
    const panier = lirePanier();
    const ligne = panier.find((l) => l.id === id);
    if (ligne) ligne.qte = Math.min(ligne.qte + qte, 20);
    else panier.push({ id, qte });
    ecrirePanier(panier);
  }
  function changerQuantite(id, qte) {
    let panier = lirePanier();
    if (qte <= 0) panier = panier.filter((l) => l.id !== id);
    else panier.forEach((l) => { if (l.id === id) l.qte = Math.min(qte, 20); });
    ecrirePanier(panier);
  }
  function totaux(panier) {
    return panier.reduce(
      (t, l) => {
        const p = trouverProduit(l.id);
        t.eur += p.prixEUR * l.qte;
        t.mad += p.prixMAD * l.qte;
        t.articles += l.qte;
        return t;
      },
      { eur: 0, mad: 0, articles: 0 }
    );
  }
  function majCompteur() {
    const n = totaux(lirePanier()).articles;
    document.querySelectorAll("[data-compteur-panier]").forEach((el) => {
      el.textContent = n;
      el.hidden = n === 0;
    });
  }

  /* ---------- Illustrations produits (SVG) ---------- */
  function visuel(p) {
    if (p.image) {
      return `<img src="${echapper(p.image)}" alt="${echapper(p.nom)}" loading="lazy">`;
    }
    const c = p.couleur;
    const or = "#c9a46a";
    const noir = "#2b2427";
    const formes = {
      rouge: `
        <rect x="80" y="120" width="40" height="70" rx="4" fill="${or}"/>
        <rect x="84" y="95" width="32" height="30" rx="3" fill="#d8b97f"/>
        <path d="M86 98 L86 55 Q100 35 114 48 L114 98 Z" fill="${c}"/>
        <rect x="74" y="185" width="52" height="12" rx="3" fill="${noir}"/>`,
      gloss: `
        <rect x="86" y="40" width="28" height="22" rx="6" fill="${noir}"/>
        <rect x="88" y="62" width="24" height="125" rx="10" fill="${c}" opacity=".85"/>
        <rect x="93" y="70" width="5" height="100" rx="2.5" fill="#fff" opacity=".45"/>`,
      crayon: `
        <g transform="rotate(-30 100 120)">
          <rect x="90" y="50" width="20" height="130" rx="3" fill="${noir}"/>
          <rect x="90" y="165" width="20" height="18" fill="${or}"/>
          <path d="M90 50 L100 22 L110 50 Z" fill="#e8cfa9"/>
          <path d="M96 33 L100 22 L104 33 Z" fill="${c}"/>
        </g>`,
      mascara: `
        <rect x="86" y="30" width="28" height="80" rx="5" fill="${noir}"/>
        <rect x="86" y="105" width="28" height="8" fill="${or}"/>
        <rect x="86" y="113" width="28" height="80" rx="6" fill="${noir}"/>
        <text x="100" y="160" font-size="9" fill="${or}" text-anchor="middle" transform="rotate(-90 100 155)" font-family="serif" letter-spacing="2">MASCARA</text>`,
      fond: `
        <rect x="70" y="80" width="60" height="110" rx="10" fill="${c}"/>
        <rect x="70" y="80" width="60" height="110" rx="10" fill="#fff" opacity=".18"/>
        <rect x="88" y="55" width="24" height="28" rx="3" fill="${or}"/>
        <rect x="92" y="38" width="16" height="20" rx="3" fill="${noir}"/>
        <rect x="80" y="125" width="40" height="22" rx="2" fill="#fff" opacity=".7"/>`,
      vernis: `
        <rect x="90" y="35" width="20" height="70" rx="4" fill="${noir}"/>
        <path d="M70 110 Q70 100 82 100 L118 100 Q130 100 130 110 L132 180 Q132 192 120 192 L80 192 Q68 192 68 180 Z" fill="${c}"/>
        <path d="M78 112 L80 175" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".4"/>`,
      palette: `
        <rect x="40" y="60" width="120" height="100" rx="10" fill="${noir}"/>
        ${[0, 1, 2].map((r) => [0, 1, 2].map((k) => {
          const teintes = ["#f1d3c4", "#d9a38f", "#b5717a", "#e8b9a6", c, "#8a4f57", "#f5e1d0", "#c58a6c", "#5b3a3f"];
          return `<rect x="${52 + k * 34}" y="${70 + r * 28}" width="28" height="22" rx="4" fill="${teintes[r * 3 + k]}"/>`;
        }).join("")).join("")}`,
      poudre: `
        <ellipse cx="100" cy="150" rx="60" ry="16" fill="${noir}"/>
        <rect x="40" y="128" width="120" height="22" fill="${noir}"/>
        <ellipse cx="100" cy="128" rx="60" ry="16" fill="#3a3135"/>
        <ellipse cx="100" cy="128" rx="48" ry="12" fill="${c}"/>
        <ellipse cx="100" cy="70" rx="60" ry="16" fill="${or}" transform="rotate(-12 100 100)"/>`,
      blush: `
        <rect x="45" y="70" width="110" height="90" rx="45" fill="${noir}"/>
        <circle cx="100" cy="115" r="34" fill="${c}"/>
        <path d="M80 105 Q100 90 120 105" stroke="#fff" stroke-width="3" fill="none" opacity=".35"/>`,
    };
    return `<svg viewBox="0 0 200 220" role="img" aria-label="${echapper(p.nom)}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="115" r="88" fill="${c}" opacity=".12"/>${formes[p.visuel] || formes.rouge}</svg>`;
  }

  /* ---------- Fiche produit ---------- */
  function ficheProduit(p) {
    return `
      <article class="produit">
        <div class="produit__visuel">
          ${p.badge ? `<span class="badge">${echapper(p.badge)}</span>` : ""}
          ${visuel(p)}
        </div>
        <div class="produit__infos">
          <p class="produit__categorie">${echapper(p.categorie)} · ${echapper(p.teinte)}</p>
          <h3 class="produit__nom">${echapper(p.nom)}</h3>
          <p class="produit__desc">${echapper(p.description)}</p>
          <div class="prix">
            <span class="prix__eur"><span class="drapeau" aria-hidden="true">🇫🇷</span>${euro(p.prixEUR)}</span>
            <span class="prix__mad"><span class="drapeau" aria-hidden="true">🇲🇦</span>${fmtMAD(p.prixMAD)}</span>
          </div>
          <button class="btn btn--plein btn--bloc" type="button" data-ajouter="${p.id}">
            Ajouter au panier
          </button>
        </div>
      </article>`;
  }

  /* ---------- Notification ---------- */
  let minuteur;
  function notifier(message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.innerHTML = message;
    toast.classList.add("toast--visible");
    clearTimeout(minuteur);
    minuteur = setTimeout(() => toast.classList.remove("toast--visible"), 2600);
  }

  /* ---------- Clics « Ajouter au panier » ---------- */
  document.addEventListener("click", (e) => {
    const bouton = e.target.closest("[data-ajouter]");
    if (!bouton) return;
    const p = trouverProduit(bouton.dataset.ajouter);
    if (!p) return;
    ajouterAuPanier(p.id);
    bouton.classList.add("btn--ok");
    const texte = bouton.textContent;
    bouton.textContent = "Ajouté ✓";
    setTimeout(() => { bouton.textContent = texte; bouton.classList.remove("btn--ok"); }, 1400);
    notifier(`<strong>${echapper(p.nom)}</strong> a été ajouté au panier. <a href="panier.html">Voir le panier</a>`);
  });

  /* ---------- Menu mobile ---------- */
  function initMenu() {
    const bouton = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav");
    if (!bouton || !nav) return;
    bouton.addEventListener("click", () => {
      const ouvert = nav.classList.toggle("nav--ouverte");
      bouton.setAttribute("aria-expanded", ouvert);
      document.body.classList.toggle("menu-ouvert", ouvert);
    });
  }

  /* ---------- Liens WhatsApp ---------- */
  function lienWhatsApp(message) {
    return `https://wa.me/${BOUTIQUE.whatsapp}?text=${encodeURIComponent(message)}`;
  }
  function initWhatsApp() {
    document.querySelectorAll("[data-whatsapp]").forEach((a) => {
      a.href = lienWhatsApp(a.dataset.whatsapp || `Bonjour ${BOUTIQUE.nom}, j'ai une question :`);
      a.target = "_blank";
      a.rel = "noopener";
    });
    document.querySelectorAll("[data-email]").forEach((a) => {
      a.href = `mailto:${BOUTIQUE.email}`;
      a.textContent = BOUTIQUE.email;
    });
  }

  /* ---------- Page d'accueil : sélection ---------- */
  function initAccueil() {
    const zone = document.getElementById("selection");
    if (!zone) return;
    zone.innerHTML = PRODUITS.filter((p) => p.badge).slice(0, 4).map(ficheProduit).join("");
  }

  /* ---------- Page catalogue ---------- */
  function initCatalogue() {
    const grille = document.getElementById("catalogue");
    if (!grille) return;
    const filtres = document.getElementById("filtres");
    const tri = document.getElementById("tri");
    const compteur = document.getElementById("nb-produits");
    const categories = ["Tout", ...new Set(PRODUITS.map((p) => p.categorie))];
    const params = new URLSearchParams(location.search);
    let active = categories.includes(params.get("categorie")) ? params.get("categorie") : "Tout";

    filtres.innerHTML = categories
      .map((c) => `<button type="button" class="filtre" data-cat="${echapper(c)}" aria-pressed="${c === active}">${echapper(c)}</button>`)
      .join("");

    function afficher() {
      let liste = PRODUITS.filter((p) => active === "Tout" || p.categorie === active);
      if (tri.value === "prix-croissant") liste = [...liste].sort((a, b) => a.prixEUR - b.prixEUR);
      if (tri.value === "prix-decroissant") liste = [...liste].sort((a, b) => b.prixEUR - a.prixEUR);
      if (tri.value === "nom") liste = [...liste].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
      grille.innerHTML = liste.map(ficheProduit).join("");
      compteur.textContent = `${liste.length} produit${liste.length > 1 ? "s" : ""}`;
    }

    filtres.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      active = b.dataset.cat;
      filtres.querySelectorAll(".filtre").forEach((f) => f.setAttribute("aria-pressed", f === b));
      const url = new URL(location.href);
      if (active === "Tout") url.searchParams.delete("categorie");
      else url.searchParams.set("categorie", active);
      history.replaceState(null, "", url);
      afficher();
    });
    tri.addEventListener("change", afficher);
    afficher();
  }

  /* ---------- Page panier ---------- */
  function initPanier() {
    const zone = document.getElementById("panier");
    if (!zone) return;
    let pays = "FR";
    try { pays = localStorage.getItem("belleflore_pays") || "FR"; } catch (e) {}

    function rendu() {
      const panier = lirePanier();
      if (!panier.length) {
        zone.innerHTML = `
          <div class="panier-vide">
            <p class="panier-vide__titre">Votre panier est vide</p>
            <p>Découvrez nos rouges à lèvres, mascaras et vernis Flormar.</p>
            <a class="btn btn--plein" href="catalogue.html">Découvrir le catalogue</a>
          </div>`;
        return;
      }
      const t = totaux(panier);
      const L = BOUTIQUE.livraison;
      const fr = pays === "FR";
      const sousTotal = fr ? t.eur : t.mad;
      const seuil = fr ? L.seuilGratuitEUR : L.seuilGratuitMAD;
      const frais = sousTotal >= seuil ? 0 : fr ? L.fraisEUR : L.fraisMAD;
      const fmt = fr ? euro : fmtMAD;
      const reste = seuil - sousTotal;

      zone.innerHTML = `
        <div class="panier-grille">
          <ul class="lignes">
            ${panier.map((l) => {
              const p = trouverProduit(l.id);
              return `
              <li class="ligne">
                <div class="ligne__visuel">${visuel(p)}</div>
                <div class="ligne__infos">
                  <h3>${echapper(p.nom)}</h3>
                  <p class="ligne__teinte">${echapper(p.teinte)}</p>
                  <p class="ligne__pu">${euro(p.prixEUR)} · ${fmtMAD(p.prixMAD)}</p>
                  <div class="ligne__actions">
                    <div class="quantite" aria-label="Quantité">
                      <button type="button" data-qte="${p.id}" data-delta="-1" aria-label="Diminuer la quantité">−</button>
                      <span>${l.qte}</span>
                      <button type="button" data-qte="${p.id}" data-delta="1" aria-label="Augmenter la quantité">+</button>
                    </div>
                    <button type="button" class="lien-retirer" data-retirer="${p.id}">Retirer</button>
                  </div>
                </div>
                <div class="ligne__total">
                  <strong>${euro(p.prixEUR * l.qte)}</strong>
                  <span>${fmtMAD(p.prixMAD * l.qte)}</span>
                </div>
              </li>`;
            }).join("")}
          </ul>

          <aside class="recap">
            <h2>Récapitulatif</h2>
            <fieldset class="pays">
              <legend>Livraison en</legend>
              <label><input type="radio" name="pays" value="FR" ${fr ? "checked" : ""}> 🇫🇷 France</label>
              <label><input type="radio" name="pays" value="MA" ${!fr ? "checked" : ""}> 🇲🇦 Maroc</label>
            </fieldset>
            <dl>
              <div><dt>Articles (${t.articles})</dt><dd>${fmt(sousTotal)}</dd></div>
              <div><dt>Livraison</dt><dd>${frais === 0 ? "Offerte" : fmt(frais)}</dd></div>
              <div class="recap__total"><dt>Total</dt><dd>${fmt(sousTotal + frais)}</dd></div>
            </dl>
            <p class="recap__info">${reste > 0
              ? `Plus que <strong>${fmt(reste)}</strong> pour profiter de la livraison offerte.`
              : "Bonne nouvelle : la livraison vous est offerte !"}</p>
            <a class="btn btn--whatsapp btn--bloc" id="commander" target="_blank" rel="noopener">
              ${iconeWhatsApp()} Commander sur WhatsApp
            </a>
            <p class="recap__note">Votre commande est envoyée sur WhatsApp : nous confirmons la disponibilité, la livraison et le paiement avec vous.</p>
            <button type="button" class="lien-retirer" id="vider">Vider le panier</button>
          </aside>
        </div>`;

      const message = [
        `Bonjour ${BOUTIQUE.nom}, je souhaite commander :`,
        "",
        ...panier.map((l) => {
          const p = trouverProduit(l.id);
          return `• ${l.qte} × ${p.nom} (${p.teinte}) — ${fmt((fr ? p.prixEUR : p.prixMAD) * l.qte)}`;
        }),
        "",
        `Livraison : ${fr ? "France" : "Maroc"} — ${frais === 0 ? "offerte" : fmt(frais)}`,
        `Total : ${fmt(sousTotal + frais)}`,
        "",
        "Nom :",
        "Adresse :",
      ].join("\n");
      document.getElementById("commander").href = lienWhatsApp(message);
    }

    zone.addEventListener("click", (e) => {
      const q = e.target.closest("[data-qte]");
      const r = e.target.closest("[data-retirer]");
      if (q) {
        const ligne = lirePanier().find((l) => l.id === q.dataset.qte);
        changerQuantite(q.dataset.qte, (ligne ? ligne.qte : 0) + Number(q.dataset.delta));
        rendu();
      } else if (r) {
        changerQuantite(r.dataset.retirer, 0);
        rendu();
      } else if (e.target.id === "vider") {
        ecrirePanier([]);
        rendu();
      }
    });
    zone.addEventListener("change", (e) => {
      if (e.target.name !== "pays") return;
      pays = e.target.value;
      try { localStorage.setItem("belleflore_pays", pays); } catch (err) {}
      rendu();
    });
    rendu();
  }

  /* ---------- Page contact ---------- */
  function initContact() {
    const form = document.getElementById("form-contact");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const message = `Bonjour ${BOUTIQUE.nom},\n\n${d.get("message")}\n\n— ${d.get("nom")} (${d.get("pays")})`;
      window.open(lienWhatsApp(message), "_blank", "noopener");
    });
  }

  function iconeWhatsApp() {
    return `<svg class="icone" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z"/></svg>`;
  }

  /* ---------- Démarrage ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-icone-whatsapp]").forEach((el) => (el.innerHTML = iconeWhatsApp()));
    document.querySelectorAll("[data-nom-boutique]").forEach((el) => (el.textContent = BOUTIQUE.nom));
    document.querySelectorAll("[data-annee]").forEach((el) => (el.textContent = new Date().getFullYear()));
    initMenu();
    initWhatsApp();
    initAccueil();
    initCatalogue();
    initPanier();
    initContact();
    majCompteur();
  });
})();
