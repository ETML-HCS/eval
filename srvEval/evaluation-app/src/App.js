import React, { useEffect, useState } from 'react';
import LoginModal from './components/LoginModal';
import MainContent from './components/MainContent';
import './App.css';

const api = 'http://localhost:4000';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await fetch(`${api}/check-login`);
        const data = await response.json();
        if (data.loggedIn) {
          setIsLoggedIn(true);
          setShowModal(false);
        } else {
          setIsLoggedIn(false);
          setShowModal(true);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la connexion :', error);
      }
    };
    checkLogin();
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowModal(false);
  };

  return (
    <div className="App">
      <header>
        <h1>Consultation des évaluations</h1>
      </header>
      {showModal && <LoginModal onLoginSuccess={handleLoginSuccess} />}
      {isLoggedIn && <MainContent />}
      <footer>
        © 2024 - Évaluation des compétences
      </footer>
    </div>
  );
};

export default App;
