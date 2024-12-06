import { api_srv, criteria, appreciationLabels, jsonSave, visibleCategories } from './constants.js';
import { CLASSES, IDS } from './domElements.js'

// Un tableau pour suivre les critères exclus 
let excludedCriteria = [];

// Par défaut, l'onglet actif est l'auto-évaluation
let currentTab = 'auto';

// un objet pour suivre les evaluations selon le niveau
let sliderValues = {
   auto: {},
   formative: {},
   sommative: {}
};


// Fonction pour gérer la sélection des options 
export function handleSelection(nameSelection) {
   const projectSelect = document.getElementById(`${nameSelection}-select`);
   const projectNameInput = document.getElementById(`${nameSelection}-name`);

   if (projectSelect.value === 'other') {
      projectNameInput.style.display = 'block';
      projectSelect.style.display = 'none';
      projectNameInput.value = '';
      // Focus sur l'input texte pour plus de convivialité
      projectNameInput.focus();
   } else {
      projectNameInput.style.display = 'none';
      projectNameInput.value = projectSelect.value;
   }
}

// Fonction pour charger une évaluation du localStorage
export function initLoad() {
   // Si le localStorage contient currentEval
   const currentEval = localStorage.getItem('currentEval');

   if (currentEval) {
      try {
         const jsonSave = JSON.parse(currentEval);
         updateDOMWithData(jsonSave);
      } catch (e) {
         console.error("Erreur lors du chargement des données du localStorage : ", e);
         alert("Erreur lors du chargement des données du localStorage. Veuillez vérifier le format des données.");
      }
   }
}

// Fonction pour valider les données
export function onValidation() {
   const nbrCriterias = 8; // Nombre total de critères

   // Récupération des données générales
   jsonSave.projetName = document.getElementById(IDS.PROJECT_NAME)?.value || "";
   jsonSave.studentLastName = document.getElementById(IDS.STUDENT_LASTNAME)?.value || "";
   jsonSave.studentFirstName = document.getElementById(IDS.STUDENT_FIRSTNAME)?.value || "";
   jsonSave.studentRemark = document.getElementById(IDS.REMARKS)?.value || "";
   jsonSave.studentClass = document.getElementById(IDS.STUDENT_CLASS)?.value || "";
   jsonSave.evaluator = document.getElementById(IDS.TEACHER_NAME)?.value || "";

   const evalDate = document.getElementById(IDS.EVALUATION_DATE).value;

   // Récupération du niveau actuel
   const level = getEvaluationLevel(currentTab);
   if (level === -1) {
      alert("Niveau invalide !");
      return;
   }

   // Initialiser l'objet `appreciations[level]` s'il n'existe pas
   if (!jsonSave.appreciations[level]) {
      jsonSave.appreciations[level] = { date: "", criteria: [] };
   }

   // Mise à jour de la date
   jsonSave.appreciations[level].date = evalDate;

   // Construction du sélecteur pour la date
   const selectorTab = `#tab${capitalizeFirstLetter(getType(level))}`;
   const tabs = document.querySelector(selectorTab);
   // Vérifie si l'élément span n'existe pas déjà
   if (tabs && !tabs.querySelector('span')) {

      let span = document.createElement('span');
      span.textContent = evalDate;  // Définit le texte du span comme la date
      tabs.appendChild(span);
      // Construction du sélecteur pour l'élément de résultat
      const selectorResult = `#${getType(level)}-result-box`; // Ajout du `#` pour le sélecteur ID
      // Sélection et ajout du contenu à l'élément de résultat
      const resultBox = document.querySelector(selectorResult);
      if (resultBox) {
         // Créer un nouvel élément span pour afficher la date
         span = document.createElement('span');
         span.textContent = evalDate;  // Définit le texte du span comme la date
         resultBox.appendChild(span);  // Ajoute le span à la boîte de résultat
      }
   }

   // Mise à jour des critères pour ce niveau
   jsonSave.appreciations[level].criteria = []; // Réinitialiser les critères pour ce niveau
   for (let IdCriteria = 1; IdCriteria <= nbrCriterias; IdCriteria++) {
      const criteriaElement = document.querySelector(`[data-id= "${currentTab}-${IdCriteria}"]`);
      if (criteriaElement) {
         jsonSave.appreciations[level].criteria.push({
            id: IdCriteria,
            name: criteriaElement.getAttribute("data-name"),
            value: criteriaElement.value || "na", // Valeur par défaut si vide
            checked: document.querySelector(`#exclude-${IdCriteria}`).checked
         });
      } else {
         console.warn(`Critère non trouvé pour id = "${currentTab}-${level}"`);
      }
   }
   // Affichage dans la console pour vérifier les données
   console.log("Données mises à jour :", jsonSave);
   // Enregistrer les données dans le localStorage
   localStorage.setItem("currentEval", JSON.stringify(jsonSave));
}

export function capitalizeFirstLetter(string) {
   if (!string) return ''; // Vérifie si la chaîne est vide ou null
   return string.charAt(0).toUpperCase() + string.slice(1);
}

export function updateDOMWithData(jsonSave) {
   console.log("Données chargées :", jsonSave);

   // Mise à jour du DOM avec les données chargées
   document.getElementById(IDS.PROJECT_NAME).value = jsonSave.projetName || "";
   document.getElementById(IDS.STUDENT_LASTNAME).value = jsonSave.studentLastName || "";
   document.getElementById(IDS.STUDENT_FIRSTNAME).value = jsonSave.studentFirstName || "";
   document.getElementById(IDS.REMARKS).value = jsonSave.studentRemark || "";
   document.getElementById(IDS.EVALUATION_DATE).value = jsonSave.appreciations[2].date || "";
   document.getElementById(IDS.STUDENT_CLASS).value = jsonSave.studentClass || "";
   document.getElementById(IDS.TEACHER_NAME).value = jsonSave.evaluator || "";

   // Mise à jour des critères pour chaque niveau
   const levels = jsonSave.appreciations || {};

   console.log('jsonSave.appreciations :', levels);

   for (const level in levels) {
      if (levels.hasOwnProperty(level)) {
         const criteria = levels[level].criteria;
         criteria.forEach(item => {
            const criteriaElement = document.querySelector(`[data-id="${getType(level)}-${item.id}"]`);

            if (criteriaElement) {
               if (criteriaElement.type === "checkbox") {
                  criteriaElement.checked = item.value;
               } else {
                  criteriaElement.value = item.value;
               }
               sliderValues[getType(level)][item.id] = item.value;
            }
         });
      }
   }

   for (let level = 0; level < 3; level++) {
      // Construction du sélecteur pour la date
      const selectorTab = `#tab${capitalizeFirstLetter(getType(level))}`;
      const tabs = document.querySelector(selectorTab);
      let span = document.createElement('span');
      span.textContent = jsonSave.appreciations[level].date;  // Définit le texte du span comme la date
      tabs.appendChild(span);

      // Construction du sélecteur pour l'élément de résultat
      const selectorResult = `#${getType(level)}-result-box`; // Ajout du `#` pour le sélecteur ID

      // Sélection et ajout du contenu à l'élément de résultat
      const resultBox = document.querySelector(selectorResult);
      if (resultBox) {
         // Créer un nouvel élément span pour afficher la date
         span = document.createElement('span');
         span.textContent = jsonSave.appreciations[level].date;  // Définit le texte du span comme la date
         resultBox.appendChild(span);  // Ajoute le span à la boîte de résultat
      }
   }
   updateHandleSelection('teacher')
   updateHandleSelection('project');

}

function updateHandleSelection(nameSelection) {

   const select = document.getElementById(`${nameSelection}-select`);
   const nameInput = document.getElementById(`${nameSelection}-name`);

   select.style.display = 'none';
   nameInput.style.display = 'block';


}


export function onLoad() {
   // Récupère le fichier sélectionné
   const fileInput = document.getElementById(IDS.FILE_INPUT);

   if (fileInput) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = function (event) {
         try {
            const jsonSave = JSON.parse(event.target.result);
            updateDOMWithData(jsonSave);
         } catch (e) {
            console.error("Erreur lors du chargement des données : ", e);
            alert("Erreur lors du chargement du fichier JSON. Veuillez vérifier le format du fichier.");
         }
      };

      if (file) {
         reader.readAsText(file);
      } else {
         alert("Veuillez sélectionner un fichier JSON à charger.");
      }
   }
}

export function onSave() {
   // titre du fichier
   // projectName, firstName, lastName, année, classe
   const nameFile = new Date().getFullYear() + "_"
      + jsonSave.studentClass + "_"
      + jsonSave.projetName.substring(0, 8).replace(/ /g, '_') + "_"
      + jsonSave.studentLastName.replace(/ /g, '_') + "_"
      + jsonSave.studentFirstName.replace(/ /g, '_') + ".json";

   const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonSave));
   const downloadAnchorNode = document.createElement('a');
   downloadAnchorNode.setAttribute("href", dataStr);
   downloadAnchorNode.setAttribute("download", nameFile);
   document.body.appendChild(downloadAnchorNode);

   // required for Firefox
   downloadAnchorNode.click();
   downloadAnchorNode.remove();
   alert("Données sauvegardées avec succès!");
}

// Restauration des valeurs des sliders au rendu des catégories
export function renderCategories() {
   // (id exclu par défaut: 8)
   excludedCriteria[8] = true;
   const categoriesDiv = document.getElementById('categories');
   categoriesDiv.innerHTML = ''; // Réinitialiser l'affichage

   const groupedCriteria = criteria.reduce((acc, crit) => {
      const category = crit.category.trim().toUpperCase();
      acc[category] = acc[category] || [];
      acc[category].push(crit);
      return acc;
   }, {});

   Object.keys(groupedCriteria).forEach(category => {
      const container = document.createElement('div');
      container.className = 'category-container';
      container.id = category.toLocaleLowerCase() + '-container';

      const header = document.createElement('div');
      header.className = 'category-header';
      header.innerHTML = `
<h2>${category}</h2>
<button onclick="toggleVisibility('${container.id}')">
${visibleCategories[category] ? 'Cacher ▲' : 'Afficher ▼'}
</button>
`;
      container.appendChild(header);

      const criteriaDiv = document.createElement('div');
      criteriaDiv.className = 'criteria-grid';
      criteriaDiv.id = category;

      groupedCriteria[category].forEach(crit => {
         const card = document.createElement('div');
         card.className = 'criterion-card';
         card.innerHTML = `
<div class="criterion-name">${crit.name}</div>
<div class="slider-container">
   ${['auto', 'formative', 'sommative'].map(level => `
      <label class='labelEval' for="${level}-${crit.id}">
         ${level.charAt(0).toUpperCase() + level.slice(1)}:
      </label>
      <input type="range" min="0" max="3" class="slider"
         id="${level}-${crit.id}"
         data-id="${level}-${crit.id}"
         data-name="${crit.name}"
         data-level="${level}"
         value="${sliderValues[level]?.[crit.id] || 0}"
         oninput="updateSliderValue(this)"
         ${currentTab !== level ? 'disabled' : ''}>
   `).join('')}
</div>
<div class="appreciation-labels">
   ${appreciationLabels.map((label, i) => `
      <span id="${label}-${currentTab}-${crit.id}">
         ${label}
      </span>
   `).join('')}
</div>
<div id="result-${crit.id}" class="result-box bg-gray">
   ${appreciationLabels[sliderValues[currentTab]?.[crit.id] || 0]}
</div>
<div class="exclude-checkbox">
   <label>
      <input type="checkbox" id="exclude-${crit.id}"
         onclick="toggleExclusion(${crit.id})"
         ${excludedCriteria[crit.id] ? 'checked' : ''}>
      Exclure de l'évaluation
   </label>
</div>
`;
         criteriaDiv.appendChild(card);
      });

      container.appendChild(criteriaDiv);
      categoriesDiv.appendChild(container);
   });

   // Initialiser les valeurs des sliders après avoir rendu les catégories
   initializeSliderValues();
}


let temp;
export function toggleVisibility(elementId, options = {}) {

   const element = document.getElementById(elementId);
   if (!element) {
      console.error(`L'élément avec l'ID "${elementId}" n'a pas été trouvé.`);
      return;
   }

   const {
      isVisibleState,
      toggleButtonId,
      maxHeightVisible = '',
      maxHeightHidden = '15px',
      hiddenStyles = {},
      visibleStyles = {}
   } = options;

   // Mettre à jour l'état de visibilité
   const isVisible = !isVisibleState[elementId];
   isVisibleState[elementId] = isVisible;

   // Mettre à jour le bouton (si fourni)
   if (toggleButtonId) {
      const toggleButton = document.getElementById(toggleButtonId);
      if (toggleButton) {
         toggleButton.innerText = isVisible ? 'Cacher ▲' : 'Afficher ▼';
      }
   }

   // Appliquer les styles en fonction de la visibilité
   if (isVisible) {
      Object.assign(element.style, visibleStyles);
      element.style.maxHeight = maxHeightVisible;
      element.children[1].style.display = temp;
   } else {
      Object.assign(element.style, hiddenStyles);
      element.style.maxHeight = maxHeightHidden;
      temp = element.children[1].style.display;
      element.children[1].style.display = 'none';
   }
}

// Fonctions du modal
export function openSendModal() {
   document.getElementById('sendModal').classList.remove('hidden');
}

export function closeSendModal() {
   document.getElementById('sendModal').classList.add('hidden');
}

export async function processSend(event) {
   event.preventDefault();
   const pseudo = document.getElementById('pseudo').value;
   const code = document.getElementById('code').value;

   // Hachage du code
   const hashedCode = await hashCode(code);

   // Préparer les données
   const data = {
      pseudo,
      hashedCode,
      fileData: jsonSave // Ajout de la variable jsonSave
   };
   // Envoyer les données au serveur
   onValidation();
   sendDataToServer(data);
   closeSendModal();
}

export async function hashCode(code) {
   const encoder = new TextEncoder();
   const data = encoder.encode(code);
   const hashBuffer = await crypto.subtle.digest('SHA-256', data);
   return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
}

export function sendDataToServer(data) {
   console.log("Envoi des données :", data);

   // Créer un objet formData avec les données à envoyer
   const formData = new FormData();
   formData.append('pseudo', data.pseudo);
   formData.append('code', data.hashedCode);
   // Crée le nom de fichier
   formData.append('fileName', generateFileName(data.fileData));

   formData.append('jsonData', JSON.stringify(data.fileData)); // Ajoute les données JSON

   // Envoi des données au serveur via POST
   fetch(`${api_srv}/save-file`, {
      method: 'POST',
      body: formData, // FormData pour envoyer des fichiers et des données
   })
      .then(response => response.json())
      .then(result => {
         console.log('Fichier sauvegardé avec succès:', result);
         alert("Fichier sauvegardé avec succès!");
      })
      .catch(error => {
         console.error('Erreur lors de l\'envoi des données:', error);
         alert("Erreur lors de la sauvegarde du fichier.");
      });
}

// Générer le nom de fichier basé sur la structure voulue
export function generateFileName(jsonSave) {
   const year = new Date().getFullYear();
   const projectName = jsonSave.projetName.substring(0, 8).replace(/ /g, '_');
   const studentClass = jsonSave.studentClass.replace(/ /g, '_');
   const studentLastName = jsonSave.studentLastName.replace(/ /g, '_');
   const studentFirstName = jsonSave.studentFirstName.replace(/ /g, '_');
   return `${year}_${studentClass}_${projectName}_${studentLastName}_${studentFirstName}.json`;
}

// Recalcul automatique lors de l'interaction avec un slider ou une exclusion
export function updateSliderValue(slider) {
   const level = slider.dataset.level;
   const id = slider.dataset.id.replace(level, '').replace('-', '');
   const value = parseInt(slider.value);

   sliderValues[level][id] = value;

   let currentResult = document.getElementById(`result-${id}`);
   // Vérifie d'abord si l'élément existe
   if (currentResult !== null) {
      currentResult = currentResult.textContent;
      // Vérifie maintenant si le contenu textuel de l'élément n'est pas nul ou indéfini
      if (currentResult !== null && currentResult !== undefined) {
         currentResult = appreciationLabels[value];
      }
      else { console.log("Le contenu textuel est nul ou indéfini."); }
   }
   else {
      console.log("L'élément DOM avec l'ID result-" + id + " est le level " + level + " n'existe pas.");
   }

   calculateFinalResults(); // Recalculer les résultats
}

export function getDateDefault() {
   // Obtenir la date actuelle
   const today = new Date();

   // Formater la date au format YYYY-MM-DD
   const yyyy = today.getFullYear();
   let mm = today.getMonth() + 1; // Les mois commencent à 0
   let dd = today.getDate();

   // Ajouter un zéro devant les mois ou jours inférieurs à 10
   if (mm < 10) mm = '0' + mm;
   if (dd < 10) dd = '0' + dd;

   // Construire la date au format nécessaire (sans espaces)
   const todayFormatted = `${yyyy}-${mm}-${dd}`;
   document.getElementById('evaluation-date').value = todayFormatted;
}

export function changeTab(tab) {
   currentTab = tab;

   // Retirer la classe 'active' de tous les onglets
   document.getElementById('tabAuto').classList.remove('active');
   document.getElementById('tabFormative').classList.remove('active');
   document.getElementById('tabSommative').classList.remove('active');

   document.getElementById('tabAuto').classList.remove('inactive');
   document.getElementById('tabFormative').classList.remove('inactive');
   document.getElementById('tabSommative').classList.remove('inactive');

   if (tab === 'auto') {
      document.getElementById('tabAuto').classList.add('active');
      document.querySelector('#categories').style.backgroundColor = '#22f8343d';
   } else if (tab === 'formative') {
      document.getElementById('tabFormative').classList.add('active');
      document.querySelector('#categories').style.backgroundColor = '#f3b33c3d';
   } else {
      document.getElementById('tabSommative').classList.add('active');
      document.querySelector('#categories').style.backgroundColor = '#eb4c253d';
   }

   renderCategories();
}

// Gérer les exclusions
export function toggleExclusion(criterionId) {
   excludedCriteria[criterionId] = document.getElementById(`exclude-${criterionId}`).checked;
   // Recalculer après modification
   calculateFinalResults();
}

export function calculateFinalResults() {
   let totalScores = { auto: 0, formative: 0, sommative: 0 };
   let count = 8;
   let naCount = { auto: 0, formative: 0, sommative: 0 };
   let paCount = { auto: 0, formative: 0, sommative: 0 };
   let aCount = { auto: 0, formative: 0, sommative: 0 };
   let laCount = { auto: 0, formative: 0, sommative: 0 };

   criteria.forEach(crit => {
      if (excludedCriteria[crit.id]) {
         count--;
         return; // Ne pas inclure si exclu
      }
      ['auto', 'formative', 'sommative'].forEach(level => {
         const value = sliderValues[level][crit.id];

         if (value !== undefined) {
            totalScores[level] += parseInt(value);
            if (value < 1) naCount[level]++;
            else if (value < 2) paCount[level]++;
            else if (value < 3) aCount[level]++;
            else laCount[level]++;
         }
      });
   });

   ['auto', 'formative', 'sommative'].forEach(level => {
      let result;
      if (naCount[level] > 0) { result = appreciationLabels[0]; }
      else if (paCount[level] > 0) {
         result = appreciationLabels[1];
      }
      else {
         if (aCount[level] > Math.floor(count / 2, 0)) {
            result = appreciationLabels[2]
         }
         else {
            result = appreciationLabels[3];
         }
      }
      document.getElementById(`${level}-average`).textContent = result;
   });
}

export function initializeSliderValues() {
   // Initialiser les valeurs des sliders pour chaque critère et chaque onglet
   criteria.forEach(crit => {
      ['auto', 'formative', 'sommative'].forEach(level => {
         if (!sliderValues[level][crit.id]) {
            sliderValues[level][crit.id] = 0; // Valeur par défaut
         }

         // Mettre à jour l'interface utilisateur
         const slider = document.querySelector(`input[data-id="${crit.id}"][data-level="${level}"]`);
         if (slider) {
            slider.value = sliderValues[level][crit.id];
            const resultDiv = document.getElementById(`result-${crit.id}`);
            resultDiv.innerText = appreciationLabels[slider.value];
         }
      });
   });

   // Recalculer les résultats une fois les valeurs initiales définies
   calculateFinalResults();
}

// Function to toggle the burger menu
export function toggleMenu() {
   const menuItems = document.querySelectorAll('.menu-item');

   menuItems.forEach(item => {
      if (item.style.display === 'none' || item.style.display === '') {
         item.style.display = 'block';
      } else {
         item.style.display = 'none';
      }
   });
}

export function createOptions(selectId, options) {
   const selectElement = document.getElementById(selectId);

   // Effacer les options existantes
   selectElement.innerHTML = '';

   // Créer et ajouter une option par défaut
   const defaultOption = document.createElement('option');
   defaultOption.value = '';
   defaultOption.selected = true;
   defaultOption.textContent = '-- Sélectionner --';
   selectElement.appendChild(defaultOption);

   // Créer et ajouter les nouvelles options
   options.forEach(optionText => {
      const option = document.createElement('option');

      option.value = optionText.name;
      option.textContent = optionText.name;
      selectElement.appendChild(option);
   });

   // Ajouter une option 'Autre...'
   const otherOption = document.createElement('option');
   otherOption.value = 'other';
   otherOption.textContent = 'Autre...';
   selectElement.appendChild(otherOption);
}

export function autocomplete(inp, arr) {
   var currentFocus;
   inp.addEventListener("input", function (e) {
      var a, b, i, val = this.value;
      closeAllLists();
      if (!val) { return false; }
      currentFocus = -1;
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      this.parentNode.appendChild(a);
      for (i = 0; i < arr.length; i++) {
         if (arr[i].name.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            b = document.createElement("DIV");
            b.innerHTML = "<strong>" + arr[i].name.substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].name.substr(val.length);
            b.innerHTML += "<input type='hidden' value='" + arr[i].name + "'>";
            b.addEventListener("click", function (e) {
               inp.value = this.getElementsByTagName("input")[0].value;
               closeAllLists();
            });
            a.appendChild(b);
         }
      }
   });

   inp.addEventListener("keydown", function (e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
         currentFocus++;
         addActive(x);
      } else if (e.keyCode == 38) {
         currentFocus--;
         addActive(x);
      } else if (e.keyCode == 13) {
         e.preventDefault();
         if (currentFocus > -1) {
            if (x) x[currentFocus].click();
         }
      }
   });

   function addActive(x) {
      if (!x) return false;
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      x[currentFocus].classList.add("autocomplete-active");
   }
   function removeActive(x) {
      for (var i = 0; i < x.length; i++) {
         x[i].classList.remove("autocomplete-active");
      }
   }
   function closeAllLists(elmnt) {
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
         if (elmnt != x[i] && elmnt != inp) {
            x[i].parentNode.removeChild(x[i]);
         }
      }
   }
   document.addEventListener("click", function (e) {
      closeAllLists(e.target);
   });
}



/*
   Fonctions utilitaires
*/

export function getEvaluationLevel(tabs) {
   const levels = {
      auto: 0,
      formative: 1,
      sommative: 2
   };
   // Retourne -1 par défaut si tabs n'est pas valide
   return levels[tabs] ?? -1;
}

// Déterminer le type d'évaluation en fonction du niveau
export function getType(level) {
   const types = {
      0: "auto",
      1: "formative",
      2: "sommative"
   };

   // Retourne le type associé au niveau, ou -1 si le niveau est invalide
   return types[level] ?? -1;
}

export function nextPage(nextPageId, currentPageId) {
   document.querySelector(currentPageId).style.display = 'none';
   document.querySelector(nextPageId).style.display = 'block';
}