import { classe, projects, evaluators, isVisibleState } from './js/constants.js';
import {
   autocomplete, nextPage, initLoad, createOptions, renderCategories, getDateDefault, processSend, changeTab, closeSendModal,
   toggleVisibility, onLoad, onSave, onValidation, openSendModal, handleSelection, updateSliderValue
} from './js/fonctions.js';
import { IDS } from './js/domElements.js';

// Fonction d'initialisation globale
function init() {
   // Autocomplétion pour la classe de l'étudiant
   autocomplete(document.getElementById(IDS.STUDENT_CLASS), classe);

   // Création des menus déroulants pour les projets et les enseignants
   createOptions(IDS.PROJECT_SELECT, projects);
   createOptions(IDS.TEACHER_SELECT, evaluators);

   // Création du DOM pour la partie évaluation
   renderCategories();

   // Initialisation de la date par défaut
   getDateDefault();
}

// Définir la fonction onLoad dans le contexte global
document.addEventListener("DOMContentLoaded", function () {
   window.onLoad = onLoad;

   // Initialisation des éléments du DOM
   init();

   // Gestionnaire pour l'événement 'load'
   window.addEventListener('load', initLoad);
});

// Fonctions de la page evaluation
Object.assign(window, {
   nextPage,
   toggleVisibility: (elementId) => toggleVisibility(elementId, { isVisibleState }),
   changeTab,
   onSave,
   onValidation,
   openSendModal,
   handleSelection,
   updateSliderValue,
   closeSendModal,
   processSend
});
