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

// ---- Numéro de facture : dernier numéro utilisé (persistant) ----
const CLE_DERNIER_NUM = "lucie_facture_num";
function dernierNumero() {
  return parseInt(localStorage.getItem(CLE_DERNIER_NUM) || "1247064", 10);
}
function enregistrerDernierNumero(n) {
  localStorage.setItem(CLE_DERNIER_NUM, String(n));
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

// ---- Réglages du ticket (n° de facture, date, heure) ----
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

function reglerNumeroParDefaut() {
  const suivant = dernierNumero() + 1;
  elNum.min = String(suivant);
  elNum.value = String(suivant);
  validerNumero();
}

function validerNumero() {
  const n = parseInt(elNum.value, 10);
  const mini = dernierNumero() + 1;
  let ok = true;
  if (!Number.isInteger(n) || n <= dernierNumero()) ok = false;
  elNum.classList.toggle("erreur", !ok);
  elAide.classList.toggle("erreur", !ok);
  elAide.textContent = ok
    ? `Dernier ticket émis : n°${dernierNumero()}. Ce numéro doit rester unique et croissant.`
    : `Le numéro doit être supérieur au précédent (≥ ${mini}).`;
  return ok;
}

// Construit un objet Date à partir des champs date + heure (ou maintenant)
function dateDesReglages() {
  if (!elDate.value || !elHeure.value) return new Date();
  const [a, m, j] = elDate.value.split("-").map(Number);
  const [h, mi] = elHeure.value.split(":").map(Number);
  return new Date(a, m - 1, j, h, mi);
}

// Init des champs au démarrage
reglerNumeroParDefaut();
remplirDateHeureMaintenant();

elNum.addEventListener("input", validerNumero);
document.getElementById("btnReglages").addEventListener("click", () => {
  document.getElementById("overlay").hidden = false;
});
document.getElementById("btnFermerReglages").addEventListener("click", () => {
  if (!validerNumero()) return; // empêche de fermer avec un n° invalide
  document.getElementById("overlay").hidden = true;
});
document.getElementById("btnMaintenant").addEventListener("click", remplirDateHeureMaintenant);
document.getElementById("overlay").addEventListener("click", (e) => {
  if (e.target.id === "overlay" && validerNumero())
    document.getElementById("overlay").hidden = true;
});

// ---- Génération du PDF (reproduit le ticket LUCIE) ----
function genererPDF() {
  if (!validerNumero()) {
    document.getElementById("overlay").hidden = false;
    return;
  }
  // Page US Legal (612 x 1008 pt) — coordonnées calquées sur le ticket LUCIE d'origine.
  // Tout est en points (pt), origine en haut à gauche, y = ligne de base du texte.
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: [612, 1008] });

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
  const num = parseInt(elNum.value, 10);
  const d = dateFR(dateDesReglages());
  doc.setFont("helvetica", "bold").setFontSize(20).setTextColor(...ORANGE);
  doc.text(`Facture n°${num} — ${d.texte}`, 300, 225.5, { align: "center" });

  // --- En-tête du tableau ---
  doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(...NOIR);
  doc.text("DÉNOMINATION PRODUIT", 62.5, 280);
  doc.text("QUANTITÉ", 375, 280, { align: "center" });
  doc.text("PRIX", 580, 280, { align: "right" });

  // --- Lignes d'articles ---
  doc.setFont("helvetica", "normal").setFontSize(16);
  let y = 311.8;
  for (const a of panier.values()) {
    doc.text(a.nom, 15, y);
    doc.text(String(a.qte), 375, y, { align: "center" });
    doc.text(euro(a.prix * a.qte), 571, y, { align: "right" });
    y += 25;
  }
  const yDernierArticle = y - 25;

  // --- Totaux (positionnés sous le dernier article, espacements de l'original) ---
  const ttc = totalTTC();
  const taux = COMMERCE.tauxTVA;
  const ht = ttc / (1 + taux / 100);
  const tva = ttc - ht;

  const ligne = (label, valeur, gras, yy) => {
    doc.setFont("helvetica", gras ? "bold" : "normal").setFontSize(gras ? 18 : 15);
    doc.setTextColor(...NOIR);
    doc.text(label, 15, yy);
    if (valeur != null) doc.text(euro(valeur), 571, yy, { align: "right" });
  };

  const yTTC = yDernierArticle + 66.8;
  ligne("Montant total TTC", ttc, true, yTTC);
  ligne("Montant total HT", ht, false, yTTC + 19.3);
  ligne(`Taux de TVA ${taux} %`, null, true, yTTC + 52.0);
  ligne(`Montant total TVA ${taux} %`, tva, false, yTTC + 71.3);
  ligne("Montant total TVA", tva, true, yTTC + 104.0);

  // trait de séparation sous les totaux (x 15 -> 600)
  const yLigne = yTTC + 112.4;
  doc.setDrawColor(150, 150, 150).setLineWidth(0.7);
  doc.line(15, yLigne, 600, yLigne);

  doc.save(`Ticket_Lucie_${num}.pdf`);

  // Le numéro vient d'être utilisé : il devient le dernier émis,
  // et le champ propose automatiquement le suivant.
  enregistrerDernierNumero(num);
  reglerNumeroParDefaut();
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
