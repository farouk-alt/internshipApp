import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import { UserType, insertInternshipSchema, insertApplicationSchema, insertDocumentSchema, insertMessageSchema, insertPartnershipSchema, insertInternshipHistorySchema } from "@shared/schema";
import { sendContactEmail } from "./utils/email";
import upload from './middlewares/uploadDocs.ts';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




// Add this import for PostgreSQL pool
import { Pool } from "pg";
import { URL } from "url";

// Initialize the pool (adjust connection config as needed)
const pool = new Pool({
  // Example config, replace with your actual DB credentials
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "internship_db",
  password: process.env.PGPASSWORD || "fqrouk1122",
  port: Number(process.env.PGPORT) || 5432,
});

// Set up multer storage for file uploads
const uploadDir = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadDocs = multer({ storage: storage_config });

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Internship routes
  app.get("/api/internships", async (req, res) => {
    try {
      const internships = await storage.getInternships();
      res.json(internships);
    } catch (error) {
      res.status(500).json({ message: "Error fetching internships" });
    }
  });
  
  // Get company profile by user ID
  
  app.get("/api/companies/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const company = await storage.getCompanyByUserId(userId);
      
      if (!company) {
        return res.status(404).json({ message: "Company profile not found" });
      }
      
      res.json(company);
    } catch (error) {
      console.error("Error fetching company by user ID:", error);
      res.status(500).json({ message: "Error fetching company profile" });
    }
  });
  
  // Upload company logo
  app.post("/api/companies/logo", uploadDocs.single('logo'), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (req.user.userType !== "COMPANY") {
        return res.status(403).json({ message: "Unauthorized: Only companies can upload logos" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Get company profile
      const company = await storage.getCompanyByUserId(req.user.id);
      
      if (!company) {
        return res.status(404).json({ message: "Company profile not found" });
      }
      
      // Update company logo
      const logoPath = `/uploads/${req.file.filename}`;
      const updatedCompany = await storage.updateCompanyLogo(company.id, logoPath);
      
      // Delete old logo file if exists
      if (company.logo && company.logo !== logoPath && fs.existsSync(path.join(process.cwd(), company.logo))) {
        fs.unlinkSync(path.join(process.cwd(), company.logo));
      }
      
      res.json(updatedCompany);
    } catch (error) {
      console.error("Error uploading company logo:", error);
      res.status(500).json({ message: "Error uploading company logo" });
    }
  });
  
  // Get internships by company ID
  app.get("/api/internships/company/:id", async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const internships = await storage.getInternshipsByCompany(companyId);
      res.json({ internships });
    } catch (error) {
      console.error("Error fetching internships for company:", error);
      res.status(500).json({ message: "Error fetching internships" });
    }
  });
  
  
  app.get("/api/internships/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const internship = await storage.getInternship(id);
      
      if (!internship) {
        return res.status(404).json({ message: "Internship not found" });
      }
      
      res.json(internship);
    } catch (error) {
      res.status(500).json({ message: "Error fetching internship" });
    }
  });
  
  app.post("/api/internships", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      
      if (user.userType !== UserType.COMPANY) {
        return res.status(403).json({ message: "Only companies can create internships" });
      }
      
      const company = await storage.getCompanyByUserId(user.id);
      if (!company) {
        return res.status(404).json({ message: "Company profile not found" });
      }
      
      const validationResult = insertInternshipSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid internship data", errors: validationResult.error.errors });
      }
      
      const internshipData = {
        ...validationResult.data,
        companyId: company.id
      };
      
      const internship = await storage.createInternship(internshipData);
      res.status(201).json(internship);
    } catch (error) {
      res.status(500).json({ message: "Error creating internship" });
    }
  });
  
  app.put("/api/internships/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      const internship = await storage.getInternship(id);
      
      if (!internship) {
        return res.status(404).json({ message: "Internship not found" });
      }
      
      const company = await storage.getCompanyByUserId(user.id);
      
      // Débogage détaillé
      const companyMatch = company && internship.companyId === company.id;
      const typeCheck = user.userType.toUpperCase() === "COMPANY";
      const userId = user.id;
      const internshipCompanyId = internship.companyId;
      
      console.log("Détails pour le débogage PUT internship:", {
        userId,
        userType: user.userType,
        companyFromUser: company,
        internshipCompanyId,
        typeCheckResult: typeCheck,
        companyMatchResult: companyMatch
      });
      
      if (!typeCheck || !company || !companyMatch) {
        return res.status(403).json({ 
          message: "Not authorized to update this internship", 
          userType: user.userType, 
          hasCompany: !!company, 
          internshipCompanyId,
          companyId: company?.id,
          userId,
          typeCheck,
          companyMatch
        });
      }
      
      console.log("Updating internship:", id, "with data:", req.body);
      const updatedInternship = await storage.updateInternship(id, req.body);
      
      if (!updatedInternship) {
        return res.status(500).json({ message: "Failed to update internship" });
      }
      
      console.log("Internship updated successfully:", updatedInternship);
      res.json(updatedInternship);
    } catch (error) {
      console.error("Error updating internship:", error);
      res.status(500).json({ message: "Error updating internship" });
    }
  });
  
  // Pour les écoles - approuver/rejeter les stages
  app.put("/api/internships/:id/approval", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      const { status } = req.body;
      
      if (user.userType.toUpperCase() !== "SCHOOL") {
        return res.status(403).json({ message: "Only schools can approve/reject internships" });
      }
      
      if (status !== "approved" && status !== "rejected") {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedInternship = await storage.updateInternship(id, { status });
      
      if (!updatedInternship) {
        return res.status(404).json({ message: "Internship not found" });
      }
      
      res.json(updatedInternship);
    } catch (error) {
      res.status(500).json({ message: "Error updating internship status" });
    }
  });
  
  // Pour les entreprises - activer/désactiver leurs offres
  app.put("/api/internships/:id/activate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      const { isActive } = req.body;
      
      if (user.userType.toUpperCase() !== "COMPANY") {
        return res.status(403).json({ message: "Only companies can activate/deactivate internships" });
      }
      
      // Vérifier que l'entreprise est bien propriétaire de cette offre
      const internship = await storage.getInternship(id);
      
      if (!internship) {
        return res.status(404).json({ message: "Internship not found" });
      }
      
      // Obtenir l'entreprise de l'utilisateur
      const company = await storage.getCompanyByUserId(user.id);
      
      if (!company || internship.companyId !== company.id) {
        return res.status(403).json({ message: "You can only modify your own internships" });
      }
      
      // Mettre à jour le statut isActive
      console.log(`Setting internship ${id} isActive to ${isActive}`);
      const updatedInternship = await storage.updateInternship(id, { isActive });
      
      if (!updatedInternship) {
        return res.status(404).json({ message: "Failed to update internship" });
      }
      
      res.json(updatedInternship);
    } catch (error) {
      console.error("Error updating internship status:", error);
      res.status(500).json({ message: "Error updating internship active status" });
    }
  });
  
  // Application routes
  app.get("/api/applications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      let applications = [];
      
      if (user.userType.toUpperCase() === "STUDENT") {
        const student = await storage.getStudentByUserId(user.id);
        if (student) {
          applications = await storage.getApplicationsByStudent(student.id);
        }
      } else if (user.userType.toUpperCase() === "COMPANY") {
        const company = await storage.getCompanyByUserId(user.id);
        if (company) {
          const internships = await storage.getInternshipsByCompany(company.id);
          const promises = internships.map(internship => 
            storage.getApplicationsByInternship(internship.id)
          );
          
          const applicationsArrays = await Promise.all(promises);
          applications = applicationsArrays.flat();
        }
      }
      
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching applications" });
    }
  });
  
  // Route spécifique pour les candidatures de l'étudiant connecté
  app.get("/api/applications/student", async (req, res) => {
    console.log("🔥 User connecté :", req.user);

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      
      // Vérifier que l'utilisateur est bien un étudiant
      if (user.userType.toUpperCase() !== "STUDENT") {
        return res.status(403).json({ message: "Access denied. User is not a student" });
      }
      
      // Récupérer le profil étudiant
      const student = await storage.getStudentByUserId(user.id);
      console.log("🎓 Student profile trouvé :", student);

      if (!student) {
        return res.json([]);  // Retourner un tableau vide si le profil étudiant n'existe pas
      }
      
      // Récupérer les candidatures
      const applications = await storage.getApplicationsByStudent(student.id);
      
      // Enrichir les données avec les informations de l'entreprise
      const enrichedApplications = await Promise.all(
        applications.map(async (application) => {
          const internship = await storage.getInternship(application.internshipId);
          let companyName = "Entreprise";
          let companyLogo = null;
          let location = "Non spécifié";
          
          if (internship) {
            const company = await storage.getCompany(internship.companyId);
            if (company) {
              companyName = company.name;
              companyLogo = company.logo;
            }
            location = internship.location;
          }
          
          return {
            ...application,
            companyName,
            companyLogo,
            location
          };
        })
      );
      
      res.json(enrichedApplications);
    } catch (error) {
      console.error("Error fetching student applications:", error);
      res.status(500).json({ message: "Error fetching student applications" });
    }
  });
  
  // Route pour récupérer les candidatures acceptées (pour les écoles)
  app.get("/api/applications/accepted", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      
      // Vérifier que l'utilisateur est bien une école
      if (user.userType.toUpperCase() !== "SCHOOL") {
        return res.status(403).json({ message: "Access denied. User is not a school" });
      }
      
      // Récupérer le profil de l'école
      const school = await storage.getSchoolByUserId(user.id);
      if (!school) {
        return res.status(404).json({ message: "School profile not found" });
      }
      
      // Récupérer tous les étudiants de cette école
      const students = await storage.getStudentsBySchoolId(school.id);
      
      // Récupérer toutes les candidatures acceptées pour ces étudiants
      let acceptedApplications = [];
      for (const student of students) {
        const studentApplications = await storage.getApplicationsByStudent(student.id);
        const accepted = studentApplications.filter(app => app.status === 'accepted');
        acceptedApplications = [...acceptedApplications, ...accepted];
      }
      
      // Enrichir les applications avec les détails des étudiants et des stages
      const applicationsWithDetails = await Promise.all(
        acceptedApplications.map(async (application) => {
          const student = await storage.getStudent(application.studentId);
          const internship = await storage.getInternship(application.internshipId);
          let companyName = "Entreprise inconnue";
          
          if (internship) {
            const company = await storage.getCompany(internship.companyId);
            if (company) {
              companyName = company.name;
            }
          }
          
          return {
            ...application,
            studentName: student ? `${student.firstName} ${student.lastName}` : 'Étudiant inconnu',
            internshipTitle: internship ? internship.title : 'Stage inconnu',
            companyName
          };
        })
      );
      
      res.json({ applications: applicationsWithDetails });
    } catch (error) {
      console.error("Error fetching accepted applications:", error);
      res.status(500).json({ message: "Error fetching accepted applications" });
    }
  });

  // Get applications for a specific company
  app.get("/api/applications/company/:id", async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      console.log(`Fetching applications for company ID: ${companyId}`);
      
      // Get all internships for this company
      const internships = await storage.getInternshipsByCompany(companyId);
      console.log(`Found ${internships.length} internships for company ${companyId}:`, internships);
      
      // Get applications for each internship
      const promises = internships.map(internship => 
        storage.getApplicationsByInternship(internship.id)
      );
      
      const applicationsArrays = await Promise.all(promises);
      const applications = applicationsArrays.flat();
      
      console.log(`Found ${applications.length} applications for company ${companyId}:`, applications);
      
      // Si application.studentId existe, on récupère les informations de l'étudiant
      const applicationsWithDetails = await Promise.all(
        applications.map(async (application) => {
          const student = await storage.getStudent(application.studentId);
          const internship = await storage.getInternship(application.internshipId);
          
          return {
            ...application,
            studentName: student ? `${student.firstName} ${student.lastName}` : 'Étudiant inconnu',
            internshipTitle: internship ? internship.title : 'Stage inconnu'
          };
        })
      );
      
      console.log(`Applications with student details:`, applicationsWithDetails);
      
      res.json({ applications: applicationsWithDetails });
    } catch (error) {
      console.error("Error fetching applications for company:", error);
      res.status(500).json({ message: "Error fetching applications" });
    }
  });
  
  app.post("/api/applications", uploadDocs.single("cv"), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      
      // Vérification insensible à la casse du type d'utilisateur
      if (user.userType.toUpperCase() !== "STUDENT") {
        return res.status(403).json({ message: "Only students can apply to internships" });
      }
      
      const student = await storage.getStudentByUserId(user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }

      // Récupérer le CV s'il est uploadé
      let cvPath = null;
      if (req.file) {
        cvPath = req.file.path;
        console.log("CV uploadé:", req.file);
      }
      
      // Créer un objet avec les données de la requête
      const applicationData = {
        studentId: student.id,
        internshipId: parseInt(req.body.internshipId),
        coverLetter: req.body.coverLetter || '',
        cvPath: cvPath
      };
      
      console.log("Creating application with data:", applicationData);
      const application = await storage.createApplication(applicationData);
      
      // Enregistrer le document CV dans la table des documents s'il existe
      if (cvPath) {
        await storage.createDocument({
          userId: user.id,
          name: req.file?.originalname || 'CV',
          type: 'cv',
          path: cvPath
        });
      }
      
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Error creating application" });
    }
  });
  
  app.put("/api/applications/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      const { status } = req.body;
      
      // Vérification insensible à la casse du type d'utilisateur
      if (user.userType.toUpperCase() !== "COMPANY") {
        return res.status(403).json({ message: "Only companies can update application status" });
      }
      
      const application = await storage.getApplication(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      const internship = await storage.getInternship(application.internshipId);
      if (!internship) {
        return res.status(404).json({ message: "Internship not found" });
      }
      
      const company = await storage.getCompanyByUserId(user.id);
      if (!company || internship.companyId !== company.id) {
        return res.status(403).json({ message: "Not authorized to update this application" });
      }
      
      const updatedApplication = await storage.updateApplication(id, { status });
      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ message: "Error updating application status" });
    }
  });
  
  // Upload company logo
  app.post("/api/companies/logo", uploadDocs.single("logo"), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = req.user;
    if (user.userType.toUpperCase() !== "COMPANY") {
      return res.status(403).json({ message: "Only companies can upload a logo" });
    }
    
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Get the company profile
      const company = await storage.getCompanyByUserId(user.id);
      if (!company) {
        return res.status(404).json({ message: "Company profile not found" });
      }
      
      // Get the relative path to the file (for serving through the app)
      const relativePath = file.path.replace(process.cwd(), '');
      
      // Update the company profile with the logo path
      const updatedCompany = await storage.updateCompany(company.id, {
        logo: relativePath
      });
      
      res.json(updatedCompany);
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ message: "Error uploading logo" });
    }
  });
  
  // Document routes
  app.get("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      const documents = await storage.getDocumentsByUser(user.id);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching documents" });
    }
  });
  
  // Spécifique aux documents de l'étudiant connecté
  app.get("/api/documents/student", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      
      // Vérifier que l'utilisateur est bien un étudiant
      if (user.userType.toUpperCase() !== "STUDENT") {
        return res.status(403).json({ message: "Access denied. User is not a student" });
      }
      
      // Récupère à la fois les documents personnels et les documents partagés
      const personalDocuments = await storage.getDocumentsByUser(user.id);
      const sharedDocuments = await storage.getSharedDocumentsForUser(user.id);
      
      // Ajoute une propriété pour identifier les documents partagés
      const formattedSharedDocs = sharedDocuments.map(doc => ({
        ...doc,
        isShared: true
      }));
      
      // Combine les deux types de documents
      const allDocuments = [...personalDocuments, ...formattedSharedDocs];
      
      res.json(allDocuments);
    } catch (error) {
      console.error("Error fetching student documents:", error);
      res.status(500).json({ message: "Error fetching student documents" });
    }
  });
  
  app.post("/api/documents", uploadDocs.single("file"), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const documentData = {
        userId: user.id,
        name: req.body.name || file.originalname,
        type: req.body.type,
        path: file.path
      };
      
      const validationResult = insertDocumentSchema.safeParse(documentData);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid document data", errors: validationResult.error.errors });
      }
      
      const document = await storage.createDocument(validationResult.data);
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ message: "Error uploading document" });
    }
  });

  // Get all documents shared for a specific application (by the student)
app.get("/api/applications/:id/shared-documents", async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const application = await storage.getApplication(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Only documents shared by the student for this application
    const student = await storage.getStudent(application.studentId);
    const documents = await storage.getSharedDocumentsByApplicationId(applicationId);

    const filteredDocs = student
      ? documents.filter(doc => doc.shared_by_user_id === student.userId)
      : [];

    res.json({ documents: filteredDocs });
  } catch (err) {
    console.error("Erreur lors de la récupération des documents partagés:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

  
  // Route pour télécharger et partager un document en une seule étape
  app.post("/api/documents/share", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = req.user;
    const {
      applicationId,
      companyId,
      documentIds,
      documentType,
      message,
       documentPath,
      documentName
    } = req.body;

    console.log("Partage de document - données reçues:", {
      documentName,
      applicationId,
      companyId,
      documentType,
      message
    });

    if (user.userType.toUpperCase() !== "STUDENT") {
      return res.status(403).json({
        message: "Access denied. Only students can share documents with companies"
      });
    }

    if (!documentName) {
      return res.status(400).json({ message: "Document name is required" });
    }

    const appId = parseInt(applicationId);
    if (isNaN(appId)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }

    const application = await storage.getApplication(appId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const company = await storage.getCompany(parseInt(companyId));
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const student = await storage.getStudentByUserId(user.id);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // ✅ Construire le chemin absolu du fichier à partir de son nom
    // const filename = `${Date.now()}_${documentName.replace(/\s/g, '_')}`;
    // const absolutePath = path.join(process.cwd(), "uploads", filename);

    const documentData = {
      userId: user.id,
      name: documentName,
      type: documentType || "Document partagé",
      path: documentPath || documentName   // ou juste le filename

    };

    const document = await storage.createDocument(documentData);

    const companyUser = await storage.getUserByCompanyId(company.id);
    if (!companyUser) {
      return res.status(404).json({ message: "Company user not found" });
    }

    const sharedDoc = await storage.shareDocument({
      documentId: document.id,
      sharedByUserId: user.id,
      sharedWithUserId: companyUser.id,
      message: message || `Document "${documentName}" partagé pour ma candidature`,
      applicationId: appId,
      documentType: documentType || "Document partagé"
    });

    res.status(201).json({
      success: true,
      message: `Document "${documentName}" partagé avec succès`,
      document,
      shared: sharedDoc
    });

  } catch (error) {
    console.error("Error sharing document:", error);
    res.status(500).json({ message: "Error sharing document" });
  }
});
  
  app.delete("/api/documents/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      if (document.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to delete this document" });
      }
      
      const deleted = await storage.deleteDocument(id);
      
      if (deleted) {
        res.json({ message: "Document deleted successfully" });
      } else {
        res.status(500).json({ message: "Error deleting document" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting document" });
    }
  });
  
  // Route pour partager un document avec un étudiant (école -> étudiant)
  app.post("/api/documents/:documentId/share", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      const documentId = parseInt(req.params.documentId);
      const { studentIds, applicationId, message } = req.body;
      
      // Vérifier que l'utilisateur est bien une école
      if (user.userType.toUpperCase() !== "SCHOOL") {
        return res.status(403).json({ message: "Access denied. Only schools can share documents" });
      }
      
      // Vérifier que le document existe et appartient à l'école
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      if (document.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to share this document" });
      }
      
      // Si un ID de candidature est fourni, vérifier son statut
      if (applicationId) {
        const application = await storage.getApplication(applicationId);
        if (!application) {
          return res.status(404).json({ message: "Application not found" });
        }
        
        // Vérifier que la candidature est acceptée
        if (application.status !== "accepted") {
          return res.status(400).json({ 
            message: "Can only share post-acceptance documents for accepted applications",
            currentStatus: application.status
          });
        }
        
        // Récupérer l'étudiant associé à cette candidature
        const student = await storage.getStudent(application.studentId);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }
        
        // Partager le document avec cet étudiant
        const sharedDoc = await storage.shareDocument({
          documentId: documentId,
          sharedByUserId: user.id,
          sharedWithUserId: student.userId,
          message: message || "Document partagé suite à l'acceptation de votre candidature",
          applicationId: applicationId
        });
        
        return res.status(201).json({
          message: "Document shared with student after application acceptance",
          sharedDocument: sharedDoc
        });
      }
      
      // Cas normal - partage avec liste d'étudiants sans lien à une candidature
      const sharedResults = [];
      
      if (Array.isArray(studentIds)) {
        for (const studentId of studentIds) {
          // Obtenir l'utilisateur associé à cet étudiant
          const student = await storage.getStudent(studentId);
          
          if (student) {
            // Partager le document avec cet étudiant
            const sharedDoc = await storage.shareDocument({
              documentId: documentId,
              sharedByUserId: user.id,
              sharedWithUserId: student.userId,
              message: message
            });
            
            sharedResults.push(sharedDoc);
          }
        }
      } else if (typeof studentIds === 'number') {
        // Si un seul ID a été envoyé (pas dans un tableau)
        const student = await storage.getStudent(studentIds);
        
        if (student) {
          const sharedDoc = await storage.shareDocument({
            documentId: documentId,
            sharedByUserId: user.id,
            sharedWithUserId: student.userId,
            message: message
          });
          
          sharedResults.push(sharedDoc);
        }
      }
      
      res.status(201).json({
        message: `Document shared with ${sharedResults.length} students`,
        sharedDocuments: sharedResults
      });
    } catch (error) {
      console.error("Error sharing document:", error);
      res.status(500).json({ message: "Error sharing document" });
    }
  });
  
  // Student documents for companies
  app.get("/api/students/:id/documents", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      const studentId = parseInt(req.params.id);
      
      // Vérification insensible à la casse du type d'utilisateur
      if (user.userType.toUpperCase() !== "COMPANY" && user.userType.toUpperCase() !== "SCHOOL") {
        return res.status(403).json({ message: "Not authorized to access student documents" });
      }
      
      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      const documents = await storage.getDocumentsByUser(student.userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching student documents" });
    }
  });
  
  // Routes pour les demandes de documents
  app.post("/api/document-requests", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      const { schoolId, applicationId, requestType, message } = req.body;
      
      // Vérifier que l'utilisateur est un étudiant
      if (user.userType.toUpperCase() !== "STUDENT") {
        return res.status(403).json({ message: "Access denied. Only students can request documents" });
      }
      
      // Obtenir le profil étudiant
      const student = await storage.getStudentByUserId(user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      // Créer la demande de document
      const documentRequest = await storage.createDocumentRequest({
        studentId: student.id,
        schoolId,
        applicationId,
        requestType,
        message
      });
      
      res.status(201).json(documentRequest);
    } catch (error) {
      console.error("Error creating document request:", error);
      res.status(500).json({ message: "Error creating document request" });
    }
  });
  
  // Obtenir les demandes de documents pour un étudiant
  app.get("/api/document-requests/student", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      
      // Vérifier que l'utilisateur est un étudiant
      if (user.userType.toUpperCase() !== "STUDENT") {
        return res.status(403).json({ message: "Access denied. Only students can view their document requests" });
      }
      
      // Obtenir le profil étudiant
      const student = await storage.getStudentByUserId(user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      // Obtenir les demandes de documents de cet étudiant
      const requests = await storage.getDocumentRequestsByStudent(student.id);
      
      res.json(requests);
    } catch (error) {
      console.error("Error fetching student document requests:", error);
      res.status(500).json({ message: "Error fetching student document requests" });
    }
  });
  
  // Obtenir les demandes de documents pour une école
  app.get("/api/document-requests/school", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      
      // Vérifier que l'utilisateur est une école
      if (user.userType.toUpperCase() !== "SCHOOL") {
        return res.status(403).json({ message: "Access denied. Only schools can view document requests" });
      }
      
      // Obtenir le profil d'école
      const school = await storage.getSchoolByUserId(user.id);
      if (!school) {
        return res.status(404).json({ message: "School profile not found" });
      }
      
      // Obtenir les demandes de documents pour cette école
      const requests = await storage.getDocumentRequestsBySchool(school.id);
      
      // Enrichir les données avec les infos des étudiants
      const enrichedRequests = await Promise.all(requests.map(async (request) => {
        const student = await storage.getStudent(request.studentId);
        const application = request.applicationId ? await storage.getApplication(request.applicationId) : null;
        
        return {
          ...request,
          student: student ? {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            program: student.program
          } : null,
          application: application ? {
            id: application.id,
            status: application.status,
            internshipId: application.internshipId
          } : null
        };
      }));
      
      res.json(enrichedRequests);
    } catch (error) {
      console.error("Error fetching school document requests:", error);
      res.status(500).json({ message: "Error fetching school document requests" });
    }
  });
  
  // Mettre à jour le statut d'une demande de document
  app.patch("/api/document-requests/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      const requestId = parseInt(req.params.id);
      const { status } = req.body;
      
      // Vérifier que l'utilisateur est une école
      if (user.userType.toUpperCase() !== "SCHOOL") {
        return res.status(403).json({ message: "Access denied. Only schools can update document requests" });
      }
      
      // Obtenir la demande de document
      const request = await storage.getDocumentRequest(requestId);
      if (!request) {
        return res.status(404).json({ message: "Document request not found" });
      }
      
      // Obtenir le profil d'école
      const school = await storage.getSchoolByUserId(user.id);
      if (!school || school.id !== request.schoolId) {
        return res.status(403).json({ message: "Not authorized to update this document request" });
      }
      
      // Mettre à jour la demande
      const updatedRequest = await storage.updateDocumentRequest(requestId, status);
      
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating document request:", error);
      res.status(500).json({ message: "Error updating document request" });
    }
  });
  
  // Route pour transférer un document partagé à une entreprise
  app.post("/api/documents/:documentId/forward", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      const documentId = parseInt(req.params.documentId);
      const { companyId } = req.body;
      
      // Vérifier que l'utilisateur est un étudiant
      if (user.userType.toUpperCase() !== "STUDENT") {
        return res.status(403).json({ message: "Access denied. Only students can forward documents" });
      }
      
      // Obtenir le profil étudiant
      const student = await storage.getStudentByUserId(user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      // Transférer le document
      const forwardedDocument = await storage.forwardDocumentToCompany(documentId, student.id, companyId);
      
      if (!forwardedDocument) {
        return res.status(404).json({ message: "Document not found or not shared with you" });
      }
      
      res.json(forwardedDocument);
    } catch (error) {
      console.error("Error forwarding document:", error);
      res.status(500).json({ message: "Error forwarding document" });
    }
  });
  
  // Téléchargement de documents à partir du chemin de fichier
  app.get("/api/documents/download/:filePath", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const filePath = req.params.filePath;
      const fullPath = path.join("uploads", filePath);
      
      // Vérifier que le fichier existe
      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ message: "File not found" });
      }
      
      // Envoyer le fichier
      res.download(fullPath);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ message: "Error downloading file" });
    }
  });
  
  // Téléchargement de fichiers CV et autres documents avec chemin absolu
  app.get("/api/download", async (req, res) => {
    try {
      const filePath = req.query.path;
      
      if (!filePath || typeof filePath !== 'string') {
        return res.status(400).json({ message: "File path is required" });
      }

      console.log("Nom du fichier demandé:", filePath)
      
      // Sécurisation du chemin pour empêcher la traversée de répertoires
      const normalizedPath = path.normalize(filePath);
      if (normalizedPath.includes('..')) {
        return res.status(403).json({ message: "Invalid file path" });
      }
      
      // const decodedPath = decodeURIComponent(normalizedPath);
      // const fullPath = path.isAbsolute(decodedPath) 
      //   ? decodedPath 
            //   : path.join(process.cwd(), decodedPath);
      const decodedPath = decodeURIComponent(normalizedPath);
      const fullPath = path.isAbsolute(decodedPath)
        ? decodedPath
        : path.join(__dirname, '../../InternSync/uploads', decodedPath);





      
      console.log("Attempting to download file:", fullPath);
      
      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ message: "File not found", path: fullPath });
      }
      
      // Déterminer le type MIME en fonction de l'extension du fichier
      const ext = path.extname(fullPath).toLowerCase();
      let contentType = 'application/octet-stream'; // Type par défaut
      
      if (ext === '.pdf') {
        contentType = 'application/pdf';
      } else if (ext === '.png') {
        contentType = 'image/png';
      } else if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === '.txt') {
        contentType = 'text/plain';
      }
      
      // Lire le fichier
      const fileContent = fs.readFileSync(fullPath);
      
      // Définir les en-têtes
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(fullPath)}"`);
      
      // Envoyer le fichier
      res.send(fileContent);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ message: "Error downloading file" });
    }
  });


// app.get("/api/download", async (req, res) => {
//   try {
//     const filePath = req.query.path;

//     if (!filePath || typeof filePath !== 'string') {
//       return res.status(400).json({ message: "File path is required" });
//     }

//     const safeFileName = decodeURIComponent(filePath).replace(/\\/g, '').replace(/\.\./g, '');
//     const fullPath = path.join(__dirname, '../../uploads', safeFileName);

//     console.log("🔍 Attempting to download:", fullPath);

//     if (!fs.existsSync(fullPath)) {
//       return res.status(404).json({ message: "File not found", path: fullPath });
//     }

//     const ext = path.extname(fullPath).toLowerCase();
//     let contentType = 'application/octet-stream';

//     if (ext === '.pdf') contentType = 'application/pdf';
//     else if (ext === '.doc' || ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
//     else if (ext === '.txt') contentType = 'text/plain';

//     res.setHeader('Content-Type', contentType);
//     res.setHeader('Content-Disposition', `attachment; filename="${path.basename(fullPath)}"`);

//     const fileContent = fs.readFileSync(fullPath);
//     res.send(fileContent);

//   } catch (error: any) {
//     console.error("❌ Error downloading file:", error.message);
//     console.error("📂 Stack trace:", error.stack);
//     res.status(500).json({ message: "Error downloading file" });
//   }
// });

  // Route pour visualiser un document (comme un CV)
  app.get("/api/documents/view/:fileName", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const fileName = req.params.fileName;
      
      // Chercher le fichier dans le dossier uploads
      const uploadDir = path.resolve("uploads");
      const files = fs.readdirSync(uploadDir);
      
      // Chercher le fichier qui correspond au nom de fichier demandé
      const targetFile = files.find(file => file === fileName);
      
      if (!targetFile) {
        console.error(`File ${fileName} not found in uploads directory`);
        return res.status(404).json({ message: "File not found" });
      }
      
      const fullPath = path.join(uploadDir, targetFile);
      
      // Vérifier si le fichier existe
      if (!fs.existsSync(fullPath)) {
        console.error(`File ${fullPath} does not exist`);
        return res.status(404).json({ message: "File not found" });
      }
      
      // Déterminer le type MIME en fonction de l'extension du fichier
      const ext = path.extname(fullPath).toLowerCase();
      let contentType = 'application/octet-stream'; // Type par défaut
      
      if (ext === '.pdf') {
        contentType = 'application/pdf';
      } else if (ext === '.png') {
        contentType = 'image/png';
      } else if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === '.txt') {
        contentType = 'text/plain';
      }
      
      // Définir l'en-tête de type de contenu
      res.setHeader('Content-Type', contentType);
      
      // Afficher le fichier directement dans le navigateur
      const fileStream = fs.createReadStream(fullPath);
      fileStream.pipe(res);
      
    } catch (error) {
      console.error("Error viewing file:", error);
      res.status(500).json({ message: "Error viewing file" });
    }
  });
  
  // Message routes
  // GET /api/student/contacts - Récupérer les contacts pour l'étudiant connecté
  app.get("/api/student/contacts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user;
      
      if (user.userType.toUpperCase() !== "STUDENT") {
        return res.status(403).json({ message: "Accès non autorisé" });
      }
      
      // Obtenir l'étudiant connecté
      const student = await storage.getStudentByUserId(user.id);
      
      if (!student) {
        return res.status(404).json({ message: "Étudiant non trouvé" });
      }
      
      // Récupérer l'école de l'étudiant
      const school = await storage.getSchool(student.schoolId);
      
      // Récupérer les entreprises qui ont des partenariats avec l'école de l'étudiant
      const partnerships = await storage.getPartnershipsBySchool(student.schoolId);
      
      // Récupérer les informations détaillées des entreprises partenaires
      const companies = [];
      for (const partnership of partnerships) {
        const company = await storage.getCompany(partnership.companyId);
        if (company) {
          // Récupérer l'utilisateur associé à l'entreprise
          const companyUser = await storage.getUser(company.userId);
          if (companyUser) {
            companies.push({
              id: companyUser.id,
              name: company.name,
              email: companyUser.email,
              userType: companyUser.userType,
              avatar: company.logo || null
            });
          }
        }
      }
      
      // Récupérer les informations de l'école de l'étudiant
      let schoolContact = null;
      if (school) {
        const schoolUser = await storage.getUser(school.userId);
        if (schoolUser) {
          schoolContact = {
            id: schoolUser.id,
            name: school.name,
            email: schoolUser.email,
            userType: schoolUser.userType,
            avatar: school.logo || null
          };
        }
      }
      
      // Combiner les contacts (école + entreprises)
      const contacts = schoolContact ? [schoolContact, ...companies] : companies;
      
      // Pour chaque contact, récupérer le dernier message et le nombre de messages non lus
      for (const contact of contacts) {
        // Récupérer les messages entre l'utilisateur courant et le contact
        const messages = await storage.getMessagesBetweenUsers(user.id, contact.id);
        
        // Trouver le dernier message
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          contact.lastMessage = lastMessage.content;
          contact.lastMessageTime = lastMessage.createdAt;
          
          // Compter les messages non lus
          const unreadCount = messages.filter(
            msg => msg.receiverId === user.id && !msg.isRead
          ).length;
          
          contact.unreadCount = unreadCount;
        }
      }
      
      // Trier les contacts par date du dernier message (les plus récents en premier)
      contacts.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });
      
      console.log("Contacts renvoyés à l'étudiant:", contacts);
      res.json(contacts);
    } catch (error) {
      console.error("Erreur lors de la récupération des contacts:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // GET /api/company/contacts - Récupérer les contacts pour l'entreprise connectée
  app.get("/api/company/contacts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user;
      
      if (user.userType.toUpperCase() !== "COMPANY") {
        return res.status(403).json({ message: "Accès non autorisé" });
      }
      
      // Obtenir l'entreprise connectée
      const company = await storage.getCompanyByUserId(user.id);
      
      if (!company) {
        return res.status(404).json({ message: "Entreprise non trouvée" });
      }
      
      // Récupérer les partenariats de l'entreprise
      const partnerships = await storage.getPartnershipsByCompany(company.id);
      
      // Récupérer les écoles partenaires
      const schools = [];
      for (const partnership of partnerships) {
        const school = await storage.getSchool(partnership.schoolId);
        if (school) {
          const schoolUser = await storage.getUser(school.userId);
          if (schoolUser) {
            schools.push({
              id: schoolUser.id,
              name: school.name,
              email: schoolUser.email,
              userType: schoolUser.userType,
              avatar: school.logo || null
            });
          }
        }
      }
      
      // Récupérer les étudiants qui ont posé des candidatures aux offres de l'entreprise
      const internships = await storage.getInternshipsByCompany(company.id);
      const studentContacts = new Map();
      
      for (const internship of internships) {
        const applications = await storage.getApplicationsByInternship(internship.id);
        for (const application of applications) {
          const student = await storage.getStudent(application.studentId);
          if (student && !studentContacts.has(student.id)) {
            const studentUser = await storage.getUser(student.userId);
            if (studentUser) {
              studentContacts.set(student.id, {
                id: studentUser.id,
                name: `${student.firstName} ${student.lastName}`,
                email: studentUser.email,
                userType: studentUser.userType,
                avatar: student.avatar || null
              });
            }
          }
        }
      }
      
      // Combiner tous les contacts
      const contacts = [...schools, ...studentContacts.values()];
      
      // Pour chaque contact, récupérer le dernier message et le nombre de messages non lus
      for (const contact of contacts) {
        // Récupérer les messages entre l'utilisateur courant et le contact
        const messages = await storage.getMessagesBetweenUsers(user.id, contact.id);
        
        // Trouver le dernier message
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          contact.lastMessage = lastMessage.content;
          contact.lastMessageTime = lastMessage.createdAt;
          
          // Compter les messages non lus
          const unreadCount = messages.filter(
            msg => msg.receiverId === user.id && !msg.isRead
          ).length;
          
          contact.unreadCount = unreadCount;
        }
      }
      
      // Trier les contacts par date du dernier message (les plus récents en premier)
      contacts.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });
      
      console.log("Contacts renvoyés à l'entreprise:", contacts);
      res.json(contacts);
    } catch (error) {
      console.error("Erreur lors de la récupération des contacts:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  
  // GET /api/school/contacts - Récupérer les contacts pour l'école connectée
  app.get("/api/school/contacts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user;
      
      if (user.userType.toUpperCase() !== "SCHOOL") {
        return res.status(403).json({ message: "Accès non autorisé" });
      }
      
      // Obtenir l'école connectée
      const school = await storage.getSchoolByUserId(user.id);
      
      if (!school) {
        return res.status(404).json({ message: "École non trouvée" });
      }
      
      // Récupérer les partenariats de l'école
      const partnerships = await storage.getPartnershipsBySchool(school.id);
      
      // Récupérer les entreprises partenaires
      const companies = [];
      for (const partnership of partnerships) {
        const company = await storage.getCompany(partnership.companyId);
        if (company) {
          const companyUser = await storage.getUser(company.userId);
          if (companyUser) {
            companies.push({
              id: companyUser.id,
              name: company.name,
              email: companyUser.email,
              userType: companyUser.userType,
              avatar: company.logo || null
            });
          }
        }
      }
      
      // Récupérer les étudiants de l'école
      const students = await storage.getStudentsBySchool(school.id);
      const studentContacts = [];
      
      for (const student of students) {
        const studentUser = await storage.getUser(student.userId);
        if (studentUser) {
          studentContacts.push({
            id: studentUser.id,
            name: `${student.firstName} ${student.lastName}`,
            email: studentUser.email,
            userType: studentUser.userType,
            avatar: student.avatar || null
          });
        }
      }
      
      // Combiner tous les contacts
      const contacts = [...companies, ...studentContacts];
      
      // Pour chaque contact, récupérer le dernier message et le nombre de messages non lus
      for (const contact of contacts) {
        // Récupérer les messages entre l'utilisateur courant et le contact
        const messages = await storage.getMessagesBetweenUsers(user.id, contact.id);
        
        // Trouver le dernier message
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          contact.lastMessage = lastMessage.content;
          contact.lastMessageTime = lastMessage.createdAt;
          
          // Compter les messages non lus
          const unreadCount = messages.filter(
            msg => msg.receiverId === user.id && !msg.isRead
          ).length;
          
          contact.unreadCount = unreadCount;
        }
      }
      
      // Trier les contacts par date du dernier message (les plus récents en premier)
      contacts.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });
      
      console.log("Contacts renvoyés à l'école:", contacts);
      res.json(contacts);
    } catch (error) {
      console.error("Erreur lors de la récupération des contacts:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  
  app.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      const messages = await storage.getMessagesByUser(user.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });
  
  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      
      const validationResult = insertMessageSchema.safeParse({
        ...req.body,
        senderId: user.id
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid message data", errors: validationResult.error.errors });
      }
      
      const message = await storage.createMessage(validationResult.data);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Error sending message" });
    }
  });
  
  app.put("/api/messages/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      
      const message = await storage.getMessage(id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      if (message.receiverId !== user.id) {
        return res.status(403).json({ message: "Not authorized to mark this message as read" });
      }
      
      const updatedMessage = await storage.markMessageAsRead(id);
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ message: "Error marking message as read" });
    }
  });
  
  // Marquer tous les messages d'un utilisateur comme lus
  app.post("/api/messages/read/:userId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const currentUser = req.user;
      const otherUserId = parseInt(req.params.userId);
      
      // Récupérer tous les messages entre les deux utilisateurs
      const messages = await storage.getMessagesBetweenUsers(currentUser.id, otherUserId);
      
      // Filtrer les messages non lus où l'utilisateur actuel est le destinataire
      const unreadMessages = messages.filter(
        msg => msg.receiverId === currentUser.id && !msg.isRead
      );
      
      // Marquer chaque message comme lu
      const updatePromises = unreadMessages.map(message => 
        storage.markMessageAsRead(message.id)
      );
      
      await Promise.all(updatePromises);
      
      res.status(200).json({ message: "All messages marked as read" });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Error marking messages as read" });
    }
  });

  
  // API pour récupérer les informations d'un utilisateur
  app.get("http://localhost:8080/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      // Récupérer le profil de l'utilisateur en fonction de son type
      let profile;
      if (user.userType === UserType.STUDENT) {
        profile = await storage.getStudentByUserId(id);
      } else if (user.userType === UserType.COMPANY) {
        profile = await storage.getCompanyByUserId(id);
      } else if (user.userType === UserType.SCHOOL) {
        profile = await storage.getSchoolByUserId(id);
      }
      
      // Ne pas renvoyer le mot de passe
      const { password, ...secureUser } = user;
      
      res.json({
        ...secureUser,
        profile
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur" });
    }
  });
  
  // Get conversation between two users
  app.get("/api/conversations/:userId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const currentUser = req.user;
      const otherUserId = parseInt(req.params.userId);
      
      // Get messages between these two users
      const messages = await storage.getMessagesBetweenUsers(currentUser.id, otherUserId);
      
      // Get user details for the other user
      const otherUser = await storage.getUser(otherUserId);
      if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get profile based on user type
      let otherUserProfile;
      if (otherUser.userType === "COMPANY") {
        otherUserProfile = await storage.getCompanyByUserId(otherUserId);
      } else if (otherUser.userType === "SCHOOL") {
        otherUserProfile = await storage.getSchoolByUserId(otherUserId);
      } else if (otherUser.userType === "STUDENT") {
        otherUserProfile = await storage.getStudentByUserId(otherUserId);
      }
      
      const conversation = {
        messages,
        user: {
          id: otherUser.id,
          email: otherUser.email,
          username: otherUser.username,
          userType: otherUser.userType,
          profile: otherUserProfile
        }
      };
      
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Error fetching conversation" });
    }
  });
  
    // Middleware to ensure authentication
  function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: 'Not authenticated' });
  }


   // Import Request and Response from express at the top if not already:
   // import type { Request, Response } from "express";
   app.get('/api/student/context', ensureAuthenticated, async (req, res) => {
    console.log("USER:", req.user);
    const userId = req.user?.id;

    try {
      // Récupérer l'étudiant
      const studentResult = await pool.query(
        'SELECT id, school_id FROM students WHERE user_id = $1',
        [userId]
      );
      if (studentResult.rowCount === 0) return res.status(404).json({ error: 'Student not found' });

      const studentId = studentResult.rows[0].id;
      const schoolId = studentResult.rows[0].school_id;

      // Récupérer le nom de l’école
      const schoolResult = await pool.query(
        'SELECT name FROM schools WHERE id = $1',
        [schoolId]
      );
      const schoolName = schoolResult.rows[0]?.name || null;

      // Récupérer la dernière application si elle existe
      const applicationResult = await pool.query(
        'SELECT id FROM applications WHERE student_id = $1 ORDER BY created_at DESC LIMIT 1',
        [studentId]
      );
      const latestApplicationId = applicationResult.rows[0]?.id || null;
      console.log({
        studentId,
        schoolId,
        schoolName,
        latestApplicationId,
      });

      res.json({
        studentId,
        schoolId,
        schoolName,
        latestApplicationId,
      });
    } catch (err) {
      console.error('Error fetching student context:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Start a new conversation or send message in existing conversation
  app.post("/api/conversations/:userId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const sender = req.user;
      const receiverId = parseInt(req.params.userId);
      
      // Check if receiver exists
      const receiver = await storage.getUser(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      // Create message
      const messageData = {
        senderId: sender.id,
        receiverId,
        content: req.body.content,
        isRead: false
      };
      
      const validationResult = insertMessageSchema.safeParse(messageData);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid message data", errors: validationResult.error.errors });
      }
      
      const message = await storage.createMessage(validationResult.data);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Error sending message" });
    }
  });
  
  // School - Company partnerships
  app.get("/api/partnerships", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      let partnerships = [];
      
      if (user.userType === UserType.SCHOOL) {
        const school = await storage.getSchoolByUserId(user.id);
        if (school) {
          partnerships = await storage.getPartnershipsBySchool(school.id);
        }
      } else if (user.userType === UserType.COMPANY) {
        const company = await storage.getCompanyByUserId(user.id);
        if (company) {
          partnerships = await storage.getPartnershipsByCompany(company.id);
        }
      } else {
        return res.status(403).json({ message: "Not authorized to view partnerships" });
      }
      
      res.json(partnerships);
    } catch (error) {
      res.status(500).json({ message: "Error fetching partnerships" });
    }
  });
  
  app.post("/api/partnerships", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      
      // Vérification insensible à la casse du type d'utilisateur
      if (user.userType.toUpperCase() !== "SCHOOL") {
        return res.status(403).json({ message: "Only schools can create partnerships" });
      }
      
      const school = await storage.getSchoolByUserId(user.id);
      if (!school) {
        return res.status(404).json({ message: "School profile not found" });
      }
      
      const validationResult = insertPartnershipSchema.safeParse({
        ...req.body,
        schoolId: school.id
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid partnership data", errors: validationResult.error.errors });
      }
      
      // Check if company exists
      const company = await storage.getCompany(validationResult.data.companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      // Check if partnership already exists
      const existingPartnership = await storage.getPartnership(school.id, company.id);
      if (existingPartnership) {
        return res.status(400).json({ message: "Partnership already exists" });
      }
      
      const partnership = await storage.createPartnership(validationResult.data);
      res.status(201).json(partnership);
    } catch (error) {
      res.status(500).json({ message: "Error creating partnership" });
    }
  });

  // User management by school
  app.get("/api/school/students", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      
      if (user.userType !== "SCHOOL") {
        return res.status(403).json({ message: "Only schools can access student list" });
      }
      
      const school = await storage.getSchoolByUserId(user.id);
      if (!school) {
        return res.status(404).json({ message: "School profile not found" });
      }
      
      const students = await storage.getStudentsBySchool(school.id);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Error fetching students" });
    }
  });
  
  // Update user's profile
  app.put("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      let updatedProfile = null;
      
      // Log pour débugger
      console.log("Mise à jour du profil - userType:", user.userType);
      console.log("Données reçues:", req.body);
      
      
      switch (user.userType) {
        case "STUDENT":
        case "student": {
          const student = await storage.getStudentByUserId(user.id);
          if (student) {
            updatedProfile = await storage.updateStudent(student.id, req.body);
          }
          break;
        }
        case "COMPANY":
        case "company": {
          const company = await storage.getCompanyByUserId(user.id);
          if (company) {
            updatedProfile = await storage.updateCompany(company.id, req.body);
          }
          break;
        }
        case "SCHOOL":
        case "school": {
          const school = await storage.getSchoolByUserId(user.id);
          if (school) {
            updatedProfile = await storage.updateSchool(school.id, req.body);
          }
          break;
        }
      }
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Error updating profile" });
    }
  });
  
  // API pour envoyer un e-mail à une entreprise
  app.post("/api/companies/:id/contact", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      const companyId = parseInt(req.params.id);
      const { subject, message } = req.body;
      
      // Récupérer les informations de l'école expéditrice
      let senderName = user.username;
      let senderEmail = user.email;
      
      if (user.userType === UserType.SCHOOL) {
        const school = await storage.getSchoolByUserId(user.id);
        if (school) {
          senderName = school.name;
        }
      } else {
        return res.status(403).json({ message: "Seules les écoles peuvent contacter les entreprises via cette API" });
      }
      
      // Récupérer les informations de l'entreprise destinataire
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Entreprise non trouvée" });
      }
      
      // Récupérer l'utilisateur entreprise pour obtenir son e-mail
      const companyUser = await storage.getUser(company.userId);
      if (!companyUser) {
        return res.status(404).json({ message: "Utilisateur entreprise non trouvé" });
      }
      
      // Envoyer l'e-mail
      const success = await sendContactEmail(
        senderEmail,
        companyUser.email,
        senderName,
        subject,
        message
      );
      
      if (success) {
        // Ajouter également un message dans le système de messagerie interne
        const messageData = {
          senderId: user.id,
          receiverId: company.userId,
          content: message,
          isRead: false
        };
        
        await storage.createMessage(messageData);
        
        res.json({ success: true, message: "Message envoyé avec succès" });
      } else {
        res.status(500).json({ success: false, message: "Échec de l'envoi du message via SendGrid" });
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'e-mail:", error);
      res.status(500).json({ success: false, message: "Erreur lors de l'envoi du message" });
    }
  });
  
  // Get all companies
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      
      const enhancedCompanies = await Promise.all(companies.map(async (company) => {
        // Get user associated with this company to retrieve email
        const user = await storage.getUser(company.userId);
        
        return {
          ...company,
          email: user?.email || '',
        };
      }));
      
      res.json(enhancedCompanies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Error fetching companies" });
    }
  });
  
  // Get company details with additional information
  app.get("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const company = await storage.getCompany(id);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      // Get user associated with this company
      const user = await storage.getUser(company.userId);
      if (!user) {
        return res.status(404).json({ message: "Company user not found" });
      }
      
      // Get active internships from this company
      const internships = await storage.getInternshipsByCompany(company.id);
      
      // Get company statistics
      const activeInternshipsCount = internships.filter(i => i.isActive).length;
      const totalInternshipsCount = internships.length;
      
      // Compile enhanced company profile
      const enhancedCompany = {
        ...company,
        email: user.email,
        activeInternships: activeInternshipsCount,
        totalInternships: totalInternshipsCount,
        internships: internships.map(i => ({
          id: i.id,
          title: i.title,
          status: i.status,
          isActive: i.isActive
        }))
      };
      
      res.json(enhancedCompany);
    } catch (error) {
      console.error("Error fetching company details:", error);
      res.status(500).json({ message: "Error fetching company" });
    }
  });
  
  // Route pour l'enregistrement d'un étudiant par une école
  app.post("/api/register/student", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      
      // Vérifier que l'utilisateur est bien une école
      if (user.userType !== UserType.SCHOOL) {
        return res.status(403).json({ message: "Only schools can register students" });
      }
      
      // Récupérer l'école
      const school = await storage.getSchoolByUserId(user.id);
      if (!school) {
        return res.status(404).json({ message: "School profile not found" });
      }
      
      // Valider les données de l'étudiant
      const studentData = {
        ...req.body,
        schoolId: school.id,
        userType: UserType.STUDENT
      };

      console.log("Données d'enregistrement de l'étudiant:", studentData);
      
      // Enregistrer l'étudiant
      const result = await storage.registerStudent(studentData);
      
      res.status(201).json(result);
    } catch (error: any) {
      console.error("Erreur lors de l'enregistrement de l'étudiant:", error);
      
      if (error.message === "Username already exists" || error.message === "Email already exists") {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Error registering student", error: error.message });
    }
  });
  
  // Internship History routes
  app.get("/api/internship-history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      let histories = [];
      
      if (user.userType.toUpperCase() === "STUDENT") {
        const student = await storage.getStudentByUserId(user.id);
        if (student) {
          histories = await storage.getInternshipHistoriesByStudent(student.id);
        }
      } else if (user.userType.toUpperCase() === "COMPANY") {
        const company = await storage.getCompanyByUserId(user.id);
        if (company) {
          histories = await storage.getInternshipHistoriesByCompany(company.id);
        }
      } else if (user.userType.toUpperCase() === "SCHOOL") {
        const school = await storage.getSchoolByUserId(user.id);
        if (school) {
          histories = await storage.getInternshipHistoriesBySchool(school.id);
        }
      }
      
      res.json({ histories });
    } catch (error) {
      console.error("Error fetching internship history:", error);
      res.status(500).json({ message: "Error fetching internship history" });
    }
  });
  
  app.get("/api/internship-history/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const history = await storage.getInternshipHistory(id);
      
      if (!history) {
        return res.status(404).json({ message: "Internship history not found" });
      }
      
      res.json(history);
    } catch (error) {
      console.error("Error fetching internship history:", error);
      res.status(500).json({ message: "Error fetching internship history" });
    }
  });
  
  app.get("/api/internship-history/student/:id", async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);
      const histories = await storage.getInternshipHistoriesByStudent(studentId);
      res.json({ histories });
    } catch (error) {
      console.error("Error fetching student internship history:", error);
      res.status(500).json({ message: "Error fetching student internship history" });
    }
  });
  
  app.get("/api/internship-history/company/:id", async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const histories = await storage.getInternshipHistoriesByCompany(companyId);
      res.json({ histories });
    } catch (error) {
      console.error("Error fetching company internship history:", error);
      res.status(500).json({ message: "Error fetching company internship history" });
    }
  });
  
  app.get("/api/internship-history/school/:id", async (req, res) => {
    try {
      const schoolId = parseInt(req.params.id);
      const histories = await storage.getInternshipHistoriesBySchool(schoolId);
      res.json({ histories });
    } catch (error) {
      console.error("Error fetching school internship history:", error);
      res.status(500).json({ message: "Error fetching school internship history" });
    }
  });
  
  app.post("/api/internship-history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user;
      const validationResult = insertInternshipHistorySchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid internship history data", errors: validationResult.error.errors });
      }
      
      // Ensure the user has appropriate permissions to create an internship history
      if (user.userType.toUpperCase() === "COMPANY") {
        const company = await storage.getCompanyByUserId(user.id);
        if (!company || company.id !== validationResult.data.companyId) {
          return res.status(403).json({ message: "Not authorized to create this internship history" });
        }
      } else if (user.userType.toUpperCase() === "SCHOOL") {
        const school = await storage.getSchoolByUserId(user.id);
        if (!school || school.id !== validationResult.data.schoolId) {
          return res.status(403).json({ message: "Not authorized to create this internship history" });
        }
      } else {
        return res.status(403).json({ message: "Only companies and schools can create internship history" });
      }
      
      const history = await storage.createInternshipHistory(validationResult.data);
      res.status(201).json(history);
    } catch (error) {
      console.error("Error creating internship history:", error);
      res.status(500).json({ message: "Error creating internship history" });
    }
  });
  
  app.put("/api/internship-history/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      const history = await storage.getInternshipHistory(id);
      
      if (!history) {
        return res.status(404).json({ message: "Internship history not found" });
      }
      
      // Ensure the user has appropriate permissions to update this internship history
      if (user.userType.toUpperCase() === "COMPANY") {
        const company = await storage.getCompanyByUserId(user.id);
        if (!company || company.id !== history.companyId) {
          return res.status(403).json({ message: "Not authorized to update this internship history" });
        }
      } else if (user.userType.toUpperCase() === "SCHOOL") {
        const school = await storage.getSchoolByUserId(user.id);
        if (!school || school.id !== history.schoolId) {
          return res.status(403).json({ message: "Not authorized to update this internship history" });
        }
      } else {
        return res.status(403).json({ message: "Only companies and schools can update internship history" });
      }
      
      const updatedHistory = await storage.updateInternshipHistory(id, req.body);
      res.json(updatedHistory);
    } catch (error) {
      console.error("Error updating internship history:", error);
      res.status(500).json({ message: "Error updating internship history" });
    }
  });
  
  app.put("/api/internship-history/:id/validate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      
      if (user.userType.toUpperCase() !== "SCHOOL") {
        return res.status(403).json({ message: "Only schools can validate internship history" });
      }
      
      const school = await storage.getSchoolByUserId(user.id);
      if (!school) {
        return res.status(404).json({ message: "School profile not found" });
      }
      
      const validatedHistory = await storage.validateInternshipHistory(id, school.id);
      
      if (!validatedHistory) {
        return res.status(404).json({ message: "Internship history not found or not associated with this school" });
      }
      
      res.json(validatedHistory);
    } catch (error) {
      console.error("Error validating internship history:", error);
      res.status(500).json({ message: "Error validating internship history" });
    }
  });
// server/routes.ts ou server/documentsRoutes.ts


app.post('/api/documents/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  // return res.status(200).json({
  //   id: Date.now(), // ID fictif (remplacer par DB si besoin)
  //   originalName: req.file.originalname,
  //   path: req.file.filename
  // });
  return res.status(200).json({
  id: Date.now(), // ou l’ID de la base si tu l’enregistres
  originalName: req.file.originalname,
  path: req.file.filename // <-- très important
});

});

  
  // Create a server and return it
  const httpServer = createServer(app);
  return httpServer;
}
// function fileURLToPath(url: string): string {
//   // If already a normal path, return as is
//   if (!url.startsWith("file://")) return url;
//   // Use Node.js URL API to convert file URL to path
//   return require("url").fileURLToPath(url);
// }

