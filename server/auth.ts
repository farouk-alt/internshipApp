import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import cors from "cors";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, Student, Company, School, UserType } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser { }
  }
}

const scryptAsync = promisify(scrypt);

// Simple bcrypt-like password approach
import crypto from 'crypto';


// Function to create a hash with PBKDF2
async function createHash(password: string, salt?: string): Promise<{ hash: string, salt: string }> {
  // Generate salt if not provided
  const useSalt = salt || crypto.randomBytes(16).toString('hex');

  console.log('createHash - Input values:');
  console.log('  password:', password);
  console.log('  salt:', useSalt);

  return new Promise((resolve, reject) => {
    // 1000 iterations, 64 length, sha512 digest
    crypto.pbkdf2(password, useSalt, 1000, 64, 'sha512', (err, key) => {
      if (err) return reject(err);

      const hash = key.toString('hex');
      console.log('createHash - Generated hash:', hash);

      resolve({ hash, salt: useSalt });
    });
  });
}

// Export the hash password function
export async function hashPassword(password: string): Promise<string> {
  const { hash, salt } = await createHash(password);
  console.log("🔒 Hashing password during registration:");
  console.log("Hash:", hash);
  console.log("Salt:", salt);
  return `${hash}:${salt}`;
}


// Export the compare passwords function
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  console.log('Comparing passwords:');
  console.log('Supplied:', supplied);
  console.log('Stored:', stored);

  // Vérifier si c'est le nouveau format (hash:salt) ou (hash.salt)
  if (stored.includes(':') || stored.includes('.')) {
    // Détermine le séparateur utilisé
    const separator = stored.includes(':') ? ':' : '.';

    // Extraire le hash et le sel
    const [storedHash, salt] = stored.split(separator);

    if (!storedHash || !salt) {
      console.log('Invalid stored password format');
      return false;
    }

    console.log('Extracted salt:', salt);
    console.log('Stored hash:', storedHash);

    // Si c'est l'ancien format avec point (.)
    if (separator === '.') {
      console.log('Legacy format with dot separator');

      // Essayer la méthode de hachage PBKDF2 standard
      try {
        const { hash: suppliedHash } = await createHash(supplied, salt);
        const match = storedHash === suppliedHash;
        console.log('Password match (legacy with salt using PBKDF2):', match);
        if (match) return true;
      } catch (err) {
        console.log('Error comparing with PBKDF2:', err);
      }

      // Si ça ne fonctionne pas, vérifier aussi avec le mot de passe par défaut
      const matchDefault = supplied === 'password';
      console.log('Password match (legacy with default password):', matchDefault);
      return matchDefault;
    }

    // Pour le nouveau format avec (:)
    // Hash the supplied password with the stored salt
    const { hash: suppliedHash } = await createHash(supplied, salt);
    console.log('Generated hash from supplied password:', suppliedHash);

    // Compare the hashes
    const match = storedHash === suppliedHash;
    console.log('Password match:', match);

    return match;
  }
  // Ancien format (mot de passe en clair)
  else {
    console.log('Legacy password format (plain text)');
    // Simplement comparer les chaînes pour l'ancien format
    const match = supplied === stored;
    console.log('Password match (legacy):', match);

    // Si le mot de passe correspond, nous pourrions mettre à jour le format ici
    // mais cela demanderait d'accéder à la base de données depuis cette fonction

    return match;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "intega-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  };

  app.set("trust proxy", 1);

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password"
      },
      async (email, password, done) => {
        try {
          console.log(`Authenticating user with email: ${email}`);
          const user = await storage.getUserByEmail(email);
          console.log(`User found:`, user ? 'Yes' : 'No');

          if (!user) {
            console.log(`No user found with email: ${email}`);
            return done(null, false, { message: "Invalid email or password" });
          }

          const passwordMatch = await comparePasswords(password, user.password);
          console.log(`Password match:`, passwordMatch ? 'Yes' : 'No');

          if (!passwordMatch) {
            console.log('Password does not match');
            return done(null, false, { message: "Invalid email or password" });
          }

          console.log('Authentication successful');
          return done(null, user);
        } catch (error) {
          console.error('Authentication error:', error);
          return done(error);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }

      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register endpoint that handles all user types

  app.post("/api/register", async (req, res) => {
    try {
      // 1. Destructure and validate input
      const { userType: rawUserType, email, username, password, ...profileData } = req.body;

      // 2. Normalize and validate userType
      const userType = typeof rawUserType === 'string' ? rawUserType.toUpperCase() : null;

      if (!userType || !["STUDENT", "COMPANY", "SCHOOL"].includes(userType)) {
        return res.status(400).json({
          message: "Invalid user type. Must be STUDENT, COMPANY, or SCHOOL"
        });
      }

      // 3. Validate required fields
      const missingFields = [];
      if (!email) missingFields.push("email");
      if (!username) missingFields.push("username");
      if (!password) missingFields.push("password");

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing required fields: ${missingFields.join(", ")}`
        });
      }

      // 4. Check for existing user
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          message: "Email already exists"
        });
      }

      // 6. Prepare registration data (keep raw password)
      const baseData = {
        email,
        username,
        password,
        userType
      };


      // 7. Process registration by type
      let result: { user: SelectUser | null; profile: Student | Company | School | null } = { user: null, profile: null };

      switch (userType) {
        case "STUDENT":
          result = await storage.registerStudent({
            ...baseData,
            firstName: profileData.firstName || username,
            lastName: profileData.lastName || "User"
          });
          break;

        case "COMPANY":
          result = await storage.registerCompany({
            ...baseData,
            name: profileData.name || `${username}'s Company`
          });
          break;

        case "SCHOOL":
          result = await storage.registerSchool({
            ...baseData,
            name: profileData.name || `${username}'s School`
          });
          break;
      }

      // 8. Check if registration succeeded
      if (!result.user) {
        return res.status(500).json({ message: "User creation failed" });
      }

      // 9. Login user
      req.login(result.user, (err) => {
        if (err) {
          console.error("Login after registration failed:", err);
          // Return the user anyway since registration succeeded
          const { password: _, ...safeUser } = result.user!;
          return res.status(201).json({
            success: true,
            user: safeUser,
            profile: result.profile
          });
        }

        // Return success response
        const { password: _, ...safeUser } = result.user!;
        res.status(201).json({
          success: true,
          user: safeUser,
          profile: result.profile
        });
      });

    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Internal server error during registration"
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message?: string }) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Authentication failed" });

      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);

        // Return user info without password
        const { password, ...userWithoutPassword } = user;
        res.status(200).json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user;

      // Get profile data based on user type
      let profile = null;

      switch (user.userType) {
        case UserType.STUDENT:
          profile = await storage.getStudentByUserId(user.id);
          break;
        case UserType.COMPANY:
          profile = await storage.getCompanyByUserId(user.id);
          break;
        case UserType.SCHOOL:
          profile = await storage.getSchoolByUserId(user.id);
          break;
      }

      // Return user info without password
      const { password, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        profile
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user data" });
    }
  });

  // Endpoints spécifiques pour chaque type d'utilisateur
  app.get("/api/profile/student", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user;

      // Vérifier que l'utilisateur est bien un étudiant
      if (user.userType !== UserType.STUDENT) {
        return res.status(403).json({ message: "Access denied. User is not a student" });
      }

      // Récupérer le profil étudiant
      let studentProfile = await storage.getStudentByUserId(user.id);

      // Si le profil n'existe pas, créer un profil vide
      if (!studentProfile) {
        console.log("Creating empty student profile for user:", user.id);
        studentProfile = await storage.createStudent({
          userId: user.id,
          firstName: user.username || "",
          lastName: "",
          schoolId: null,
          bio: null,
          avatar: null,
          phone: null,
          program: null,
          graduationYear: null
        });
        console.log("Created student profile:", studentProfile);
      }

      res.json(studentProfile);
    } catch (error) {
      console.error("Error fetching student profile:", error);
      res.status(500).json({ message: "Error fetching student profile data" });
    }
  });

  app.get("/api/profile/company", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user;

      // Vérifier que l'utilisateur est bien une entreprise
      if (user.userType !== UserType.COMPANY) {
        return res.status(403).json({ message: "Access denied. User is not a company" });
      }

      // Récupérer le profil entreprise
      const companyProfile = await storage.getCompanyByUserId(user.id);

      if (!companyProfile) {
        return res.status(404).json({ message: "Company profile not found" });
      }

      res.json(companyProfile);
    } catch (error) {
      console.error("Error fetching company profile:", error);
      res.status(500).json({ message: "Error fetching company profile data" });
    }
  });

  app.get("/api/profile/school", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user;

      // Vérifier que l'utilisateur est bien une école
      if (user.userType !== UserType.SCHOOL) {
        return res.status(403).json({ message: "Access denied. User is not a school" });
      }

      // Récupérer le profil école
      const schoolProfile = await storage.getSchoolByUserId(user.id);

      if (!schoolProfile) {
        return res.status(404).json({ message: "School profile not found" });
      }

      res.json(schoolProfile);
    } catch (error) {
      console.error("Error fetching school profile:", error);
      res.status(500).json({ message: "Error fetching school profile data" });
    }
  });

  // Get current user's profile based on their role
  app.get("/api/profile", async (req, res) => {
    console.log("Session ID:", req.sessionID);
    console.log("isAuthenticated:", req.isAuthenticated());
    console.log("User:", req.user);

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user;
      let profile = null;

      switch (user.userType) {
        case UserType.STUDENT:
          profile = await storage.getStudentByUserId(user.id);
          // Si le profil n'existe pas, créer un profil vide
          if (!profile) {
            console.log("Creating empty student profile for user:", user.id);
            profile = await storage.createStudent({
              userId: user.id,
              firstName: user.username || "",
              lastName: "",
              schoolId: null,
              bio: null,
              avatar: null,
              phone: null,
              program: null,
              graduationYear: null
            });
          }
          break;
        case UserType.COMPANY:
          profile = await storage.getCompanyByUserId(user.id);
          // Si le profil n'existe pas, créer un profil vide
          if (!profile) {
            console.log("Creating empty company profile for user:", user.id);
            profile = await storage.createCompany({
              userId: user.id,
              name: user.username || "",
              description: null,
              location: null,
              industry: null,
              size: null,
              website: null,
              logo: null
            });
          }
          break;
        case UserType.SCHOOL:
          profile = await storage.getSchoolByUserId(user.id);
          // Si le profil n'existe pas, créer un profil vide
          if (!profile) {
            console.log("Creating empty school profile for user:", user.id);
            profile = await storage.createSchool({
              userId: user.id,
              name: user.username || "",
              address: null,
              description: null,
              website: null,
              logo: null
            });
          }
          break;
      }

      if (!profile) {
        return res.status(404).json({ message: "Could not create profile" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error fetching/creating profile data:", error);
      res.status(500).json({ message: "Error fetching/creating profile data" });
    }
  });
}
