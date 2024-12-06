// constants.js
export const api_srv = 'http://localhost:4000';

export const appreciationLabels = ["NA", "PA", "A", "LA"];

export const visibleCategories = {
   PROFESSIONNELLES: true,
   METHODOLOGIQUES: true,
   SOCIALES: true
};

export let isVisibleState = {
   'student-info': true,
   'professionnelles-container': true,
   'methodologiques-container': true,
   'sociales-container': true,
};

export const criteria = [
   {
      id: 1,
      name: 'Cadence de travail',
      category: 'PROFESSIONNELLES',
      description: 'Évalue la régularité et la constance dans l\'exécution des tâches.'
   },
   {
      id: 2,
      name: 'Qualité de la production',
      category: 'PROFESSIONNELLES',
      description: 'Mesure la qualité et la précision du travail effectué.'
   },
   {
      id: 3,
      name: 'Compétence technique',
      category: 'PROFESSIONNELLES',
      description: 'Évalue le niveau de maîtrise des compétences techniques requises pour le poste.'
   },
   {
      id: 4,
      name: 'Indépendance',
      category: 'PROFESSIONNELLES',
      description: 'Mesure la capacité à travailler de manière autonome sans supervision constante.'
   },
   {
      id: 5,
      name: 'Méthodologie de travail',
      category: 'METHODOLOGIQUES',
      description: 'Évalue l\'efficacité et l\'organisation des processus de travail.'
   },
   {
      id: 6,
      name: 'Communication verbale et écrite',
      category: 'METHODOLOGIQUES',
      description: 'Mesure la clarté et l\'efficacité de la communication orale et écrite.'
   },
   {
      id: 7,
      name: 'Innovation et durabilité',
      category: 'METHODOLOGIQUES',
      description: 'Évalue la capacité à innover et à intégrer des pratiques durables dans le travail.'
   },
   {
      id: 8,
      name: 'Capacité à travailler en équipe',
      category: 'SOCIALES',
      description: 'Mesure l\'aptitude à collaborer efficacement avec les membres de l\'équipe.'
   }
];


// Ici, je devrais être capable de récupérer la liste des projets de Jonathan
export const projects = [
   { id: 1, name: 'Gestionnaire de mots de passe', description: 'Une application sécurisée pour gérer et stocker les mots de passe.' },
   { id: 2, name: 'Site de E-commerce', description: 'Une plateforme en ligne pour la vente de produits et services.' },
   { id: 3, name: 'Application mobile de gestion', description: 'Une application mobile pour la gestion des tâches et des projets.' }
];

export const evaluators = [
   { name: 'HCS' },
   { name: 'AGX' },
   { name: 'AGT' }
];

export const classe = [
   { name: 'MSIG' },
   { name: 'CID2A' }, { name: 'CID2B' }, { name: 'CID3A' }, { name: 'CID3B' },
   { name: 'CIN1A' }, { name: 'CIN1B' }, { name: 'CIN1C' },
   { name: 'MIN1A' }, { name: 'MIN1B' }, { name: 'MIN2A' }, { name: 'MIN2B' },
   { name: 'CIN2A' }, { name: 'CIN2B' }, { name: 'MID2A' }, { name: 'MID2B' },
   { name: 'CIN3' }, { name: 'MID3' }, { name: 'FID1' }, { name: 'FID2' },
   { name: 'FIN1' }, { name: 'FIN2' }, { name: 'MIN3' }
]


// Objet de standard de sauvegarde des données d'évaluation des étudiants
export let jsonSave = {
   evaluator: "",         // Évaluateurs du projet
   projetName: "",         // Nom du projet d'évaluation
   studentLastName: "",    // Nom de famille de l'étudiant
   studentFirstName: "",   // Prénom de l'étudiant
   studentClass: "",       // Classe de l'étudiant
   studentRemark: "",      // Remarques générales sur l'étudiant
   appreciations: [        // Tableau contenant les appréciations par niveau
      {
         date: "",         // Date de l'appréciation
         criteria: [      // Tableau des critères pour ce niveau d'appréciation
            {
               id: "",     // Identifiant unique du critère
               name: "",   // Nom du critère (rythme, maîtrise, qualité, etc.)
               value: ""   // Valeur de l'appréciation pour ce critère (na, pa, a, la)
            }
         ]
      }
   ]
};
