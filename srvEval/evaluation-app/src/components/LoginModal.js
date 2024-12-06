import React, { useState } from 'react';
import bcryptjs from 'bcryptjs';
import './LoginModal.css';

const LoginModal = ({ onLoginSuccess }) => {
   const [login, setLogin] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');

   const validateLogin = (login) => {
      if (login.length < 3) {
         return false;
      } else if (login.length !== 7 && login.length > 3) {
         return false;
      }
      return true;
   };

   const hashCode = async (password) => {
      const salt = bcryptjs.genSaltSync(10);
      const hash = bcryptjs.hashSync(password, salt);
      return hash;
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateLogin(login) || !password) {
         setError('Veuillez vérifier vos identifiants. Le pseudo doit respecter les critères.');
         return;
      }

      const hashedPassword = await hashCode(password);

      try {
         const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, password: hashedPassword }),
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur de connexion.');
         }

         const data = await response.json();

         if (data.success) {
            onLoginSuccess();
         } else {
            setError(data.message || 'Identifiants invalides. Veuillez réessayer.');
         }
      } catch (error) {
         console.error('Erreur lors de la tentative de connexion :', error);
         setError(error.message || 'Une erreur est survenue. Veuillez vérifier votre connexion ou réessayer plus tard.');
      }
   };

   return (
      <div className="contenair-modal show" aria-labelledby="modalTitle" role="dialog">
         <div className="modale">
            <h2 id="modalTitle">Connexion</h2>
            <p className="modal-description">
               Veuillez entrer vos identifiants pour accéder à la plateforme.<br />
               <small>
                  <strong>Enseignants :</strong> utilisez un pseudo d'au moins 3 caractères "exemple stx".<br />
                  <strong>Élèves :</strong> utilisez un pseudo de 7 caractères "exemple pa36pnx".
               </small>
            </p>
            <form onSubmit={handleSubmit}>
               <div className="grp-label">
                  <label htmlFor="idLogin">Login :</label>
                  <input
                     type="text"
                     name="login"
                     id="idLogin"
                     placeholder="Entrez votre login"
                     aria-required="true"
                     minLength="3"
                     maxLength="7"
                     required
                     autoFocus
                     value={login}
                     onChange={(e) => setLogin(e.target.value)}
                  />
               </div>
               <div className="grp-label">
                  <label htmlFor="idPassword">Password :</label>
                  <input
                     type="password"
                     name="password"
                     id="idPassword"
                     placeholder="Entrez votre mot de passe"
                     aria-required="true"
                     required
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                  />
               </div>
               <div className="btn-confirm">
                  <button type="submit">Connexion</button>
               </div>
               {error && <p className="error-message">{error}</p>}
            </form>
         </div>
      </div>
   );
};

export default LoginModal;
