import { 
  users, students, companies, schools, internships, applications,
  documents, messages, schoolCompanyPartnerships, internshipHistory,
  documentRequests, sharedDocuments,
  type User, type Student, type Company, type School, 
  type Internship, type Application, type Document, 
  type Message, type Partnership, type InternshipHistory,
  type DocumentRequest, type SharedDocument,
  type InsertUser, type InsertStudent, type InsertCompany, 
  type InsertSchool, type InsertInternship, type InsertApplication,
  type InsertDocument, type InsertMessage, type InsertPartnership,
  type InsertInternshipHistory, type InsertDocumentRequest, type InsertSharedDocument,
  type StudentRegistration, type CompanyRegistration, type SchoolRegistration,
  UserType
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPgSimple from "connect-pg-simple";
import { db } from "./db";
import { eq, and, or, asc, inArray } from "drizzle-orm";
import { pool } from "./db";
import { hashPassword } from "./auth";
type SessionStore = any; // Using any as a temporary fix for session.SessionStore

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPgSimple(session);

// Storage interface
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Student management
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByUserId(userId: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;
  getStudentsBySchool(schoolId: number): Promise<Student[]>;
  getStudentsBySchoolId(schoolId: number): Promise<Student[]>;
  
  // Company management
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyByUserId(userId: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  updateCompanyLogo(id: number, logoPath: string): Promise<Company | undefined>;
  
  // School management
  getSchool(id: number): Promise<School | undefined>;
  getSchoolByUserId(userId: number): Promise<School | undefined>;
  createSchool(school: InsertSchool): Promise<School>;
  updateSchool(id: number, school: Partial<InsertSchool>): Promise<School | undefined>;
  
  // Internship management
  getInternship(id: number): Promise<Internship | undefined>;
  getInternships(): Promise<Internship[]>;
  getInternshipsByCompany(companyId: number): Promise<Internship[]>;
  getInternshipsByStatus(status: string): Promise<Internship[]>;
  createInternship(internship: InsertInternship): Promise<Internship>;
  updateInternship(id: number, internship: Partial<InsertInternship>): Promise<Internship | undefined>;
  
  // Application management
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByStudent(studentId: number): Promise<Application[]>;
  getApplicationsByInternship(internshipId: number): Promise<Application[]>;
  getAcceptedApplicationsBySchoolId(schoolId: number): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application | undefined>;
  
  // Document management
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUser(userId: number): Promise<Document[]>;
  getSharedDocumentsForUser(userId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  shareDocument(data: InsertSharedDocument): Promise<SharedDocument>;
  forwardDocumentToCompany(documentId: number, studentId: number, companyId: number): Promise<SharedDocument | undefined>;
  getSharedDocumentsByApplicationId(applicationId: number): Promise<any[]>;

  
  // Document Request management
  getDocumentRequest(id: number): Promise<DocumentRequest | undefined>;
  getDocumentRequestsByStudent(studentId: number): Promise<DocumentRequest[]>;
  getDocumentRequestsBySchool(schoolId: number): Promise<DocumentRequest[]>;
  getDocumentRequestsByApplication(applicationId: number): Promise<DocumentRequest[]>;
  createDocumentRequest(request: InsertDocumentRequest): Promise<DocumentRequest>;
  updateDocumentRequest(id: number, status: string): Promise<DocumentRequest | undefined>;
  
  // Message management
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]>;
  getMessagesByUser(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  
  // Partnership management
  getPartnership(schoolId: number, companyId: number): Promise<Partnership | undefined>;
  getPartnershipsBySchool(schoolId: number): Promise<Partnership[]>;
  getPartnershipsByCompany(companyId: number): Promise<Partnership[]>;
  createPartnership(partnership: InsertPartnership): Promise<Partnership>;
  updatePartnership(schoolId: number, companyId: number, partnership: Partial<InsertPartnership>): Promise<Partnership | undefined>;
  
  // Internship History management
  getInternshipHistory(id: number): Promise<InternshipHistory | undefined>;
  getInternshipHistoriesByStudent(studentId: number): Promise<InternshipHistory[]>;
  getInternshipHistoriesByCompany(companyId: number): Promise<InternshipHistory[]>;
  getInternshipHistoriesBySchool(schoolId: number): Promise<InternshipHistory[]>;
  createInternshipHistory(history: InsertInternshipHistory): Promise<InternshipHistory>;
  updateInternshipHistory(id: number, history: Partial<InsertInternshipHistory>): Promise<InternshipHistory | undefined>;
  validateInternshipHistory(id: number, schoolId: number): Promise<InternshipHistory | undefined>;
  
  // Registration
  registerStudent(data: StudentRegistration): Promise<{ user: User; student: Student }>;
  registerCompany(data: CompanyRegistration): Promise<{ user: User; company: Company }>;
  registerSchool(data: SchoolRegistration): Promise<{ user: User; school: School }>;
  
  // Session storage
  sessionStore: SessionStore;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private studentsData: Map<number, Student>;
  private companiesData: Map<number, Company>;
  private schoolsData: Map<number, School>;
  private internshipsData: Map<number, Internship>;
  private applicationsData: Map<number, Application>;
  private documentsData: Map<number, Document>;
  private messagesData: Map<number, Message>;
  private partnershipsData: Map<string, Partnership>;
  private internshipHistoryData: Map<number, InternshipHistory>;
  private sharedDocumentsData: Map<string, SharedDocument>;
  private documentRequestsData: Map<number, DocumentRequest>;
  
  sessionStore: SessionStore;
  
  private currentIds: {
    user: number;
    student: number;
    company: number;
    school: number;
    internship: number;
    application: number;
    document: number;
    message: number;
    internshipHistory: number;
    sharedDocument: number;
    documentRequest: number;
  };

  constructor() {
    this.usersData = new Map();
    this.studentsData = new Map();
    this.companiesData = new Map();
    this.schoolsData = new Map();
    this.internshipsData = new Map();
    this.applicationsData = new Map();
    this.documentsData = new Map();
    this.messagesData = new Map();
    this.partnershipsData = new Map();
    this.internshipHistoryData = new Map();
    this.sharedDocumentsData = new Map();
    this.documentRequestsData = new Map();
    
    this.currentIds = {
      user: 1,
      student: 1,
      company: 1,
      school: 1,
      internship: 1,
      application: 1,
      document: 1,
      message: 1,
      internshipHistory: 1,
      sharedDocument: 1,
      documentRequest: 1,
    };
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now
    };
    this.usersData.set(id, user);
    return user;
  }

  // Student management
  async getStudent(id: number): Promise<Student | undefined> {
    return this.studentsData.get(id);
  }

  async getStudentByUserId(userId: number): Promise<Student | undefined> {
    return Array.from(this.studentsData.values()).find(
      (student) => student.userId === userId,
    );
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentIds.student++;
    const student: Student = { ...insertStudent, id };
    this.studentsData.set(id, student);
    return student;
  }

  async updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined> {
    const student = this.studentsData.get(id);
    if (!student) return undefined;
    
    const updatedStudent = { ...student, ...studentData };
    this.studentsData.set(id, updatedStudent);
    return updatedStudent;
  }

  async getStudentsBySchool(schoolId: number): Promise<Student[]> {
    return Array.from(this.studentsData.values()).filter(
      (student) => student.schoolId === schoolId,
    );
  }
  
  async getStudentsBySchoolId(schoolId: number): Promise<Student[]> {
    return Array.from(this.studentsData.values()).filter(
      (student) => student.schoolId === schoolId,
    );
  }
  
  async getAcceptedApplicationsBySchoolId(schoolId: number): Promise<Application[]> {
    // Get all students from this school
    const students = await this.getStudentsBySchoolId(schoolId);
    
    // Get all applications for these students that are accepted
    let acceptedApplications: Application[] = [];
    for (const student of students) {
      const studentApplications = await this.getApplicationsByStudent(student.id);
      const accepted = studentApplications.filter(app => app.status === 'accepted');
      acceptedApplications = [...acceptedApplications, ...accepted];
    }
    
    return acceptedApplications;
  }

  // Company management
  async getCompanies(): Promise<Company[]> {
    return Array.from(this.companiesData.values());
  }
   async  getAllInternships() {
    return await Internship.findAll();
  }
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companiesData.get(id);
  }

  async getCompanyByUserId(userId: number): Promise<Company | undefined> {
    return Array.from(this.companiesData.values()).find(
      (company) => company.userId === userId,
    );
  }

  // Récupérer l'utilisateur associé à l'entreprise
  async getUserByCompanyId(companyId: number): Promise<User | undefined> {
    const company = await this.getCompany(companyId);
    if (!company) return undefined;
    return this.getUser(company.userId);
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = this.currentIds.company++;
    const company: Company = { ...insertCompany, id };
    this.companiesData.set(id, company);
    return company;
  }

  async updateCompany(id: number, companyData: Partial<InsertCompany>): Promise<Company | undefined> {
    const company = this.companiesData.get(id);
    if (!company) return undefined;
    
    const updatedCompany = { ...company, ...companyData };
    this.companiesData.set(id, updatedCompany);
    return updatedCompany;
  }
  
  async updateCompanyLogo(id: number, logoPath: string): Promise<Company | undefined> {
    const company = this.companiesData.get(id);
    if (!company) return undefined;
    
    const updatedCompany = { ...company, logo: logoPath };
    this.companiesData.set(id, updatedCompany);
    return updatedCompany;
  }

  // School management
  async getSchool(id: number): Promise<School | undefined> {
    return this.schoolsData.get(id);
  }

  async getSchoolByUserId(userId: number): Promise<School | undefined> {
    return Array.from(this.schoolsData.values()).find(
      (school) => school.userId === userId,
    );
  }

  async createSchool(insertSchool: InsertSchool): Promise<School> {
    const id = this.currentIds.school++;
    const school: School = { ...insertSchool, id };
    this.schoolsData.set(id, school);
    return school;
  }

  async updateSchool(id: number, schoolData: Partial<InsertSchool>): Promise<School | undefined> {
    const school = this.schoolsData.get(id);
    if (!school) return undefined;
    
    const updatedSchool = { ...school, ...schoolData };
    this.schoolsData.set(id, updatedSchool);
    return updatedSchool;
  }

  // Internship management
  async getInternship(id: number): Promise<Internship | undefined> {
    return this.internshipsData.get(id);
  }

  async getInternships(): Promise<Internship[]> {
    return Array.from(this.internshipsData.values());
  }

  async getInternshipsByCompany(companyId: number): Promise<Internship[]> {
    return Array.from(this.internshipsData.values()).filter(
      (internship) => internship.companyId === companyId,
    );
  }

  async getInternshipsByStatus(status: string): Promise<Internship[]> {
    return Array.from(this.internshipsData.values()).filter(
      (internship) => internship.status === status,
    );
  }

  async createInternship(insertInternship: InsertInternship): Promise<Internship> {
    const id = this.currentIds.internship++;
    const now = new Date();
    const internship: Internship = { 
      ...insertInternship, 
      id,
      createdAt: now
    };
    this.internshipsData.set(id, internship);
    return internship;
  }

  async updateInternship(id: number, internshipData: Partial<InsertInternship>): Promise<Internship | undefined> {
    const internship = this.internshipsData.get(id);
    if (!internship) return undefined;
    
    const updatedInternship = { ...internship, ...internshipData };
    this.internshipsData.set(id, updatedInternship);
    return updatedInternship;
  }

  // Application management
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applicationsData.get(id);
  }

  async getApplicationsByStudent(studentId: number): Promise<Application[]> {
    return Array.from(this.applicationsData.values()).filter(
      (application) => application.studentId === studentId,
    );
  }

  async getApplicationsByInternship(internshipId: number): Promise<Application[]> {
    return Array.from(this.applicationsData.values()).filter(
      (application) => application.internshipId === internshipId,
    );
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.currentIds.application++;
    const now = new Date();
    const application: Application = { 
      ...insertApplication, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.applicationsData.set(id, application);
    return application;
  }

  async updateApplication(id: number, applicationData: Partial<InsertApplication>): Promise<Application | undefined> {
    const application = this.applicationsData.get(id);
    if (!application) return undefined;
    
    const now = new Date();
    const updatedApplication = { ...application, ...applicationData, updatedAt: now };
    this.applicationsData.set(id, updatedApplication);
    return updatedApplication;
  }

  // Document management
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documentsData.get(id);
  }

  async getDocumentsByUser(userId: number): Promise<Document[]> {
    return Array.from(this.documentsData.values()).filter(
      (document) => document.userId === userId,
    );
  }

  async getSharedDocumentsForUser(userId: number): Promise<Document[]> {
    // Dans MemStorage, on simule les documents partagés
    // Dans une implémentation de base de données, on utiliserait une requête JOIN
    const sharedDocuments = Array.from(this.documentsData.values()).filter((document) => {
      // Vérifie si ce document a été partagé avec cet utilisateur
      return Array.from(this.sharedDocumentsData.values()).some(
        (shared) =>
          shared.documentId === document.id && 
          shared.sharedWithUserId === userId
      );
    });
    
    return sharedDocuments;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentIds.document++;
    const now = new Date();
    const document: Document = { 
      ...insertDocument, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.documentsData.set(id, document);
    return document;
  }

  async updateDocument(id: number, documentData: Partial<InsertDocument>): Promise<Document | undefined> {
    const document = this.documentsData.get(id);
    if (!document) return undefined;
    
    const now = new Date();
    const updatedDocument = { ...document, ...documentData, updatedAt: now };
    this.documentsData.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documentsData.delete(id);
  }
  
  async shareDocument(data: InsertSharedDocument): Promise<SharedDocument> {
    const now = new Date();
    const sharedDocument: SharedDocument = {
      ...data,
      id: this.currentIds.sharedDocument++,
      sharedAt: now,
      isRead: false,
      forwardedAt: null,
      forwardedToCompanyId: null
    };
    
    const key = `${sharedDocument.id}`;
    this.sharedDocumentsData.set(key, sharedDocument);
    return sharedDocument;
  }
  
  async forwardDocumentToCompany(documentId: number, studentId: number, companyId: number): Promise<SharedDocument | undefined> {
    // Chercher le document partagé correspondant (partagé avec l'étudiant)
    const studentUser = await this.getStudentByUserId(studentId);
    if (!studentUser) return undefined;
    
    // Trouver le document partagé correspondant à ce document et cet étudiant
    const sharedDoc = Array.from(this.sharedDocumentsData.values()).find(
      (shared) => shared.documentId === documentId && shared.sharedWithUserId === studentUser.userId
    );
    
    if (!sharedDoc) return undefined;
    
    // Créer un nouveau document partagé pour la compagnie
    const company = await this.getCompany(companyId);
    if (!company) return undefined;
    
    const now = new Date();
    const forwardedDoc: SharedDocument = {
      ...sharedDoc,
      id: this.currentIds.sharedDocument++,
      sharedByUserId: studentUser.userId, // L'étudiant devient l'expéditeur
      sharedWithUserId: company.userId,
      sharedAt: now,
      isRead: false,
      message: `Document transféré par l'étudiant`,
      forwardedAt: now,
      forwardedToCompanyId: companyId
    };
    
    // Mettre à jour le document partagé original
    sharedDoc.forwardedToCompanyId = companyId;
    sharedDoc.forwardedAt = now;
    this.sharedDocumentsData.set(`${sharedDoc.id}`, sharedDoc);
    
    // Ajouter le nouveau document partagé
    this.sharedDocumentsData.set(`${forwardedDoc.id}`, forwardedDoc);
    
    return forwardedDoc;
  }
  
  // Document Request management
  async getDocumentRequest(id: number): Promise<DocumentRequest | undefined> {
    return this.documentRequestsData.get(id);
  }
  
  async getDocumentRequestsByStudent(studentId: number): Promise<DocumentRequest[]> {
    return Array.from(this.documentRequestsData.values()).filter(
      (request) => request.studentId === studentId
    );
  }
  
  async getDocumentRequestsBySchool(schoolId: number): Promise<DocumentRequest[]> {
    return Array.from(this.documentRequestsData.values()).filter(
      (request) => request.schoolId === schoolId
    );
  }
  
  async getDocumentRequestsByApplication(applicationId: number): Promise<DocumentRequest[]> {
    return Array.from(this.documentRequestsData.values()).filter(
      (request) => request.applicationId === applicationId
    );
  }
  
  async createDocumentRequest(request: InsertDocumentRequest): Promise<DocumentRequest> {
    const id = this.currentIds.documentRequest++;
    const now = new Date();
    const documentRequest: DocumentRequest = {
      ...request,
      id,
      status: "pending",
      createdAt: now,
      updatedAt: now
    };
    
    this.documentRequestsData.set(id, documentRequest);
    return documentRequest;
  }
  
  async updateDocumentRequest(id: number, status: string): Promise<DocumentRequest | undefined> {
    const request = this.documentRequestsData.get(id);
    if (!request) return undefined;
    
    const now = new Date();
    const updatedRequest = { ...request, status, updatedAt: now };
    this.documentRequestsData.set(id, updatedRequest);
    return updatedRequest;
  }

  // Message management
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messagesData.get(id);
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return Array.from(this.messagesData.values()).filter(
      (message) => 
        (message.senderId === userId1 && message.receiverId === userId2) ||
        (message.senderId === userId2 && message.receiverId === userId1)
    );
  }

  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messagesData.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentIds.message++;
    const now = new Date();
    const message: Message = { 
      ...insertMessage, 
      id,
      isRead: false,
      createdAt: now
    };
    this.messagesData.set(id, message);
    return message;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messagesData.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, isRead: true };
    this.messagesData.set(id, updatedMessage);
    return updatedMessage;
  }

  // Partnership management
  async getPartnership(schoolId: number, companyId: number): Promise<Partnership | undefined> {
    const key = `${schoolId}-${companyId}`;
    return this.partnershipsData.get(key);
  }

  async getPartnershipsBySchool(schoolId: number): Promise<Partnership[]> {
    return Array.from(this.partnershipsData.values()).filter(
      (partnership) => partnership.schoolId === schoolId
    );
  }

  async getPartnershipsByCompany(companyId: number): Promise<Partnership[]> {
    return Array.from(this.partnershipsData.values()).filter(
      (partnership) => partnership.companyId === companyId
    );
  }

  async createPartnership(insertPartnership: InsertPartnership): Promise<Partnership> {
    const key = `${insertPartnership.schoolId}-${insertPartnership.companyId}`;
    const now = new Date();
    const partnership: Partnership = { 
      ...insertPartnership,
      createdAt: now
    };
    this.partnershipsData.set(key, partnership);
    return partnership;
  }

  async updatePartnership(schoolId: number, companyId: number, partnershipData: Partial<InsertPartnership>): Promise<Partnership | undefined> {
    const key = `${schoolId}-${companyId}`;
    const partnership = this.partnershipsData.get(key);
    if (!partnership) return undefined;
    
    const updatedPartnership = { ...partnership, ...partnershipData };
    this.partnershipsData.set(key, updatedPartnership);
    return updatedPartnership;
  }

  // Internship History management
  async getInternshipHistory(id: number): Promise<InternshipHistory | undefined> {
    return this.internshipHistoryData.get(id);
  }

  async getInternshipHistoriesByStudent(studentId: number): Promise<InternshipHistory[]> {
    return Array.from(this.internshipHistoryData.values()).filter(
      (history) => history.studentId === studentId
    );
  }

  async getInternshipHistoriesByCompany(companyId: number): Promise<InternshipHistory[]> {
    return Array.from(this.internshipHistoryData.values()).filter(
      (history) => history.companyId === companyId
    );
  }

  async getInternshipHistoriesBySchool(schoolId: number): Promise<InternshipHistory[]> {
    return Array.from(this.internshipHistoryData.values()).filter(
      (history) => history.schoolId === schoolId
    );
  }

  async createInternshipHistory(insertHistory: InsertInternshipHistory): Promise<InternshipHistory> {
    const id = this.currentIds.internshipHistory++;
    const now = new Date();
    const history: InternshipHistory = {
      ...insertHistory,
      id,
      createdAt: now
    };
    this.internshipHistoryData.set(id, history);
    return history;
  }

  async updateInternshipHistory(id: number, historyData: Partial<InsertInternshipHistory>): Promise<InternshipHistory | undefined> {
    const history = this.internshipHistoryData.get(id);
    if (!history) return undefined;
    
    const updatedHistory = { ...history, ...historyData };
    this.internshipHistoryData.set(id, updatedHistory);
    return updatedHistory;
  }

  async validateInternshipHistory(id: number, schoolId: number): Promise<InternshipHistory | undefined> {
    const history = this.internshipHistoryData.get(id);
    if (!history || history.schoolId !== schoolId) return undefined;
    
    const validatedHistory = { ...history, validated: true };
    this.internshipHistoryData.set(id, validatedHistory);
    return validatedHistory;
  }

  // Registration
  async registerStudent(data: StudentRegistration): Promise<{ user: User; student: Student }> {
    const user = await this.createUser({
      ...data.user,
      userType: "STUDENT"
    });
    
    const student = await this.createStudent({
      ...data.student,
      userId: user.id
    });
    
    return { user, student };
  }

  async registerCompany(data: CompanyRegistration): Promise<{ user: User; company: Company }> {
    const user = await this.createUser({
      ...data.user,
      userType: "COMPANY"
    });
    
    const company = await this.createCompany({
      ...data.company,
      userId: user.id
    });
    
    return { user, company };
  }

  async registerSchool(data: SchoolRegistration): Promise<{ user: User; school: School }> {
    const user = await this.createUser({
      ...data.user,
      userType: "SCHOOL"
    });
    
    const school = await this.createSchool({
      ...data.school,
      userId: user.id
    });
    
    return { user, school };
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Type temporaire
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }
  
  // Document request methods
  async getDocumentRequest(id: number): Promise<DocumentRequest | undefined> {
    const [request] = await db.select().from(documentRequests).where(eq(documentRequests.id, id));
    return request || undefined;
  }
  
  async getDocumentRequestsByStudent(studentId: number): Promise<DocumentRequest[]> {
    return await db.select().from(documentRequests).where(eq(documentRequests.studentId, studentId));
  }
  
  async getDocumentRequestsBySchool(schoolId: number): Promise<DocumentRequest[]> {
    return await db.select().from(documentRequests).where(eq(documentRequests.schoolId, schoolId));
  }
  
  async getDocumentRequestsByApplication(applicationId: number): Promise<DocumentRequest[]> {
    return await db.select().from(documentRequests).where(eq(documentRequests.applicationId, applicationId));
  }
  
  async createDocumentRequest(request: InsertDocumentRequest): Promise<DocumentRequest> {
    const [createdRequest] = await db.insert(documentRequests).values(request).returning();
    return createdRequest;
  }
  
  async updateDocumentRequest(id: number, status: string): Promise<DocumentRequest | undefined> {
    const now = new Date();
    const [updatedRequest] = await db
      .update(documentRequests)
      .set({ status, updatedAt: now })
      .where(eq(documentRequests.id, id))
      .returning();
    return updatedRequest || undefined;
  }
  
  // Document sharing methods
  async getSharedDocumentsForUser(userId: number): Promise<Document[]> {
    // Récupère tous les documents partagés avec cet utilisateur
    const sharedDocs = await db.select({
        document: documents
      })
      .from(sharedDocuments)
      .innerJoin(documents, eq(sharedDocuments.documentId, documents.id))
      .where(eq(sharedDocuments.sharedWithUserId, userId));
    
    return sharedDocs.map(item => item.document);
  }
  
  async shareDocument(data: InsertSharedDocument): Promise<SharedDocument> {
    // Utilisation d'une requête SQL brute pour éviter les problèmes de colonnes manquantes
    const result = await pool.query(`
      INSERT INTO shared_documents (
        document_id, 
        shared_by_user_id, 
        shared_with_user_id, 
        message, 
        is_read, 
        application_id, 
        document_type
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `, [
      data.documentId,
      data.sharedByUserId,
      data.sharedWithUserId,
      data.message || null,
      false,
      data.applicationId || null,
      data.documentType || null
    ]);
    
    // Convertir la réponse SQL en type SharedDocument
    const sharedDoc = {
      id: result.rows[0].id,
      documentId: result.rows[0].document_id,
      sharedByUserId: result.rows[0].shared_by_user_id,
      sharedWithUserId: result.rows[0].shared_with_user_id,
      sharedAt: result.rows[0].shared_at,
      message: result.rows[0].message,
      isRead: result.rows[0].is_read,
      applicationId: result.rows[0].application_id,
      documentType: result.rows[0].document_type
    };
    
    return sharedDoc as SharedDocument;
  }
  
  async forwardDocumentToCompany(documentId: number, studentId: number, companyId: number): Promise<SharedDocument | undefined> {
    // Vérifier si l'étudiant existe
    const student = await this.getStudent(studentId);
    if (!student) return undefined;
    
    // Vérifier si la compagnie existe
    const company = await this.getCompany(companyId);
    if (!company) return undefined;
    
    // Trouver le document partagé avec l'étudiant
    const [sharedWithStudent] = await db
      .select()
      .from(sharedDocuments)
      .innerJoin(documents, eq(sharedDocuments.documentId, documents.id))
      .where(
        and(
          eq(sharedDocuments.documentId, documentId),
          eq(sharedDocuments.sharedWithUserId, student.userId)
        )
      );
    
    if (!sharedWithStudent) return undefined;
    
    const now = new Date();
    
    // Mettre à jour le document partagé original pour indiquer qu'il a été transféré
    await db
      .update(sharedDocuments)
      .set({ 
        forwardedAt: now,
        forwardedToCompanyId: companyId
      })
      .where(eq(sharedDocuments.id, sharedWithStudent.shared_documents.id))
      .returning();
    
    // Créer un nouveau partage avec la compagnie
    const [forwardedDoc] = await db
      .insert(sharedDocuments)
      .values({
        documentId: documentId,
        sharedByUserId: student.userId,
        sharedWithUserId: company.userId,
        message: `Document transféré par l'étudiant`,
        applicationId: sharedWithStudent.shared_documents.applicationId,
        documentType: sharedWithStudent.shared_documents.documentType
      })
      .returning();
    
    return forwardedDoc;
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Student management
  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async getStudentByUserId(userId: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.userId, userId));
    return student || undefined;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(insertStudent).returning();
    return student;
  }

  async updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined> {
    const [student] = await db
      .update(students)
      .set(studentData)
      .where(eq(students.id, id))
      .returning();
    return student || undefined;
  }

  async getStudentsBySchool(schoolId: number): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.schoolId, schoolId));
  }
  
  async getStudentsBySchoolId(schoolId: number): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.schoolId, schoolId));
  }
  
  async getAcceptedApplicationsBySchoolId(schoolId: number): Promise<Application[]> {
    // Get all students from this school
    const schoolStudents = await this.getStudentsBySchoolId(schoolId);
    
    // If no students, return empty array
    if (schoolStudents.length === 0) {
      return [];
    }
    
    // Get all accepted applications for these students
    const studentIds = schoolStudents.map(student => student.id);
    
    const acceptedApps = await db
      .select()
      .from(applications)
      .where(
        and(
          inArray(applications.studentId, studentIds),
          eq(applications.status, 'accepted')
        )
      );
      
    return acceptedApps;
  }

  // Company management
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }
  
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompanyByUserId(userId: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.userId, userId));
    return company || undefined;
  }
  
  // Récupérer l'utilisateur associé à l'entreprise à partir de son ID
  async getUserByCompanyId(companyId: number): Promise<User | undefined> {
    // D'abord récupérer l'entreprise
    const company = await this.getCompany(companyId);
    if (!company) return undefined;
    
    // Puis récupérer l'utilisateur associé
    const [user] = await db.select().from(users).where(eq(users.id, company.userId));
    return user || undefined;
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }

  async updateCompany(id: number, companyData: Partial<InsertCompany>): Promise<Company | undefined> {
    const [company] = await db
      .update(companies)
      .set(companyData)
      .where(eq(companies.id, id))
      .returning();
    return company || undefined;
  }
  
  async updateCompanyLogo(id: number, logoPath: string): Promise<Company | undefined> {
    const [company] = await db
      .update(companies)
      .set({ logo: logoPath })
      .where(eq(companies.id, id))
      .returning();
    return company || undefined;
  }

  // School management
  async getSchool(id: number): Promise<School | undefined> {
    const [school] = await db.select().from(schools).where(eq(schools.id, id));
    return school || undefined;
  }

  async getSchoolByUserId(userId: number): Promise<School | undefined> {
    const [school] = await db.select().from(schools).where(eq(schools.userId, userId));
    return school || undefined;
  }

  async createSchool(insertSchool: InsertSchool): Promise<School> {
    const [school] = await db.insert(schools).values(insertSchool).returning();
    return school;
  }

  async updateSchool(id: number, schoolData: Partial<InsertSchool>): Promise<School | undefined> {
    const [school] = await db
      .update(schools)
      .set(schoolData)
      .where(eq(schools.id, id))
      .returning();
    return school || undefined;
  }

  // Internship management
  async getInternship(id: number): Promise<Internship | undefined> {
    const [internship] = await db.select().from(internships).where(eq(internships.id, id));
    return internship || undefined;
  }

  async getInternships(): Promise<Internship[]> {
    return await db.select().from(internships);
  }

  async getInternshipsByCompany(companyId: number): Promise<Internship[]> {
    return await db.select().from(internships).where(eq(internships.companyId, companyId));
  }

  async getInternshipsByStatus(status: string): Promise<Internship[]> {
    return await db.select().from(internships).where(eq(internships.status, status));
  }

  async createInternship(insertInternship: InsertInternship): Promise<Internship> {
    const [internship] = await db.insert(internships).values(insertInternship).returning();
    return internship;
  }

  async updateInternship(id: number, internshipData: Partial<InsertInternship>): Promise<Internship | undefined> {
    const [internship] = await db
      .update(internships)
      .set(internshipData)
      .where(eq(internships.id, id))
      .returning();
    return internship || undefined;
  }

  // Application management
  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application || undefined;
  }

  async getApplicationsByStudent(studentId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.studentId, studentId));
  }

  async getApplicationsByInternship(internshipId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.internshipId, internshipId));
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db.insert(applications).values(insertApplication).returning();
    return application;
  }

  async updateApplication(id: number, applicationData: Partial<InsertApplication>): Promise<Application | undefined> {
    const [application] = await db
      .update(applications)
      .set(applicationData)
      .where(eq(applications.id, id))
      .returning();
    return application || undefined;
  }

  // Document management
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getDocumentsByUser(userId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(insertDocument).returning();
    return document;
  }

  async updateDocument(id: number, documentData: Partial<InsertDocument>): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set(documentData)
      .where(eq(documents.id, id))
      .returning();
    return document || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.count > 0;
  }

  // Message management
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(asc(messages.createdAt));
  }

  async getMessagesByUser(userId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(asc(messages.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values({
      ...insertMessage,
      isRead: false
    }).returning();
    return message;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [message] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return message || undefined;
  }

  // Partnership management
  async getPartnership(schoolId: number, companyId: number): Promise<Partnership | undefined> {
    const [partnership] = await db
      .select()
      .from(schoolCompanyPartnerships)
      .where(
        and(
          eq(schoolCompanyPartnerships.schoolId, schoolId),
          eq(schoolCompanyPartnerships.companyId, companyId)
        )
      );
    return partnership || undefined;
  }

  async getPartnershipsBySchool(schoolId: number): Promise<Partnership[]> {
    return await db
      .select()
      .from(schoolCompanyPartnerships)
      .where(eq(schoolCompanyPartnerships.schoolId, schoolId));
  }

  async getPartnershipsByCompany(companyId: number): Promise<Partnership[]> {
    return await db
      .select()
      .from(schoolCompanyPartnerships)
      .where(eq(schoolCompanyPartnerships.companyId, companyId));
  }

  async createPartnership(insertPartnership: InsertPartnership): Promise<Partnership> {
    const [partnership] = await db
      .insert(schoolCompanyPartnerships)
      .values(insertPartnership)
      .returning();
    return partnership;
  }

  async updatePartnership(schoolId: number, companyId: number, partnershipData: Partial<InsertPartnership>): Promise<Partnership | undefined> {
    const [partnership] = await db
      .update(schoolCompanyPartnerships)
      .set(partnershipData)
      .where(
        and(
          eq(schoolCompanyPartnerships.schoolId, schoolId),
          eq(schoolCompanyPartnerships.companyId, companyId)
        )
      )
      .returning();
    return partnership || undefined;
  }

  // Internship History management
  async getInternshipHistory(id: number): Promise<InternshipHistory | undefined> {
    const [history] = await db.select().from(internshipHistory).where(eq(internshipHistory.id, id));
    return history || undefined;
  }

  async getInternshipHistoriesByStudent(studentId: number): Promise<InternshipHistory[]> {
    return await db.select().from(internshipHistory).where(eq(internshipHistory.studentId, studentId));
  }

  async getInternshipHistoriesByCompany(companyId: number): Promise<InternshipHistory[]> {
    return await db.select().from(internshipHistory).where(eq(internshipHistory.companyId, companyId));
  }

  async getInternshipHistoriesBySchool(schoolId: number): Promise<InternshipHistory[]> {
    return await db.select().from(internshipHistory).where(eq(internshipHistory.schoolId, schoolId));
  }

  async createInternshipHistory(insertHistory: InsertInternshipHistory): Promise<InternshipHistory> {
    const [history] = await db.insert(internshipHistory).values(insertHistory).returning();
    return history;
  }

  async updateInternshipHistory(id: number, historyData: Partial<InsertInternshipHistory>): Promise<InternshipHistory | undefined> {
    const [history] = await db
      .update(internshipHistory)
      .set(historyData)
      .where(eq(internshipHistory.id, id))
      .returning();
    return history || undefined;
  }

  async validateInternshipHistory(id: number, schoolId: number): Promise<InternshipHistory | undefined> {
    const [history] = await db
      .update(internshipHistory)
      .set({ validated: true })
      .where(
        and(
          eq(internshipHistory.id, id),
          eq(internshipHistory.schoolId, schoolId)
        )
      )
      .returning();
    return history || undefined;
  }

  // Registration methods
  async registerStudent(data: StudentRegistration | any): Promise<{ user: User; student: Student }> {
    console.log("registerStudent called with data:", JSON.stringify(data));
    
    let userInput;
    let studentData: Partial<InsertStudent> = {};
    let password: string;
    
    // Détecter si nous avons affaire à la structure attendue ou à une structure plate
    if (data.user && data.student) {
      // Structure imbriquée {user: {...}, student: {...}}
      const { user: userData, student: studentInfo } = data;
      password = userData.password;
      userInput = {
        email: userData.email,
        username: userData.username,
        userType: UserType.STUDENT
        // Password sera haché et ajouté plus tard
      };
      studentData = studentInfo;
    } else {
      // Structure plate {email: ..., password: ..., userType: ..., firstName?: ..., lastName?: ...}
      // On prend uniquement les champs pour l'utilisateur
      password = data.password;
      userInput = {
        email: data.email,
        username: data.username || data.email,
        userType: UserType.STUDENT
        // Password sera haché et ajouté plus tard
      };
      
      // Si des champs pour étudiant sont présents, on les ajoute
      if (data.firstName || data.lastName) {
        studentData = { 
          firstName: data.firstName || 'Prénom',
          lastName: data.lastName || 'Nom',
          bio: data.bio,
          phone: data.phone,
          schoolId: data.schoolId,
          program: data.program || data.fieldOfStudy,
          graduationYear: data.graduationYear,
          avatar: data.avatar
        };
      } else {
        // On crée un nom par défaut basé sur l'email
        studentData = { 
          firstName: 'Prénom',
          lastName: 'Nom'
        };
      }
    }
    
    // Importer la fonction de hachage de mot de passe depuis auth.ts
    const { hashPassword } = await import('./auth');
    
    // Hacher le mot de passe avant l'insertion
    let hashedPassword = password;
    if (!password.includes(":") && !password.includes(".")) {
      hashedPassword = await hashPassword(password);
    }
    
    
    console.log("Inserting user with hashed password");
    
    const [user] = await db.insert(users).values({
      ...userInput,
      password: hashedPassword
    }).returning();
    
    console.log("User created:", JSON.stringify(user));
    console.log("Student data:", JSON.stringify(studentData));
    
    const studentInput = {
      ...studentData,
      userId: user.id,
      firstName: studentData.firstName || "DefaultFirstName",
      lastName: studentData.lastName || "DefaultLastName",
    };
    
    console.log("Inserting student with:", JSON.stringify(studentInput));
    
    const [student] = await db.insert(students).values(studentInput).returning();
    
    return { user, student };
  }

  async registerCompany(data: CompanyRegistration | any): Promise<{ user: User; company: Company }> {
    console.log("------ NOUVELLE FONCTION REGISTERCOMPANY ------");
    console.log("registerCompany input data:", JSON.stringify(data));
    
    // NOUVELLE APPROCHE
    // 1. Extraire les données utilisateur directement
    const userValues = {
      email: data.email || "",
      username: data.username || data.email || "",
      password: data.password || "",
      userType: UserType.COMPANY
    };
    
    console.log("Prepared user values:", JSON.stringify({
      ...userValues, 
      password: userValues.password ? "***" : "missing"
    }));
    
    // 2. Validation explicite
    if (!userValues.email) throw new Error("L'email est requis");
    if (!userValues.password) throw new Error("Le mot de passe est requis");
    if (!userValues.username) throw new Error("Le nom d'utilisateur est requis");
    
    try {
      // Importer la fonction de hachage de mot de passe depuis auth.ts
      const { hashPassword } = await import('./auth');
      
      // Hacher le mot de passe avant l'insertion
      const hashedPassword = await hashPassword(userValues.password);
      
      // 3. Insertion directe avec les valeurs exactes (pas d'objet intermédiaire)
      const userResult = await db.insert(users).values({
        email: userValues.email,
        username: userValues.username,
        password: hashedPassword,
        userType: UserType.COMPANY
      }).returning();
      
      // 4. Vérification explicite du résultat
      if (!userResult || userResult.length === 0) {
        throw new Error("Échec de la création de l'utilisateur");
      }
      
      const user = userResult[0];
      console.log("User created successfully:", JSON.stringify({
        ...user,
        password: "***"
      }));
      
      // 5. Préparer les données de l'entreprise
      const companyName = data.name || `Entreprise ${userValues.username}`;
      console.log("Using company name:", companyName);
      
      // 6. Insertion de l'entreprise liée à l'utilisateur
      const companyResult = await db.insert(companies).values({
        name: companyName,
        userId: user.id,
        description: data.description || null,
        website: data.website || null,
        industry: data.industry || null,
        size: data.size || null,
        location: data.location || null,
        logo: data.logo || null
      }).returning();
      
      // 7. Vérification du résultat
      if (!companyResult || companyResult.length === 0) {
        throw new Error("Échec de la création de l'entreprise");
      }
      
      const company = companyResult[0];
      console.log("Company created successfully:", JSON.stringify(company));
      
      // 8. Retourner les deux objets créés
      return { user, company };
    } catch (error) {
      console.error("Error in registerCompany:", error);
      throw error;
    }
  }

  async registerSchool(data: SchoolRegistration | any): Promise<{ user: User; school: School }> {
    console.log("------ NOUVELLE FONCTION REGISTERSCHOOL ------");
    console.log("registerSchool input data:", JSON.stringify(data));
    
    // NOUVELLE APPROCHE
    // 1. Extraire les données utilisateur directement
    const userValues = {
      email: data.email || "",
      username: data.username || data.email || "",
      password: data.password || "",
      userType: UserType.SCHOOL
    };
    
    console.log("Prepared user values:", JSON.stringify({
      ...userValues, 
      password: userValues.password ? "***" : "missing"
    }));
    
    // 2. Validation explicite
    if (!userValues.email) throw new Error("L'email est requis");
    if (!userValues.password) throw new Error("Le mot de passe est requis");
    if (!userValues.username) throw new Error("Le nom d'utilisateur est requis");
    
    try {
      // Importer la fonction de hachage de mot de passe depuis auth.ts
      const { hashPassword } = await import('./auth');
      
      // Hacher le mot de passe avant l'insertion
      const hashedPassword = await hashPassword(userValues.password);
      
      // 3. Insertion directe avec les valeurs exactes (pas d'objet intermédiaire)
      const userResult = await db.insert(users).values({
        email: userValues.email,
        username: userValues.username,
        password: hashedPassword,
        userType: UserType.SCHOOL
      }).returning();
      
      // 4. Vérification explicite du résultat
      if (!userResult || userResult.length === 0) {
        throw new Error("Échec de la création de l'utilisateur");
      }
      
      const user = userResult[0];
      console.log("User created successfully:", JSON.stringify({
        ...user,
        password: "***"
      }));
      
      // 5. Préparer les données de l'école
      const schoolName = data.name || `École ${userValues.username}`;
      console.log("Using school name:", schoolName);
      
      // 6. Insertion de l'école liée à l'utilisateur
      const schoolResult = await db.insert(schools).values({
        name: schoolName,
        userId: user.id,
        description: data.description || null,
        website: data.website || null,
        address: data.address || null,
        logo: data.logo || null
      }).returning();
      
      // 7. Vérification du résultat
      if (!schoolResult || schoolResult.length === 0) {
        throw new Error("Échec de la création de l'école");
      }
      
      const school = schoolResult[0];
      console.log("School created successfully:", JSON.stringify(school));
      
      // 8. Retourner les deux objets créés
      return { user, school };
    } catch (error) {
      console.error("Error in registerSchool:", error);
      throw error;
    }
  }

async getSharedDocumentsByApplicationId(applicationId: number): Promise<any[]> {
  const sql = `
    SELECT 
      sd.id AS shared_id,
      d.id AS document_id,
      d.name,
      d.type AS document_type,
      d.path,
      sd.shared_by_user_id,
      sd.shared_with_user_id,
      sd.message,
      sd.application_id
    FROM shared_documents sd
    JOIN documents d ON sd.document_id = d.id
    WHERE sd.application_id = $1
  `;

  const result = await pool.query(sql, [applicationId]);
  return result.rows;
}

}

// Export the DatabaseStorage instance
export const storage = new DatabaseStorage();
