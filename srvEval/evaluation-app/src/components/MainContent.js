import React from 'react';
import './MainContent.css';

const MainContent = () => {
   return (
      <main>
         <div id="search">
            <h2>Filtres</h2>
            <form id="filterForm">
               <label htmlFor="studentClass">Classe:</label>
               <input type="text" id="studentClass" name="studentClass" /><br />

               <label htmlFor="evaluator">Evaluateur:</label>
               <input type="text" id="evaluator" name="evaluator" /><br />

               <label htmlFor="year">Année:</label>
               <input type="text" id="year" name="year" /><br />

               <label htmlFor="projetName">Nom du projet:</label>
               <input type="text" id="projetName" name="projetName" /><br />

               <button type="submit">Filtrer</button>
            </form>
         </div>

         <div id="evaluation-list-container">
            <p>Chargement des évaluations...</p>
         </div>
      </main>
   );
};

export default MainContent;
