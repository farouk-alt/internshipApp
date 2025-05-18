--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: postgres
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: postgres
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: postgres
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    student_id integer NOT NULL,
    internship_id integer NOT NULL,
    motivation_letter text NOT NULL,
    additional_info text,
    status text DEFAULT 'pending'::text,
    created_at timestamp without time zone DEFAULT now(),
    cover_letter text,
    cv_path text,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.applications_id_seq OWNER TO postgres;

--
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name text NOT NULL,
    description text,
    logo text,
    website text,
    industry text,
    size text,
    location text
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_id_seq OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: document_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_requests (
    id integer NOT NULL,
    student_id integer NOT NULL,
    school_id integer NOT NULL,
    application_id integer,
    status text DEFAULT 'pending'::text,
    request_type text NOT NULL,
    message text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.document_requests OWNER TO postgres;

--
-- Name: document_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.document_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.document_requests_id_seq OWNER TO postgres;

--
-- Name: document_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.document_requests_id_seq OWNED BY public.document_requests.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    file_url text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documents_id_seq OWNER TO postgres;

--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- Name: internship_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.internship_history (
    id integer NOT NULL,
    student_id integer NOT NULL,
    company_id integer NOT NULL,
    internship_id integer,
    title text NOT NULL,
    description text,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    feedback text,
    rating integer,
    validated boolean DEFAULT false,
    school_id integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.internship_history OWNER TO postgres;

--
-- Name: internship_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.internship_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.internship_history_id_seq OWNER TO postgres;

--
-- Name: internship_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.internship_history_id_seq OWNED BY public.internship_history.id;


--
-- Name: internships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.internships (
    id integer NOT NULL,
    title text NOT NULL,
    company_id integer NOT NULL,
    location text NOT NULL,
    duration text NOT NULL,
    compensation text,
    description text NOT NULL,
    requirements text,
    status text DEFAULT 'pending'::text,
    is_validated boolean DEFAULT false,
    posted_date timestamp without time zone DEFAULT now(),
    skills text[] DEFAULT '{}'::text[],
    responsibilities text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone
);


ALTER TABLE public.internships OWNER TO postgres;

--
-- Name: internships_backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.internships_backup (
    id integer,
    title text,
    company_id integer,
    location text,
    duration text,
    compensation text,
    description text,
    requirements text,
    status text,
    is_validated boolean,
    posted_date timestamp without time zone,
    skills text[]
);


ALTER TABLE public.internships_backup OWNER TO postgres;

--
-- Name: internships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.internships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.internships_id_seq OWNER TO postgres;

--
-- Name: internships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.internships_id_seq OWNED BY public.internships.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer NOT NULL,
    receiver_id integer NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: school_company_partnerships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.school_company_partnerships (
    school_id integer NOT NULL,
    company_id integer NOT NULL,
    status text DEFAULT 'active'::text,
    start_date timestamp without time zone DEFAULT now(),
    end_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.school_company_partnerships OWNER TO postgres;

--
-- Name: schools; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schools (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name text NOT NULL,
    description text,
    logo text,
    website text,
    address text
);


ALTER TABLE public.schools OWNER TO postgres;

--
-- Name: schools_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.schools_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schools_id_seq OWNER TO postgres;

--
-- Name: schools_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.schools_id_seq OWNED BY public.schools.id;


--
-- Name: shared_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shared_documents (
    id integer NOT NULL,
    document_id integer NOT NULL,
    shared_by_user_id integer NOT NULL,
    shared_with_user_id integer NOT NULL,
    application_id integer,
    shared_at timestamp without time zone DEFAULT now(),
    message text,
    is_read boolean DEFAULT false,
    document_type text,
    forwarded_to_company_id integer,
    forwarded_at timestamp without time zone
);


ALTER TABLE public.shared_documents OWNER TO postgres;

--
-- Name: shared_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shared_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shared_documents_id_seq OWNER TO postgres;

--
-- Name: shared_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shared_documents_id_seq OWNED BY public.shared_documents.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    id integer NOT NULL,
    user_id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    school_id integer,
    bio text,
    avatar text,
    phone text,
    program text,
    graduation_year integer
);


ALTER TABLE public.students OWNER TO postgres;

--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.students_id_seq OWNER TO postgres;

--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text NOT NULL,
    role text NOT NULL,
    name text NOT NULL,
    bio text,
    profile_image_url text,
    created_at timestamp without time zone DEFAULT now(),
    user_type text DEFAULT 'STUDENT'::text NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: document_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_requests ALTER COLUMN id SET DEFAULT nextval('public.document_requests_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: internship_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internship_history ALTER COLUMN id SET DEFAULT nextval('public.internship_history_id_seq'::regclass);


--
-- Name: internships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internships ALTER COLUMN id SET DEFAULT nextval('public.internships_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: schools id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schools ALTER COLUMN id SET DEFAULT nextval('public.schools_id_seq'::regclass);


--
-- Name: shared_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_documents ALTER COLUMN id SET DEFAULT nextval('public.shared_documents_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: postgres
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	219c267e69f38620f754b515c162eb662ebf56b0c4b897893c2bce83e4ff8e05	1746309356902
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applications (id, student_id, internship_id, motivation_letter, additional_info, status, created_at, cover_letter, cv_path, updated_at) FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, user_id, name, description, logo, website, industry, size, location) FROM stdin;
\.


--
-- Data for Name: document_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_requests (id, student_id, school_id, application_id, status, request_type, message, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, user_id, name, type, file_url, created_at) FROM stdin;
\.


--
-- Data for Name: internship_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.internship_history (id, student_id, company_id, internship_id, title, description, start_date, end_date, feedback, rating, validated, school_id, created_at) FROM stdin;
\.


--
-- Data for Name: internships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.internships (id, title, company_id, location, duration, compensation, description, requirements, status, is_validated, posted_date, skills, responsibilities, is_active, created_at, updated_at) FROM stdin;
1	Frontend Developer	1	Remote	3 months	\N	React position	\N	pending	f	2025-05-03 23:28:22.771033	{JavaScript,TypeScript}	\N	t	2025-05-04 02:34:38.128311	\N
2	Backend Developer	1	Office	6 months	\N	Python position	\N	pending	f	2025-05-03 23:28:22.771033	{Python,Django}	\N	t	2025-05-04 02:34:38.128311	\N
3	UX Designer	2	Hybrid	3 months	\N	Design role	\N	pending	f	2025-05-03 23:28:22.771033	{}	\N	t	2025-05-04 02:34:38.128311	\N
\.


--
-- Data for Name: internships_backup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.internships_backup (id, title, company_id, location, duration, compensation, description, requirements, status, is_validated, posted_date, skills) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, sender_id, receiver_id, content, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: school_company_partnerships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.school_company_partnerships (school_id, company_id, status, start_date, end_date, created_at) FROM stdin;
\.


--
-- Data for Name: schools; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schools (id, user_id, name, description, logo, website, address) FROM stdin;
\.


--
-- Data for Name: shared_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shared_documents (id, document_id, shared_by_user_id, shared_with_user_id, application_id, shared_at, message, is_read, document_type, forwarded_to_company_id, forwarded_at) FROM stdin;
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (id, user_id, first_name, last_name, school_id, bio, avatar, phone, program, graduation_year) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, email, role, name, bio, profile_image_url, created_at, user_type) FROM stdin;
1	testuser	a662af879fc40cd18b3d87f526d0227ae74402175a5a3df3e5abfc153540284ec5133697807a9c1869d0a9d8a72d22e22964054c7b799147650a181e975b5026.ee54185f6470a03939cf9120396209a5	test@example.com	student	Test Test	\N	\N	2025-04-15 23:23:50.393999	STUDENT
8	user01	c0f9e0608ccb3f985c94c7ee03e38277b1e5eaae62caf61df3656e8354a5110d13168a695bd0457abf6cdac706d09e856764c8ea54e4c0205ae9beb087315e91.6a0b228f1114d8cb074fdac10828c835	user@gmail.com	student	user user	\N	\N	2025-04-15 23:31:30.274751	STUDENT
9	user02	0299a3328fdf61f64fa878f7413ebd93ede4720b660f792b39e57b5545d10cc7069b376d7a2eeb8647ea8e86029b73944ed0ead4a0402369fbb038863b92d96d.6f7bc6ad99595e8dc3e8b973d902df1a	iga@iga.com	school	ecole iga	\N	\N	2025-04-15 23:52:02.327328	STUDENT
10	user03	8aeabdcd9e87b2dcbf2599947682f2236cc68550fc092f42302481595a4ecc6190d39862ee93641e5f53adf602110b2a531c6ac062dd0e6b3c7e05b9a334eca2.4d2f0fd086ea1f63f5b96bbd93d610f9	entreprise@gmail.com	company	entreprise	\N	\N	2025-04-15 23:53:32.361204	STUDENT
11	visiteur	19704290b8fb1f8a29bd26846d414c408ea8aebf4dbc798d2e8380fbab28835948cfc9353925a33b85117762f50cc579ce0d7a2225ab6f950263d711598f8fe8.4c3012743b089c19d266840b375f4a91	visiteur@gmail.com	company	visiteur	\N	\N	2025-04-16 09:02:35.108616	STUDENT
15	user04	199491a3e9e74f3aaf4bb737c768fe2dea188f6202edc90266dbadccd089130f463b283f35206754f27b7e47103e7880c8a9a6212dc852a1216497642b148249.175745c63a58c5c70d53c91a9c0f1b80	entreprise1@gmail.com	company	user04	\N	\N	2025-04-16 09:05:59.905436	STUDENT
16	user06	8de347691345f6c524bad26f75fcf19b0213da197a9fda405d98a1e30366952691b0fc96b6d8d07a5be1e67f5d2e54265986dd8ad71c17201990f2011df5f914.1e9f28adf6f82eee8741458c725f8e27	etudiant@gmail.com	student	farouk karti	\N	\N	2025-04-19 18:46:37.219611	STUDENT
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, true);


--
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.applications_id_seq', 1, false);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.companies_id_seq', 1, false);


--
-- Name: document_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.document_requests_id_seq', 1, false);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.documents_id_seq', 1, false);


--
-- Name: internship_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.internship_history_id_seq', 1, false);


--
-- Name: internships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.internships_id_seq', 3, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: schools_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schools_id_seq', 1, false);


--
-- Name: shared_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shared_documents_id_seq', 1, false);


--
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.students_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 18, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: document_requests document_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_requests
    ADD CONSTRAINT document_requests_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: internship_history internship_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internship_history
    ADD CONSTRAINT internship_history_pkey PRIMARY KEY (id);


--
-- Name: internships internships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internships
    ADD CONSTRAINT internships_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: school_company_partnerships school_company_partnerships_school_id_company_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_company_partnerships
    ADD CONSTRAINT school_company_partnerships_school_id_company_id_pk PRIMARY KEY (school_id, company_id);


--
-- Name: schools schools_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_pkey PRIMARY KEY (id);


--
-- Name: shared_documents shared_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_documents
    ADD CONSTRAINT shared_documents_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

