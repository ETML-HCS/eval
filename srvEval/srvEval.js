const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Configuration de multer pour gérer les fichiers
const upload = multer({
    dest: 'uploads/', // Dossier où les fichiers seront sauvegardés temporairement
    limits: { fileSize: 10 * 1024 * 1024 }, // Limite de taille de fichier (par exemple, 10 Mo)
}).single('fileName'); // Le champ 'fileName' correspond au nom du fichier dans FormData

// Middleware pour gérer les requêtes JSON
app.use(express.json());

// Endpoint pour recevoir les données envoyées via POST
app.post('/save-file', upload, (req, res) => {
    // Extraction des données envoyées par le client
    const jsonData = req.body.jsonData; // Données JSON envoyées
    const fileName = req.body.fileName; // Nom du fichier

    // Vérification des données reçues
    if (!jsonData || !fileName) {
        return res.status(400).json({ error: 'Données manquantes' });
    }

    // Convertir les données JSON en objet JavaScript
    let jsonObject;
    try {
        jsonObject = JSON.parse(jsonData);
    } catch (error) {
        return res.status(400).json({ error: 'Erreur de parsing JSON' });
    }

    // Créer le chemin où sauvegarder le fichier
    const filePath = path.join(__dirname, 'savedFiles', fileName);

    // Sauvegarder les données JSON dans un fichier
    fs.writeFile(filePath, JSON.stringify(jsonObject, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Erreur lors de la sauvegarde du fichier:', err);
            return res.status(500).json({ error: 'Erreur lors de la sauvegarde du fichier' });
        }

        // Répondre à la requête avec succès
        res.json({ message: 'Fichier sauvegardé avec succès', filePath: filePath });
    });
});

// Lancer le serveur sur un port
app.listen(3000, () => {
    console.log('Serveur en écoute sur le port 3000');
});
