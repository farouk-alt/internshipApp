import { pgTable, text, serial, integer, boolean, timestamp, primaryKey, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User types enum and schema
export const UserType = {
  STUDENT: "STUDENT",
  COMPANY: "COMPANY",
  SCHOOL: "SCHOOL",
} as const;

export type UserTypeValues = typeof UserType[keyof typeof UserType];

// Base users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  username: text("username").notNull(),
  userType: text("userType").$type<UserTypeValues>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Students table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  schoolId: integer("school_id").references(() => schools.id),
  bio: text("bio"),
  avatar: text("avatar"),
  phone: text("phone"),
  program: text("program"),
  graduationYear: integer("graduation_year"),
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  website: text("website"),
  industry: text("industry"),
  size: text("size"),
  location: text("location"),
});

// Schools table
export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  website: text("website"),
  address: text("address"),
});

// Internships table
export const internships = pgTable("internships", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  duration: text("duration").notNull(),
  requirements: text("requirements"),
  responsibilities: text("responsibilities"),
  skills: text("skills").$type<string[]>().array(),
  status: text("status").default("pending"), // pending, approved, rejected
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  internshipId: integer("internship_id").notNull().references(() => internships.id),
  status: text("status").default("pending"), // pending, accepted, rejected, interviewing
  coverLetter: text("cover_letter"),
  cvPath: text("cv_path"), // Chemin vers le fichier CV
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // cv, motivationLetter, schoolForm, etc.
  path: text("path").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// School-Company partnerships table
export const schoolCompanyPartnerships = pgTable("school_company_partnerships", {
  schoolId: integer("school_id").notNull().references(() => schools.id),
  companyId: integer("company_id").notNull().references(() => companies.id),
  status: text("status").default("active"), // active, inactive
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.schoolId, t.companyId] })
}));

// Document requests table - pour les demandes de documents par les étudiants
export const documentRequests = pgTable("document_requests", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  applicationId: integer("application_id").references(() => applications.id),
  status: text("status").default("pending"), // pending, approved, rejected
  requestType: text("request_type").notNull(), // Convention de stage, Attestation, etc.
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shared documents table - pour le partage de documents entre utilisateurs
export const sharedDocuments = pgTable("shared_documents", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => documents.id),
  sharedByUserId: integer("shared_by_user_id").notNull().references(() => users.id),
  sharedWithUserId: integer("shared_with_user_id").notNull().references(() => users.id),
  applicationId: integer("application_id").references(() => applications.id),
  // Colonne supprimée car elle n'existe pas dans la base de données
  // documentRequestId: integer("document_request_id").references(() => documentRequests.id),
  sharedAt: timestamp("shared_at").defaultNow(),
  message: text("message"),
  isRead: boolean("is_read").default(false),
  documentType: text("document_type"), // Convention de stage, Attestation, Évaluation, etc.
  forwardedToCompanyId: integer("forwarded_to_company_id").references(() => companies.id),
  forwardedAt: timestamp("forwarded_at"),
});

// Internship history table - pour garder une trace des stages terminés
export const internshipHistory = pgTable("internship_history", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  companyId: integer("company_id").notNull().references(() => companies.id),
  internshipId: integer("internship_id").references(() => internships.id),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  feedback: text("feedback"),
  rating: integer("rating"), // Note 1-5
  validated: boolean("validated").default(false), // Validation par l'école
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true });
export const insertSchoolSchema = createInsertSchema(schools).omit({ id: true });
export const insertInternshipSchema = createInsertSchema(internships).omit({ id: true, createdAt: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, isRead: true });
export const insertPartnershipSchema = createInsertSchema(schoolCompanyPartnerships).omit({ createdAt: true });
export const insertDocumentRequestSchema = createInsertSchema(documentRequests).omit({ id: true, createdAt: true, updatedAt: true, status: true });
export const insertSharedDocumentSchema = createInsertSchema(sharedDocuments).omit({ id: true, sharedAt: true, isRead: true, forwardedAt: true });
export const insertInternshipHistorySchema = createInsertSchema(internshipHistory).omit({ id: true, createdAt: true });

// Registration schemas
export const studentRegistrationSchema = z.object({
  user: insertUserSchema,
  student: insertStudentSchema.omit({ userId: true, schoolId: true }),
});

export const companyRegistrationSchema = z.object({
  user: insertUserSchema,
  company: insertCompanySchema.omit({ userId: true }),
});

export const schoolRegistrationSchema = z.object({
  user: insertUserSchema,
  school: insertSchoolSchema.omit({ userId: true }),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
// In your schema.ts
export const sessions = pgTable("session", {
  sid: text("sid").notNull().primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire", { withTimezone: true }).notNull()
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type InsertInternship = z.infer<typeof insertInternshipSchema>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertPartnership = z.infer<typeof insertPartnershipSchema>;
export type InsertDocumentRequest = z.infer<typeof insertDocumentRequestSchema>;
export type InsertSharedDocument = z.infer<typeof insertSharedDocumentSchema>;
export type InsertInternshipHistory = z.infer<typeof insertInternshipHistorySchema>;

export type User = typeof users.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type School = typeof schools.$inferSelect;
export type Internship = typeof internships.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Partnership = typeof schoolCompanyPartnerships.$inferSelect;
export type DocumentRequest = typeof documentRequests.$inferSelect;
export type SharedDocument = typeof sharedDocuments.$inferSelect;
export type InternshipHistory = typeof internshipHistory.$inferSelect;

export type StudentRegistration = z.infer<typeof studentRegistrationSchema>;
export type CompanyRegistration = z.infer<typeof companyRegistrationSchema>;
export type SchoolRegistration = z.infer<typeof schoolRegistrationSchema>;
export type Login = z.infer<typeof loginSchema>;
