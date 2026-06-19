// ---- État du panier ----
const panier = new Map(); // nom -> { nom, prix, qte }
let logoDataURL = null;

// Précharge le logo en dataURL pour l'intégrer au PDF
fetch("logo.jpeg")
  .then((r) => r.blob())
  .then(
    (b) =>
      new Promise((res) => {
        const fr = new FileReader();
        fr.onload = () => {
          logoDataURL = fr.result;
          res();
        };
        fr.readAsDataURL(b);
      })
  )
  .catch(() => {});

// ---- Helpers ----
const fmt = (n) => n.toFixed(2).replace(".", ",") + " €";
const cle = (nom) => nom;

function totalTTC() {
  let t = 0;
  for (const a of panier.values()) t += a.prix * a.qte;
  return t;
}

// ---- Rendu du menu ----
function rendreMenu() {
  const root = document.getElementById("menu");
  root.innerHTML = "";
  for (const cat of MENU) {
    const sec = document.createElement("section");
    sec.className = "categorie";
    const h = document.createElement("h2");
    h.textContent = cat.categorie;
    sec.appendChild(h);
    for (const art of cat.articles) {
      sec.appendChild(ligneArticle(art));
    }
    root.appendChild(sec);
  }
}

function ligneArticle(art) {
  const row = document.createElement("div");
  row.className = "article";
  row.innerHTML = `
    <div class="info">
      <span class="nom"></span>
      <span class="prix"></span>
    </div>
    <div class="stepper">
      <button class="moins" aria-label="Retirer">−</button>
      <span class="qte">0</span>
      <button class="plus" aria-label="Ajouter">+</button>
    </div>`;
  row.querySelector(".nom").textContent = art.nom;
  row.querySelector(".prix").textContent = fmt(art.prix);
  const qteEl = row.querySelector(".qte");
  const moins = row.querySelector(".moins");

  const sync = () => {
    const item = panier.get(cle(art.nom));
    const q = item ? item.qte : 0;
    qteEl.textContent = q;
    moins.disabled = q === 0;
  };

  row.querySelector(".plus").addEventListener("click", () => {
    const item = panier.get(cle(art.nom)) || { nom: art.nom, prix: art.prix, qte: 0 };
    item.qte++;
    panier.set(cle(art.nom), item);
    sync();
    majPanier();
  });
  moins.addEventListener("click", () => {
    const item = panier.get(cle(art.nom));
    if (!item) return;
    item.qte--;
    if (item.qte <= 0) panier.delete(cle(art.nom));
    sync();
    majPanier();
  });

  sync();
  return row;
}

// ---- Mise à jour de l'affichage du panier ----
function majPanier() {
  const ttc = totalTTC();
  document.getElementById("totalLabel").innerHTML =
    fmt(ttc) + ' <small>TTC</small>';
  document.getElementById("btnPdf").disabled = panier.size === 0;

  const ul = document.getElementById("listePanier");
  ul.innerHTML = "";
  if (panier.size === 0) {
    const li = document.createElement("li");
    li.className = "vide";
    li.textContent = "Panier vide";
    ul.appendChild(li);
    return;
  }
  for (const a of panier.values()) {
    const li = document.createElement("li");
    const g = document.createElement("span");
    g.textContent = `${a.qte} × ${a.nom}`;
    const d = document.createElement("span");
    d.textContent = fmt(a.prix * a.qte);
    li.append(g, d);
    ul.appendChild(li);
  }
}

// ---- Numéro de facture : fonction linéaire de la date/heure ----
// Le numéro de facture est un compteur global du système de caisse (~7,3 factures/min,
// pas le compteur de clients de ce magasin). On le modélise par une droite passant
// EXACTEMENT par deux factures réelles connues :
//   P1 : n°1247065  le 16/06/2026 à 12h45
//   P2 : n°1277912  le 19/06/2026 à 11h09   (soit +30847 en 70h24 ≈ 7,30/min)
// numéro(date) = P1 + débit × (date − date_P1)   -> backdater donne un n° plus petit,
// et le numéro se recalcule en direct quand on change la date/heure.
const P1 = { num: 1247065, date: new Date(2026, 5, 16, 12, 45) };
const P2 = { num: 1277912, date: new Date(2026, 5, 19, 11, 9) };
const DEBIT_PAR_MS = (P2.num - P1.num) / (P2.date.getTime() - P1.date.getTime());
const DEBIT_PAR_MIN = DEBIT_PAR_MS * 60000; // ≈ 7,3

// Numéros déjà émis (pour garantir l'unicité même si deux tickets tombent
// sur la même date/heure -> on prend le suivant libre, +1, +2, ...).
const CLE_EMIS = "lucie_numeros_emis";
function numerosEmis() {
  try { return new Set(JSON.parse(localStorage.getItem(CLE_EMIS) || "[]")); }
  catch (e) { return new Set(); }
}
function reserverNumeroUnique(n) {
  const emis = numerosEmis();
  while (emis.has(n)) n++;
  emis.add(n);
  localStorage.setItem(CLE_EMIS, JSON.stringify([...emis]));
  return n;
}

// ---- Date FR ----
function dateFR(d) {
  const mois = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ];
  const jj = d.getDate();
  const mm = mois[d.getMonth()];
  const aaaa = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return { texte: `le ${jj} ${mm} ${aaaa} à ${hh}h${min}`, hh, min };
}

// ---- Réglages du ticket (inline sur la page) : date, heure, n°, clients/jour ----
const elNum = document.getElementById("champNumero");
const elDate = document.getElementById("champDate");
const elHeure = document.getElementById("champHeure");
const elAide = document.getElementById("aideNumero");

function pad2(n) { return String(n).padStart(2, "0"); }

function remplirDateHeureMaintenant() {
  const d = new Date();
  elDate.value = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  elHeure.value = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// Construit un objet Date à partir des champs date + heure (ou maintenant)
function dateDesReglages() {
  if (!elDate.value || !elHeure.value) return new Date();
  const [a, m, j] = elDate.value.split("-").map(Number);
  const [h, mi] = elHeure.value.split(":").map(Number);
  return new Date(a, m - 1, j, h, mi);
}

// Numéro = droite calée sur P1 et P2, évaluée à la date/heure choisie
// (positif dans le futur de P1, négatif avant).
function numeroAutomatique() {
  const t = dateDesReglages().getTime();
  return Math.round(P1.num + DEBIT_PAR_MS * (t - P1.date.getTime()));
}

function majNumeroAuto() {
  elNum.value = String(numeroAutomatique());
  validerNumero();
}

function validerNumero() {
  const n = parseInt(elNum.value, 10);
  const ok = Number.isInteger(n) && n > 0;
  elNum.classList.toggle("erreur", !ok);
  elAide.classList.toggle("erreur", !ok);
  elAide.textContent = ok
    ? `Calculé d'après la date/heure du ticket (≈ ${DEBIT_PAR_MIN.toFixed(1)} factures/min, calé sur 2 factures réelles). Modifiable à la main.`
    : `Numéro invalide.`;
  return ok;
}

// Init
remplirDateHeureMaintenant();
majNumeroAuto();

// La date / l'heure changent -> on recalcule le numéro
elDate.addEventListener("input", majNumeroAuto);
elHeure.addEventListener("input", majNumeroAuto);
// Édition manuelle du numéro : on valide sans l'écraser
elNum.addEventListener("input", validerNumero);

// ---- Génération du PDF (reproduit le ticket LUCIE) ----
function genererPDF() {
  if (!validerNumero()) {
    elNum.focus();
    return;
  }
  // Hauteur de page calculée d'après le nombre d'articles : le ticket s'arrête
  // juste sous le trait des totaux (pas de bloc CB -> pas d'espace vide en bas).
  // Largeur 612 pt (comme l'original) ; coordonnées calquées sur le ticket LUCIE.
  const articles = [...panier.values()];
  const yDernierArticle = 311.8 + 25 * (articles.length - 1);
  const yTTC = yDernierArticle + 66.8;
  const yLigne = yTTC + 112.4;
  const hauteur = yLigne + 28; // petite marge basse

  // orientation choisie pour empêcher jsPDF d'inverser largeur/hauteur :
  // on veut toujours 612 pt de large, quelle que soit la hauteur.
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: hauteur > 612 ? "portrait" : "landscape",
    unit: "pt",
    format: [612, hauteur],
  });

  // Prix au format de l'original : point décimal + " €"
  const euro = (n) => n.toFixed(2) + " €";
  const NOIR = [0, 0, 0];
  const VERT = [53, 118, 74];
  const ORANGE = [241, 135, 0];

  // --- En-tête : logo à gauche ---
  if (logoDataURL) {
    try { doc.addImage(logoDataURL, "JPEG", 25, 40, 201.7, 118.4); } catch (e) {}
  }

  // --- Coordonnées du commerce (alignées à droite, bord x=600) ---
  const droite = 600;
  doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(...NOIR);
  doc.text(COMMERCE.nom, droite, 53.6, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(17);
  doc.text(COMMERCE.siret, droite, 82.7, { align: "right" });
  doc.text(COMMERCE.adresse1, droite, 104.7, { align: "right" });
  doc.text(COMMERCE.adresse2, droite, 126.7, { align: "right" });
  doc.setFont("helvetica", "bold").setTextColor(...VERT);
  doc.text(COMMERCE.tel, droite, 148.7, { align: "right" });

  // --- Titre facture (orange, centré) ---
  // Numéro réellement utilisé = numéro affiché, rendu unique (anti-collision).
  const num = reserverNumeroUnique(parseInt(elNum.value, 10));
  elNum.value = String(num);
  const d = dateFR(dateDesReglages());
  doc.setFont("helvetica", "bold").setFontSize(20).setTextColor(...ORANGE);
  doc.text(`Facture n°${num} — ${d.texte}`, 300, 225.5, { align: "center" });

  // --- En-tête du tableau ---
  // Bord droit commun : "PRIX" et tous les montants € sont alignés à droite sur x=580
  // (l'encre du € atteint déjà ce bord, vérifié au pixel près sur le ticket d'origine).
  const xPrix = 580;
  doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(...NOIR);
  doc.text("DÉNOMINATION PRODUIT", 62.5, 280);
  doc.text("QUANTITÉ", 375, 280, { align: "center" });
  doc.text("PRIX", xPrix, 280, { align: "right" });

  // --- Lignes d'articles ---
  doc.setFont("helvetica", "normal").setFontSize(16);
  let y = 311.8;
  for (const a of articles) {
    doc.text(a.nom, 15, y);
    doc.text(String(a.qte), 375, y, { align: "center" });
    doc.text(euro(a.prix * a.qte), xPrix, y, { align: "right" });
    y += 25;
  }

  // --- Totaux (positionnés sous le dernier article, espacements de l'original) ---
  const ttc = totalTTC();
  const taux = COMMERCE.tauxTVA;
  const ht = ttc / (1 + taux / 100);
  const tva = ttc - ht;

  const ligne = (label, valeur, gras, yy) => {
    const taille = gras ? 18 : 15;
    doc.setFont("helvetica", gras ? "bold" : "normal").setFontSize(taille);
    doc.setTextColor(...NOIR);
    doc.text(label, 15, yy);
    if (valeur != null) doc.text(euro(valeur), xPrix, yy, { align: "right" });
  };

  ligne("Montant total TTC", ttc, true, yTTC);
  ligne("Montant total HT", ht, false, yTTC + 19.3);
  ligne(`Taux de TVA ${taux} %`, null, true, yTTC + 52.0);
  ligne(`Montant total TVA ${taux} %`, tva, false, yTTC + 71.3);
  ligne("Montant total TVA", tva, true, yTTC + 104.0);

  // trait de séparation sous les totaux (épaisseur ~1 pt comme l'original)
  doc.setDrawColor(90, 90, 90).setLineWidth(1.1);
  doc.line(15, yLigne, 600, yLigne);

  doc.save(`Ticket_Lucie_${num}.pdf`);
}

// ---- Branchements ----
document.getElementById("btnPdf").addEventListener("click", genererPDF);
document.getElementById("btnVider").addEventListener("click", () => {
  panier.clear();
  rendreMenu();
  majPanier();
});
document.getElementById("toggleDetail").addEventListener("click", (e) => {
  const d = document.getElementById("detailPanier");
  const ouvert = d.classList.toggle("ouvert");
  e.target.textContent = ouvert ? "Masquer le détail" : "Voir le détail";
});

// ---- Init ----
rendreMenu();
majPanier();
