import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const DATA = {"cascade": [{"niveau": 0, "code": "EAU", "label": "Eau", "sous_label": "Disponibilité et continuité hydraulique", "logique": "Sans eau disponible à un potentiel > pF 4,2, toute activité biologique s'arrête. C'est le prérequis absolu de tout le reste.", "indicateurs": ["pF (potentiel hydrique)", "Réserve Utile (RU)", "Ksat (conductivité hydraulique saturée)", "Connectivité des films d'eau", "Biopores fonctionnels"], "leviers": ["Biopuncture (radis daïkon, mélilot)", "Mulch permanent (réduction évaporation 30–70%)", "Réduction du labour (préservation biopores)", "Keyline Design (redistribution topographique)", "+1% MO → +2 mm/m RU"], "erreurs": ["Sécheresse persistante malgré des apports", "Engorgement hivernal récurrent", "Infiltration nulle après pluie (battance)", "Hydrophobie post-sécheresse"]}, {"niveau": 1, "code": "STRUCT", "label": "Structure physique", "sous_label": "Habitat — la maison des micro-organismes", "logique": "Sans structure stable (micro-agrégats, porosité hiérarchisée), les micro-organismes n'ont pas d'habitat protégé. Même si l'eau est disponible, la biologie ne peut pas s'installer durablement.", "indicateurs": ["VESS (Visual Evaluation of Soil Structure)", "Stabilité des agrégats", "Test infiltration (macroporosité)", "Test ficelle GEPPA (texture)", "Densité apparente"], "leviers": ["Non-labour ou travail superficiel", "Couverts permanents (production EPS racinaire)", "Apports calciques (floculation argiles)", "Vers anéciques (galeries persistantes)", "Apports fermentés en surface (biofilms structurants)"], "erreurs": ["Compaction (semelle de labour)", "Battance et croûte de surface", "Agrégats instables (slaking)", "Racines superficielles sans obstacle chimique"]}, {"niveau": 2, "code": "REDOX", "label": "Redox & Chimie", "sous_label": "Le contexte physico-chimique — pH, Eh, CEC", "logique": "Même si l'eau et la structure sont bonnes, un pH ou un Eh inadapté bloque les voies enzymatiques microbiennes et la disponibilité des nutriments. La chimie détermine quelles voies métaboliques sont thermodynamiquement possibles.", "indicateurs": ["pH eau et KCl", "Potentiel redox Eh (mV)", "CEC + taux de saturation", "P Olsen (phosphore disponible)", "Calcaire actif (% CaCO3)", "Eh gradient (microsites)"], "leviers": ["Chaulage raisonné (pH < 5,8)", "Réduction apports P solubles (si > 60 mg/kg)", "Gestion hydrique (éviter engorgement)", "Soufre et bore à faibles doses (si carences répétées)", "Calcium échangeable fonctionnel"], "erreurs": ["pH < 5,5 (aluminium toxique)", "P Olsen > 60 — CMA inhibées", "Asphyxie locale (Eh < 100 mV)", "Calcaire actif élevé — chlorose ferrique", "Salinité excessive"]}, {"niveau": 3, "code": "MO", "label": "MO & Plante", "sous_label": "La nourriture — substrat et exsudats", "logique": "Sans substrat carboné (MO) ni exsudats racinaires actifs (plante vivante), le microbiome entre en dormance. C'est le flux d'énergie qui maintient le réseau biologiquement actif.", "indicateurs": ["COS % (carbone organique total)", "C/N ratio", "k1 (coefficient d'humification)", "k2 (taux minéralisation humus)", "LAI (Indice Aire Foliaire)", "Allocation C exsudats (5–40% photosynthèse)", "Respiration du sol (FDA)"], "leviers": ["Couvert végétal permanent (exsudats en continu)", "Apports MO à k1 élevé (fumier composté, légumineuses)", "Bokashi (k1 biologique ~48%)", "Diversité du couvert (diversité exsudats → diversité microbienne)", "Réduction du travail du sol (protection k2)"], "erreurs": ["Faim d'azote après apport C élevé (paille, BRF)", "Sol nu en inter-culture (pas d'exsudats)", "Minéralisation accélérée après labour (k2 élevé)", "Priming effect mal géré (perte C stable)"]}, {"niveau": 4, "code": "MICROBIOME", "label": "Microbiome", "sous_label": "Les habitants — guildes, diversité, fonctions", "logique": "Si les 4 prérequis précédents sont satisfaits, le microbiome peut s'installer et jouer ses rôles fonctionnels (minéralisation, suppressivité, ISR, CMN). Sa dégradation est toujours la conséquence d'une défaillance en amont — jamais la cause première.", "indicateurs": ["Ratio F/B (PLFA)", "Diversité Chao1 (métagénomique)", "Biomasse microbienne ATP", "β-glucosidase + phosphatase + uréase", "Suppressivité (tests bioassay)", "Ratio copiotrophes/oligotrophes"], "leviers": ["Correction des prérequis 0–3 en priorité", "Inoculation ciblée (PGPR, CMA selon PLFA)", "Bokashi / EM (réintroduction consortia)", "Couverts multi-espèces (diversité exsudats)", "IMO local (capture microbiome natif)"], "erreurs": ["Ratio F/B < 0,3 (agriculture intensive)", "Perte de suppressivité après désinfection", "Copiotrophes dominants (excès N minéral)", "Faible diversité sans explication chimique (chercher prérequis 0–3)"]}, {"niveau": 5, "code": "PLANTE", "label": "Plante saine", "sous_label": "L'output — densité nutritionnelle, résilience, rendement", "logique": "La plante saine est le résultat des 5 niveaux précédents satisfaits. Un problème à ce niveau est toujours le signal d'une défaillance en amont — il ne faut jamais traiter les symptômes sans remonter la cascade.", "indicateurs": ["ISR/SAR actif (polyphénols ×1,3–1,5)", "Densité nutritionnelle (Zn, Fe, Mg, vitamines B)", "Taux Brix (sucres foliaires)", "Absence de carences visuelles", "Résistance aux ravageurs (Trophobiose)"], "leviers": ["Remonter la cascade et corriger le prérequis défaillant", "Ne PAS traiter le symptôme (fongicide, insecticide) sans diagnostic amont", "Mesurer le Brix comme proxy rapide de l'état du sol"], "erreurs": ["Carences récurrentes malgré apports", "Sensibilité accrue aux ravageurs (Trophobiose)", "Rendement normal mais densité nutritionnelle faible (Growth Dilution Effect)", "Plante stressée sans explication climatique"]}], "chains": [{"id": "C1", "titre": "Photosynthèse du couvert → Immunité intestinale humaine", "docs": "P2/S4/S2/S3/V2/V3/H1/H3", "va": "Argument le plus puissant pour les décideurs publics : un choix de couvert impacte la santé humaine via 7 étapes documentées. La politique agricole est une politique de santé publique.", "etapes": [{"pos": 1, "term": "[P2]", "strate": "P2", "role": "Design couvert multi-espèces (10-12 sp.) fixant le C par photosynthèse"}, {"pos": 2, "term": "[S4]", "strate": "S4", "role": "Exsudats racinaires → pompe microbienne à carbone, CUE augmentée"}, {"pos": 3, "term": "[S2]", "strate": "S2", "role": "Diversification guildes bactériennes, turnover microbien, nécromasse"}, {"pos": 4, "term": "[S3]", "strate": "S3", "role": "Développement CMA/CMN → transport P, Zn, Cu vers les plantes"}, {"pos": 5, "term": "[V2]", "strate": "V2", "role": "Recrutement PGPR/endophytes, activation ISR/SAR, production polyphénols"}, {"pos": 6, "term": "[V3]", "strate": "V3", "role": "Production vitamines B et métabolites secondaires rhizosphériques"}, {"pos": 7, "term": "[H1]", "strate": "H1", "role": "Augmentation densité nutritionnelle (antioxydants, minéraux, vitamines B)"}, {"pos": 8, "term": "[H3]", "strate": "H3", "role": "Transfert endophytes → microbiome intestinal via alimentation"}]}, {"id": "C2", "titre": "Haber-Bosch → Maladie chronique (chaîne de dégradation)", "docs": "F2/S2/S3/S4/V2/H1/H2/H3", "va": "Démontre que chaque maillon de la dégradation a un coût caché. Argument systémique pour dépasser la vision cloisonnée agriculture/santé/environnement.", "etapes": [{"pos": 1, "term": "[F2]", "strate": "F2", "role": "Azote Haber-Bosch → EROI faible ou négatif, dépendance fossile"}, {"pos": 2, "term": "[S2]", "strate": "S2", "role": "Déséquilibre copiotrophes/oligotrophes, effondrement diversité microbienne"}, {"pos": 3, "term": "[S3]", "strate": "S3", "role": "Dégradation réseaux CMA par excès N et P solubles, perte GRSP"}, {"pos": 4, "term": "[S4]", "strate": "S4", "role": "Priming Effect sur COS, déstockage carbone stable"}, {"pos": 5, "term": "[V2]", "strate": "V2", "role": "Loi de la Trophobiose : excès acides aminés libres, vulnérabilité ravageurs"}, {"pos": 6, "term": "[H1]", "strate": "H1", "role": "Dilution de la densité nutritionnelle (croissance rapide sans synthèse complète)"}, {"pos": 7, "term": "[H2]", "strate": "H2", "role": "Pression de sélection ARG par usage compensatoire antibiotiques/fongicides"}, {"pos": 8, "term": "[H3]", "strate": "H3", "role": "Appauvrissement microbiome intestinal humain"}]}, {"id": "C3", "titre": "Bokashi → Suppressivité du sol", "docs": "P3/V3/S2/S4/S3/V2/P1", "va": "Donne un fondement mécaniste aux biostimulants fermentés. Permet de prédire quand le Bokashi sera efficace vs risqué (sol riche en COS → risque Priming Effect).", "etapes": [{"pos": 1, "term": "[P3]", "strate": "P3", "role": "Application Bokashi (substrat fermenté LAB/levures/PNSB)"}, {"pos": 2, "term": "[V3]", "strate": "V3", "role": "Métabolites actifs : acide 3-phényllactique, acides organiques, sidérophores"}, {"pos": 3, "term": "[S2]", "strate": "S2", "role": "Réintroduction consortia microbiens, compétition pour niches écologiques"}, {"pos": 4, "term": "[S4]", "strate": "S4", "role": "Modification Eh local, solubilisation P fixé sur oxydes Fe/Al"}, {"pos": 5, "term": "[S3]", "strate": "S3", "role": "Stimulation saprotrophes ligneux occupant la place des champignons pathogènes"}, {"pos": 6, "term": "[V2]", "strate": "V2", "role": "Activation ISR via métabolites microbiens perçus par les racines"}, {"pos": 7, "term": "[P1]", "strate": "P1", "role": "Mesure PLFA (ratio F/B amélioré) et VESS (amélioration structurale)"}]}, {"id": "C4", "titre": "Anaérobiose archéenne → Fermentations alimentaires modernes", "docs": "F1/S4/V3/P3/V2/H3/H1", "va": "Le récit fondateur du corpus : les fermentations ne sont pas une technique mais la réactivation du métabolisme le plus ancien de la biosphère. Différenciateur philosophique majeur.", "etapes": [{"pos": 1, "term": "[F1]", "strate": "F1", "role": "Vie primitive dans monde anoxique (3,8 Ga) — voies fermentaires originelles"}, {"pos": 2, "term": "[S4]", "strate": "S4", "role": "Conservation microsites anoxiques dans agrégats du sol actuel"}, {"pos": 3, "term": "[V3]", "strate": "V3", "role": "Thermodynamique fermentation (ΔG favorable à conservation C/N)"}, {"pos": 4, "term": "[P3]", "strate": "P3", "role": "Application via Bokashi/EM/IMO reproduisant conditions anaérobies contrôlées"}, {"pos": 5, "term": "[V2]", "strate": "V2", "role": "Endophytes racinaires conservant voies fermentaires dans tissus végétaux"}, {"pos": 6, "term": "[H3]", "strate": "H3", "role": "Microbiome intestinal majoritairement anaérobie — mêmes voies conservées"}, {"pos": 7, "term": "[H1]", "strate": "H1", "role": "Aliments fermentés (kimchi, kéfir...) réactivent voies métaboliques ancestrales"}]}, {"id": "C5", "titre": "Diagnostic terrain → Trajectoire économique", "docs": "P1/S2/S4/P2/P3/P5/F2", "va": "Le parcours praticien complet manquant dans le corpus : du diagnostic à la décision rentable. Chaîne indispensable pour que la transition soit économiquement pilotée.", "etapes": [{"pos": 1, "term": "[P1]", "strate": "P1", "role": "Diagnostic VESS + PLFA + Chao1 + COS"}, {"pos": 2, "term": "[S2]", "strate": "S2", "role": "Interprétation via guildes fonctionnelles et ratio copiotrophes/oligotrophes"}, {"pos": 3, "term": "[S4]", "strate": "S4", "role": "Positionnement sur courbe de stockage carbone (modèle RothC)"}, {"pos": 4, "term": "[P2]", "strate": "P2", "role": "Choix pratiques ACS adaptés au diagnostic (type couvert, stœchiométrie C/N)"}, {"pos": 5, "term": "[P3]", "strate": "P3", "role": "Choix biostimulants selon déficit microbien identifié (inoculation ciblée)"}, {"pos": 6, "term": "[P5]", "strate": "P5", "role": "Positionnement sur chronoséquence 4 phases, objectifs +0,1% MO/an"}, {"pos": 7, "term": "[F2]", "strate": "F2", "role": "Traduction économique : réduction charges, crédits carbone, capital biologique"}]}, {"id": "C6", "titre": "Diversité des couverts → Résilience immunitaire des populations", "docs": "P2/S2/S3/V2/H1/H3", "va": "L'argument le plus radical : un choix technique anodin (nb d'espèces dans un couvert) a des implications mesurables sur l'épidémiologie des maladies chroniques.", "etapes": [{"pos": 1, "term": "[P2]", "strate": "P2", "role": "Couvert multi-espèces saturant les niches écologiques"}, {"pos": 2, "term": "[S2]", "strate": "S2", "role": "Augmentation Chao1 et CUE par diversité des exsudats racinaires"}, {"pos": 3, "term": "[S3]", "strate": "S3", "role": "Renforcement CMN inter-espèces, suppressivité accrue"}, {"pos": 4, "term": "[V2]", "strate": "V2", "role": "Élicitation ISR/SAR par diversité microbienne, production métabolites défensifs"}, {"pos": 5, "term": "[H1]", "strate": "H1", "role": "Aliments plus riches en polyphénols, vitamines B, protection anti-inflammation"}, {"pos": 6, "term": "[H3]", "strate": "H3", "role": "Diversité microbienne transmise à l'intestin, réduction maladies auto-immunes"}]}], "documents": [{"code": "F1", "titre": "Le Temps Long", "strate": "F", "n_terms": 23, "n_sections": 13}, {"code": "F2", "titre": "L'Économie du Vivant", "strate": "F", "n_terms": 36, "n_sections": 10}, {"code": "H1", "titre": "Sol, Alimentation et Santé Humaine", "strate": "H", "n_terms": 19, "n_sections": 10}, {"code": "H2", "titre": "Le Microbiome Intestinal", "strate": "H", "n_terms": 16, "n_sections": 9}, {"code": "H3", "titre": "La Résistance Antimicrobienne", "strate": "H", "n_terms": 12, "n_sections": 7}, {"code": "P1", "titre": "Diagnostic du Sol Vivant", "strate": "P", "n_terms": 20, "n_sections": 12}, {"code": "P2", "titre": "Agriculture de Conservation", "strate": "P", "n_terms": 24, "n_sections": 11}, {"code": "P3", "titre": "Biostimulants et Fermentations Appliquées", "strate": "P", "n_terms": 19, "n_sections": 10}, {"code": "P4", "titre": "Agroforesterie et Systèmes Pérennes", "strate": "P", "n_terms": 16, "n_sections": 10}, {"code": "P5", "titre": "La Transition", "strate": "P", "n_terms": 17, "n_sections": 9}, {"code": "S0", "titre": "L'Eau dans le Sol Vivant", "strate": "S", "n_terms": 20, "n_sections": 12}, {"code": "S1", "titre": "Architecture du Sol", "strate": "S", "n_terms": 25, "n_sections": 12}, {"code": "S2", "titre": "Le Microbiome du Sol", "strate": "S", "n_terms": 61, "n_sections": 13}, {"code": "S3", "titre": "Le Microbiome Fongique et Mycorhizien", "strate": "S", "n_terms": 27, "n_sections": 12}, {"code": "S4", "titre": "Le Carbone et les Grands Cycles", "strate": "S", "n_terms": 50, "n_sections": 11}, {"code": "V1", "titre": "La Faune du Sol", "strate": "V", "n_terms": 19, "n_sections": 11}, {"code": "V2", "titre": "L'Holobionte Plante-Microbiome", "strate": "V", "n_terms": 35, "n_sections": 10}, {"code": "V3", "titre": "Les Fermentations Microbiennes", "strate": "V", "n_terms": 22, "n_sections": 11}], "zones": [{"zone": 4, "seuil": "<12%", "ca": "<1/13", "etat": "Sol effondré", "microbes": "Stratégie S", "cue": "Très faible", "action": "Travail sol, concentrer biomasse, exploiteuses"}, {"zone": 3, "seuil": "12-17%", "ca": "1/13–1/10", "etat": "Seuil critique", "microbes": "S→A", "cue": "Faible", "action": "Fissuration, NPS Kirkby, mélanges"}, {"zone": 2, "seuil": "17-24%", "ca": "1/10–1/8", "etat": "Faux plat", "microbes": "A→Y", "cue": "Forte", "action": "Zéro labour, foliaire, patience"}, {"zone": 1, "seuil": ">24%", "ca": ">1/8", "etat": "Sol régénéré", "microbes": "Stratégie Y", "cue": "Très forte", "action": "Maintenance, conservatrices, agroforesterie"}], "stats": {"n_terms": 371, "n_tables": 30, "n_docs": 18, "n_sections": 193, "n_chains": 6, "n_bq": 34, "n_tests": 20}, "strate_counts": {"F": 51, "H": 40, "META": 6, "P": 70, "S": 144, "V": 60}, "hydraulic": [{"era": "4 Ga", "actor": "Biofilms anaérobies", "role": "Rétention eau (EPS 97% eau structurée)", "icon": "🦠"}, {"era": "1 Ga", "actor": "Champignons saprotrophes", "role": "Transport eau par hyphes, culture bactéries", "icon": "🍄"}, {"era": "470 Ma", "actor": "CMA + Plantes", "role": "Livraison eau à la plante, photosynthèse", "icon": "🌱"}, {"era": "Annuel", "actor": "Litière (ration du sol)", "role": "Carburant des 3 étages", "icon": "🍂"}]};

const STRATE_COLORS = {
  F: "#8B5CF6", S: "#3B82F6", V: "#10B981", P: "#F59E0B", H: "#EF4444"
};
const STRATE_LABELS = {
  F: "Fondements", S: "Sol", V: "Vivant", P: "Pratiques", H: "Humain"
};
const ZONE_COLORS = ["#DC2626","#F97316","#EAB308","#22C55E"];

function Dashboard() {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {[
        { label: "Termes", value: DATA.stats.n_terms, icon: "📖" },
        { label: "Documents", value: DATA.stats.n_docs, icon: "📄" },
        { label: "Sections", value: DATA.stats.n_sections, icon: "§" },
        { label: "Chaînes", value: DATA.stats.n_chains + " (+3)", icon: "🔗" },
        { label: "Tables DB", value: DATA.stats.n_tables, icon: "🗄️" },
        { label: "Tests terrain", value: DATA.stats.n_tests, icon: "🧪" },
      ].map((s, i) => (
        <div key={i} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center gap-3">
          <span className="text-2xl">{s.icon}</span>
          <div>
            <div className="text-2xl font-bold text-gray-800">{s.value}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StrateChart() {
  const chartData = Object.entries(DATA.strate_counts).map(([k,v]) => ({
    name: STRATE_LABELS[k] || k, value: v, strate: k
  }));
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-6">
      <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Termes par strate</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{left:-10}}>
          <XAxis dataKey="name" tick={{fontSize:11}} />
          <YAxis tick={{fontSize:11}} />
          <Tooltip />
          <Bar dataKey="value" radius={[4,4,0,0]}>
            {chartData.map((d,i) => <Cell key={i} fill={STRATE_COLORS[d.strate] || "#6B7280"} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CascadeView() {
  const [open, setOpen] = useState(null);
  const colors = ["#3B82F6","#8B5CF6","#EC4899","#F59E0B","#10B981","#06B6D4"];
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 italic mb-2">Cliquez sur un niveau pour voir les détails</p>
      {DATA.cascade.map((lv, i) => (
        <div key={i} className="rounded-lg border overflow-hidden" style={{borderColor: colors[i]}}>
          <button onClick={() => setOpen(open===i?null:i)}
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors"
            style={{borderLeft: `4px solid ${colors[i]}`}}>
            <span className="text-xl font-bold" style={{color:colors[i]}}>N{lv.niveau}</span>
            <div className="flex-1">
              <div className="font-semibold text-gray-800">{lv.label}</div>
              <div className="text-xs text-gray-500">{lv.sous_label}</div>
            </div>
            <span className="text-gray-400">{open===i ? "▲" : "▼"}</span>
          </button>
          {open===i && (
            <div className="p-4 bg-gray-50 border-t text-sm space-y-3">
              <p className="text-gray-700">{lv.logique}</p>
              <div>
                <div className="font-semibold text-xs text-gray-500 uppercase mb-1">Indicateurs</div>
                <div className="flex flex-wrap gap-1">
                  {lv.indicateurs.map((ind,j) => (
                    <span key={j} className="bg-white border rounded px-2 py-0.5 text-xs text-gray-700">{ind}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-semibold text-xs text-gray-500 uppercase mb-1">Leviers d action</div>
                <ul className="space-y-1">
                  {lv.leviers.map((l,j) => (
                    <li key={j} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">→</span>{l}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-semibold text-xs text-gray-500 uppercase mb-1">Erreurs typiques</div>
                <ul className="space-y-1">
                  {lv.erreurs.map((e,j) => (
                    <li key={j} className="text-xs text-red-600 flex items-start gap-1">
                      <span className="mt-0.5">⚠</span>{e}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function HussonZones() {
  const [selected, setSelected] = useState(null);
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 italic mb-2">Modèle Husson (CIRAD) — Ratio MO/Argile</p>
      {DATA.zones.map((z, i) => (
        <button key={i} onClick={() => setSelected(selected===i?null:i)}
          className="w-full text-left rounded-lg border-2 p-3 transition-all hover:shadow-md"
          style={{borderColor: ZONE_COLORS[i], background: selected===i ? ZONE_COLORS[i]+"15" : "white"}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black" style={{color:ZONE_COLORS[i]}}>Z{z.zone}</span>
              <div>
                <div className="font-semibold text-gray-800">{z.etat}</div>
                <div className="text-xs text-gray-500">MO/Argile {z.seuil} — C/Argile {z.ca}</div>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-medium"
              style={{background: ZONE_COLORS[i]+"20", color: ZONE_COLORS[i]}}>
              {z.microbes}
            </span>
          </div>
          {selected===i && (
            <div className="mt-3 pt-3 border-t text-sm space-y-2">
              <div className="flex gap-4">
                <div><span className="text-xs text-gray-500">CUE:</span> <span className="font-medium">{z.cue}</span></div>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase">Actions recommandées:</span>
                <p className="text-gray-700 mt-1">{z.action}</p>
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

function ChainesView() {
  const [openChain, setOpenChain] = useState(null);
  return (
    <div className="space-y-3">
      {DATA.chains.map((c, i) => (
        <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
          <button onClick={() => setOpenChain(openChain===i?null:i)}
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50">
            <span className="bg-gray-800 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center">C{c.id}</span>
            <div className="flex-1">
              <div className="font-semibold text-gray-800 text-sm">{c.titre}</div>
              <div className="text-xs text-gray-400">{c.docs}</div>
            </div>
            <span className="text-gray-400 text-sm">{c.etapes.length} maillons</span>
          </button>
          {openChain===i && (
            <div className="p-4 bg-gray-50 border-t">
              <div className="space-y-2">
                {c.etapes.map((e, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5 flex-shrink-0"
                      style={{background: STRATE_COLORS[e.strate] || "#6B7280"}}>
                      {e.pos}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs px-1.5 py-0.5 rounded text-white mr-1"
                        style={{background: STRATE_COLORS[e.strate] || "#6B7280"}}>
                        {e.strate}
                      </span>
                      <span className="text-sm text-gray-700">{(e.role || '').substring(0, 100)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {c.va && <p className="mt-3 text-xs text-gray-500 italic border-t pt-2">{c.va.substring(0,200)}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function HydraulicView() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 italic">De LUCA au mulch annuel — la boucle de l eau dans le sol</p>
      <div className="relative">
        {DATA.hydraulic.map((h, i) => (
          <div key={i} className="flex items-center gap-4 mb-4">
            <div className="text-center w-16 flex-shrink-0">
              <div className="text-3xl">{h.icon}</div>
              <div className="text-xs font-bold text-gray-500 mt-1">{h.era}</div>
            </div>
            <div className="flex-1 bg-gradient-to-r from-blue-50 to-white rounded-lg p-3 border border-blue-100">
              <div className="font-semibold text-gray-800 text-sm">{h.actor}</div>
              <div className="text-xs text-gray-600 mt-1">{h.role}</div>
            </div>
            {i < DATA.hydraulic.length - 1 && (
              <div className="absolute left-8 text-blue-300 text-lg" style={{top: `${(i+1)*76-10}px`}}>↓</div>
            )}
          </div>
        ))}
        <div className="flex items-center justify-center mt-2">
          <div className="bg-blue-100 rounded-full px-4 py-2 text-xs text-blue-700 font-medium">
            ↻ Boucle fermée — chaque étage nourrit les autres
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentsView() {
  return (
    <div className="space-y-1">
      {DATA.documents.map((d, i) => (
        <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50">
          <span className="w-8 h-5 rounded text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
            style={{background: STRATE_COLORS[d.strate] || "#6B7280"}}>
            {d.code}
          </span>
          <span className="flex-1 text-sm text-gray-700 truncate">{d.titre}</span>
          <span className="text-xs text-gray-400 flex-shrink-0">{d.n_terms}t · {d.n_sections}§</span>
        </div>
      ))}
    </div>
  );
}

const TABS = [
  { id: "dashboard", label: "Vue d ensemble", icon: "📊" },
  { id: "cascade", label: "Cascade N0-N5", icon: "⛰️" },
  { id: "zones", label: "Zones Husson", icon: "🎯" },
  { id: "chains", label: "Chaînes causales", icon: "🔗" },
  { id: "hydraulic", label: "Cascade hydraulique", icon: "💧" },
  { id: "docs", label: "Documents", icon: "📄" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-4">
        <h1 className="text-lg font-bold">Le Sol Vivant cet Holobionte</h1>
        <p className="text-xs text-gray-400 mt-0.5">Explorateur interactif — {DATA.stats.n_terms} termes · {DATA.stats.n_docs} documents · {DATA.stats.n_chains}+3 chaînes</p>
      </div>
      <div className="flex overflow-x-auto border-b bg-white">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={"flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors " +
              (tab===t.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700")}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
      <div className="p-4 max-w-2xl mx-auto">
        {tab==="dashboard" && <><Dashboard /><StrateChart /></>}
        {tab==="cascade" && <CascadeView />}
        {tab==="zones" && <HussonZones />}
        {tab==="chains" && <ChainesView />}
        {tab==="hydraulic" && <HydraulicView />}
        {tab==="docs" && <DocumentsView />}
      </div>
      <div className="text-center py-3 text-xs text-gray-400">
        sol_vivant.db · {DATA.stats.n_tables} tables · Mars 2026
      </div>
    </div>
  );
}
