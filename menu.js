// Menu — issu de la feuille Google Sheets (prix en euros).
// Le taux de TVA restauration à emporter est 5,5 %.
// Pour modifier : éditez les listes ci-dessous.
const MENU = [
  {
    categorie: "Plats Chaud",
    articles: [
      { nom: "Tajine poulet, olive, citron confit", prix: 6.5 },
      { nom: "Poulet Tandoori, Dahl de lentilles, Riz", prix: 6.5 },
      { nom: "Porc Caramel", prix: 6.5 },
      { nom: "Nouilles Udon, brochette Yakitori", prix: 6.5 },
      { nom: "Lasagnes de boeuf 355g", prix: 5.5 },
      { nom: "Gyoza Bowl", prix: 6.0 },
      { nom: "Filet de poulet sauce tartufata", prix: 6.5 },
      { nom: "Cannelloni Ricotta Epinard 365g", prix: 5.5 },
      { nom: "Pasta Tartufata", prix: 5.0 },
      { nom: "Pasta Saumon crème de Parmesan", prix: 5.0 },
      { nom: "Pasta Gorgonzola", prix: 5.0 },
      { nom: "Pasta Carbonara", prix: 5.0 },
      { nom: "Pasta Bolognese", prix: 5.0 },
      { nom: "Aligot saucisse", prix: 4.5 },
    ],
  },
  {
    categorie: "Sushis",
    articles: [
      { nom: "Plateau Tottori - 9 pcs", prix: 9.0 },
      { nom: "Plateau Osaka - 19 pcs", prix: 14.0 },
      { nom: "Plateau Okinawa - 9 pcs", prix: 9.0 },
      { nom: "Plateau Hiro - 17 pcs", prix: 15.0 },
      { nom: "Maki Kawa - 8 pcs", prix: 4.5 },
      { nom: "Maki California Saumon - 6 pcs", prix: 5.0 },
      { nom: "Dragon Veggie Mangue", prix: 5.5 },
      { nom: "Dragon Saumon Avocat - cc", prix: 5.5 },
      { nom: "Dragon Poulet Spicy", prix: 5.5 },
    ],
  },
  {
    categorie: "Pokebowl",
    articles: [
      { nom: "Pokebowl Saumon épicé", prix: 7.5 },
      { nom: "Pokebowl Sashimi", prix: 7.5 },
    ],
  },
  {
    categorie: "Salades",
    articles: [
      { nom: "Salade Thaï Boeuf", prix: 7.5 },
      { nom: "Salade quinoa, abricot, feta", prix: 6.5 },
      { nom: "Salade poulet rôti, oeuf, estragon", prix: 6.5 },
      { nom: "Salade Pesto Stracciatella Pistache", prix: 6.5 },
      { nom: "Salade Bo Bùn", prix: 6.5 },
    ],
  },
  {
    categorie: "Encas Salés",
    articles: [
      { nom: "Tomate, pesto, stracciatella", prix: 3.5 },
      { nom: "Mini salade de chou", prix: 2.0 },
      { nom: "Insalata verde, petit pois, feta", prix: 3.5 },
      { nom: "Insalata rossa, poivron confit, ricotta", prix: 3.5 },
      { nom: "Gyoza Porc Gingembre", prix: 3.5 },
      { nom: "Gyoza Crevette Combawa", prix: 3.5 },
      { nom: "Gaspacho Tomate, Paprika", prix: 2.5 },
      { nom: "Chirashi de saumon", prix: 5.5 },
      { nom: "Ceviche de saumon, leche de tigre", prix: 5.5 },
    ],
  },
  {
    categorie: "Encas Sucrés",
    articles: [
      { nom: "Trio de fruits", prix: 3.5 },
      { nom: "Pastidélice", prix: 6.0 },
      { nom: "Cestini Praliné-Noisette", prix: 4.5 },
      { nom: "Cestini Pistache", prix: 4.5 },
      { nom: "Cestini Chocolat-Noisette", prix: 4.5 },
      { nom: "Cestini Cacahuète", prix: 4.5 },
      { nom: "Yaourt à la grecque et granola", prix: 2.0 },
      { nom: "Tiramisu", prix: 2.5 },
      { nom: "Riz au lait vanille", prix: 2.5 },
      { nom: "Mousse au chocolat", prix: 2.5 },
      { nom: "Melon, Pastèque", prix: 3.5 },
      { nom: "Gâteau basque à la crème individuel", prix: 2.5 },
      { nom: "Chia Pudding Mangue", prix: 2.5 },
      { nom: "Cheesecake spéculoos", prix: 2.5 },
      { nom: "Carrot Cake", prix: 2.5 },
    ],
  },
  {
    categorie: "Boissons",
    articles: [
      { nom: "Thé vert glacé Menthe-Citron", prix: 2.5 },
      { nom: "Thé blanc glacé Pèche Hibiscus", prix: 2.5 },
      { nom: "Smoothie Mangue-Passion", prix: 2.5 },
      { nom: "Smoothie Fraise-Pomme", prix: 2.5 },
      { nom: "Eau Plate", prix: 1.5 },
      { nom: "Eau Pétillante", prix: 1.5 },
      { nom: "Coca-Cola Zéro 50cl", prix: 2.0 },
      { nom: "Coca-Cola 50cl", prix: 2.0 },
    ],
  },
];

// Coordonnées du commerce (en-tête du ticket)
const COMMERCE = {
  nom: "LUCIE Ultrafrais — Gaillac - St Exupéry",
  siret: "SIRET : 977 672 732 00053",
  adresse1: "126 Avenue St Exupéry",
  adresse2: "81600 GAILLAC, France",
  tel: "06.85.52.08.32",
  tauxTVA: 5.5,
};
