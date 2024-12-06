import express from 'express';
import multer from 'multer';
import mysql from 'mysql2';
import cors from 'cors';
import bcrypt from 'bcrypt';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { format } from 'date-fns';


dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const srv = process.env.SERVER || 'localhost';
const ipAddress = `http://${srv}:${port}`;
console.log(`IP Address: ${ipAddress}`);

// Configuration de multer pour gérer les fichiers
const upload = multer();

// Configuration CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5500',
    credentials: true,
    methods: ['GET', 'POST'],  // Autorise GET et POST
    allowedHeaders: ['Content-Type', 'Authorization']  // Autorise certains en-têtes
}));

console.log('Frontend URL:', process.env.FRONTEND_URL);


// Middleware pour analyser les requêtes JSON et URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuration de la session
app.use(session({
    secret: process.env.SESSION_SECRET || 'votre_clé_de_session',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000,
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    },
}));

// Configuration de la base de données
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '6033',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'pEval',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
    console.error('Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
});

// OK : Route pour se connecter
app.post('/login', async (req, res, next) => {
    console.log('Requête de connexion reçue');
    try {
        const { login, password } = req.body;

        // Validation des champs
        if (!login || !password) {
            console.log('Login ou mot de passe manquant');
            return res.status(400).json({ success: false, message: "Login et mot de passe requis." });
        }

        // Vérification des identifiants étudiants
        const [students] = await db.promise().query(
            `SELECT * FROM student_logins WHERE username = ?`,
            [login]
        );

        if (students.length > 0) {
            const student = students[0];
            const isValidPassword = await bcrypt.compare(password, student.password_hash);
            console.log(`Utilisateur étudiant trouvé : ${login}, Mot de passe valide: ${isValidPassword}`);
            if (isValidPassword) {
                req.session.loggedIn = true;
                req.session.role = 'student';
                req.session.userId = student.id;
                req.session.userName = login;
                return res.status(200).json({ success: true, role: 'student', userName: login });
            }
        }

        // Vérification des identifiants enseignants
        const isTeacherPasswordCorrect = await bcrypt.compare(password, process.env.TEACHER_PASSWORD_HASH);
        console.log(`Mot de passe enseignant valide: ${isTeacherPasswordCorrect}`);
        if (isTeacherPasswordCorrect) {
            req.session.loggedIn = true;
            req.session.role = 'teacher';
            req.session.userName = login;
            return res.status(200).json({ success: true, role: 'teacher', userName: login });
        }

        // Si aucun utilisateur n'est trouvé
        console.log('Login ou mot de passe incorrect');
        res.status(401).json({ success: false, message: "Login ou mot de passe incorrect." });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        next(error); // Transmission de l'erreur au middleware d'erreur global
    }
});

// Route pour sauvegarder une évaluation
app.post('/save-evaluation', upload.none(), async (req, res, next) => {
    console.log('Requête pour sauvegarder une évaluation reçue');
    try {
        const { pseudo, code, fileName, jsonData } = req.body;

        if (!pseudo || !code || !fileName || !jsonData) {
            console.log('Données manquantes pour sauvegarde');
            return res.status(400).json({ error: 'Données manquantes.' });
        }

        const parsedData = JSON.parse(jsonData);
        console.log('Données analysées:', parsedData);

        const [project] = await db.promise().query(
            'INSERT INTO projects (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
            [parsedData.projetName]
        );
        console.log(`Projet ID: ${project.insertId}`);

        const [student] = await db.promise().query(
            `INSERT INTO students (last_name, first_name, class, remark, evaluator)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
            [parsedData.studentLastName, parsedData.studentFirstName, parsedData.studentClass, parsedData.studentRemark, parsedData.evaluator]
        );
        console.log(`Étudiant ID: ${student.insertId}`);

        res.status(200).json({ message: 'Évaluation enregistrée avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        next(error);
    }
});

// OK : Route pour vérifier l'authentification 
app.get('/check-auth', (req, res) => {
    console.log('Requête de vérification d\'authentification');
    if (req.session.loggedIn) {
        console.log('Utilisateur authentifié');
        return res.status(200).json({
            loggedIn: true,
            role: req.session.role,
            userName: req.session.userName
        });
    }
    console.log('Utilisateur non authentifié');
    res.status(401).json({ loggedIn: false });
});



// Route pour rechercher les évaluations filtrées
app.post('/search-evaluations', async (req, res, next) => {
    const { evaluator, projetName, studentLastName, studentFirstName, studentClass, year } = req.body;

    // Log des paramètres reçus dans la requête
    console.log('Recherche d\'évaluations avec les critères suivants :');
    console.log(`Évaluateur : ${evaluator || 'Non spécifié'}`);
    console.log(`Nom du projet : ${projetName || 'Non spécifié'}`);
    console.log(`Nom de l\'étudiant : ${studentLastName || 'Non spécifié'}, Prénom : ${studentFirstName || 'Non spécifié'}`);
    console.log(`Classe de l\'étudiant : ${studentClass || 'Non spécifié'}`);
    console.log(`Année : ${year || 'Non spécifié'}`);

    try {
        // Base de la requête pour récupérer les évaluations
        let query = `
            SELECT a.id AS appreciation_id, student_id, project_id, a.date, s.first_name, s.last_name, s.class, s.evaluator, p.name AS project_name
            FROM appreciations a
            JOIN students s ON a.student_id = s.id
            JOIN projects p ON a.project_id = p.id
            WHERE 1=1
        `;
        let queryParams = [];

        // Ajout des conditions dynamiques en fonction des critères
        if (evaluator) {
            query += ' AND s.evaluator LIKE ?';
            queryParams.push(`%${evaluator}%`);
        }
        if (projetName) {
            query += ' AND p.name LIKE ?';
            queryParams.push(`%${projetName}%`);
        }
        if (studentLastName) {
            query += ' AND s.last_name LIKE ?';
            queryParams.push(`%${studentLastName}%`);
        }
        if (studentFirstName) {
            query += ' AND s.first_name LIKE ?';
            queryParams.push(`%${studentFirstName}%`);
        }
        if (studentClass) {
            query += ' AND s.class LIKE ?';
            queryParams.push(`%${studentClass}%`);
        }
        if (year) {
            // La date peut être manipulée pour comparer l'année
            query += ' AND YEAR(a.date) = ?';
            queryParams.push(year);
        }

        // Log de la requête SQL générée
        console.log('Requête SQL générée :', query);
        console.log('Paramètres de la requête :', queryParams);

        // Exécution de la requête
        const [evaluations] = await db.promise().query(query, queryParams);

        // Log des résultats obtenus
        console.log(`Nombre d'évaluations trouvées : ${evaluations.length}`);

        // Si aucune évaluation n'est trouvée
        if (evaluations.length === 0) {
            console.log('Aucune évaluation ne correspond à ces critères.');
        }

        // Retourner les résultats sous forme de JSON
        res.status(200).json(evaluations);
    } catch (error) {
        // Log de l'erreur
        console.error('Erreur lors de la recherche des évaluations:', error);
        next(error);
    }
});



// Définir une route pour récupérer l'évaluation complète

app.get('/getEvaluation', (req, res) => {
    const { projectId, appreciationId, studentId } = req.query;

    if (!projectId || !appreciationId || !studentId) {
        return res.status(400).json({ error: 'Paramètres manquants' });
    }

    // Requête SQL pour récupérer l'évaluation complète
    const query = `
      SELECT p.name AS project_name, 
             s.last_name, s.first_name, s.class, s.remark, s.evaluator, 
             a.date AS appreciation_date, 
             c.id AS criteria_id, c.name AS criteria_name, c.value, c.checked 
      FROM students s
      JOIN appreciations a ON s.id = a.student_id
      JOIN projects p ON a.project_id = p.id
      JOIN criteria c ON a.id = c.appreciation_id
      WHERE p.id = ? AND a.id = ? AND s.id = ?
    `;

    db.execute(query, [projectId, appreciationId, studentId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des données:', err);
            return res.status(500).json({ error: 'Erreur du serveur' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Aucune donnée trouvée' });
        }

        // Organiser les résultats en un format structuré comme demandé
        const data = {
            projetName: results[0].project_name,
            studentLastName: results[0].last_name,
            studentFirstName: results[0].first_name,
            studentClass: results[0].class,
            studentRemark: results[0].remark,
            evaluator: results[0].evaluator,
            appreciations: []
        };

        // Créer un tableau d'évaluation
        let currentAppreciation = {
            date: format(new Date(results[0].appreciation_date), 'yyyy-MM-dd'), // Formater la date
            criteria: [] // Initialiser le tableau des critères
        };

        // Regrouper tous les critères sous une seule appréciation
        results.forEach(row => {
            // Ajouter les critères à l'appréciation
            currentAppreciation.criteria.push({
                id: row.criteria_id,
                name: row.criteria_name,
                value: row.value,
                checked: row.checked === 1 // Vérifier si 'checked' est vrai
            });
        });

        // Ajouter l'appréciation unique au tableau 'appreciations'
        data.appreciations.push(currentAppreciation);

        // Envoi des données au client
        res.json(data);
    });
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur ${ipAddress}`);
});
