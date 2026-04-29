CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'jury_member', 'regional_delegate', 'school_principal', 'candidate');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'archived');

CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               VARCHAR(256) UNIQUE NOT NULL,
  password_hash       VARCHAR(256) NOT NULL,
  
  first_name          VARCHAR(128) NOT NULL,
  last_name           VARCHAR(128) NOT NULL,
  national_id         VARCHAR(32),

  role                user_role DEFAULT 'candidate',
  status              user_status DEFAULT 'pending',

  preferred_language  VARCHAR(2) DEFAULT 'fr',
  region_id           INT,           
  school_id           UUID,          

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  last_login_at       TIMESTAMPTZ
);

CREATE TABLE user_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token           TEXT NOT NULL,
  ip_address      INET,
  user_agent      TEXT,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE password_resets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash      VARCHAR(256) NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE verification_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code            VARCHAR(8) NOT NULL,
  type            VARCHAR(32) DEFAULT 'email',   
  expires_at      TIMESTAMPTZ NOT NULL,
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Cameroon's ten regions (static reference data)
CREATE TABLE regions (
  id        SERIAL PRIMARY KEY,
  code      VARCHAR(4) NOT NULL UNIQUE,         -- CE, LT, OU, NW, SW, NO, EN, AD, SU, ES
  name_fr   VARCHAR(64) NOT NULL,
  name_en   VARCHAR(64) NOT NULL,
  capital   VARCHAR(64) NOT NULL
);

ALTER TABLE users ADD CONSTRAINT fk_users_region FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL;

CREATE TYPE school_type AS ENUM (
  'high_school',           -- lycée
  'general_college',       -- collège général
  'technical_college',     -- collège technique
  'normal_school',         -- école normale
  'commercial_school',
  'specialized_school'
);

CREATE TYPE school_sector AS ENUM (
  'public',
  'private_lay',
  'private_catholic',
  'private_protestant',
  'private_islamic'
);

-- Schools and institutions
CREATE TABLE schools (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricule       VARCHAR(32) UNIQUE,           -- official MINESEC code
  name            VARCHAR(256) NOT NULL,
  type            school_type NOT NULL,
  sector          school_sector NOT NULL,

  region_id       INT NOT NULL REFERENCES regions(id),
  department      VARCHAR(64),                  -- département
  city            VARCHAR(64),
  address         TEXT,
  postal_code     VARCHAR(16),
  latitude        NUMERIC(9,6),
  longitude       NUMERIC(9,6),

  phone           VARCHAR(24),
  email           VARCHAR(256),
  website         VARCHAR(256),

  principal_id    UUID REFERENCES users(id),    -- current principal
  founded_year    INT,
  student_count   INT,

  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schools_region ON schools(region_id);
CREATE INDEX idx_schools_type   ON schools(type);

ALTER TABLE users ADD CONSTRAINT fk_users_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;

CREATE TYPE edition_status AS ENUM (
  'draft',          -- being configured
  'announced',      -- public announcement made
  'open',           -- applications open
  'evaluating',     -- applications closed, evaluation in progress
  'closed',         -- ceremony complete, archived
  'cancelled'
);

-- Annual editions of the awards
CREATE TABLE editions (
  id                SERIAL PRIMARY KEY,
  year              INT NOT NULL UNIQUE,
  roman_numeral     VARCHAR(8) NOT NULL,         -- XVII for the 17th edition
  name_fr           VARCHAR(128) NOT NULL,
  name_en           VARCHAR(128) NOT NULL,
  theme_fr          VARCHAR(256),
  theme_en          VARCHAR(256),
  status            edition_status DEFAULT 'draft',

  applications_open_at    TIMESTAMPTZ,
  applications_close_at   TIMESTAMPTZ,
  evaluation_start_at     TIMESTAMPTZ,
  ceremony_at             TIMESTAMPTZ,
  ceremony_venue          VARCHAR(256),

  total_budget_fcfa BIGINT,                      -- planned budget
  brochure_url      TEXT,                        -- official PDF brochure

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE recipient_type AS ENUM (
  'student',           -- individual student
  'teacher',           -- individual teacher/educator
  'school',            -- institution
  'team',              -- team or group of students/teachers
  'student_female'     -- specifically for girls' awards
);

-- Award categories (defined per edition — they may vary year to year)
CREATE TABLE award_categories (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id          INT NOT NULL REFERENCES editions(id),
  code                VARCHAR(8) NOT NULL,       -- A.01, B.02, ...
  name_fr             VARCHAR(128) NOT NULL,
  name_en             VARCHAR(128) NOT NULL,
  description_fr      TEXT,
  description_en      TEXT,
  recipient_type      recipient_type NOT NULL,
  is_flagship         BOOLEAN DEFAULT false,
  cover_image_url     TEXT DEFAULT NULL,

  prize_amount_fcfa   BIGINT,                    -- monetary prize
  scholarship         JSONB,                     -- scholarship structure if any

  rubric              JSONB NOT NULL,
  eligibility         JSONB DEFAULT '{}',
  required_documents  JSONB DEFAULT '[]',

  scope               VARCHAR(16) DEFAULT 'national',  -- national | regional
  max_winners         INT DEFAULT 1,             -- 1 for unique, 10 for regional awards
  display_order       INT DEFAULT 100,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(edition_id, code)
);

CREATE INDEX idx_categories_edition ON award_categories(edition_id);

CREATE TYPE step_status AS ENUM ('upcoming', 'active', 'completed', 'skipped');

CREATE TABLE timeline_steps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID NOT NULL REFERENCES award_categories(id) ON DELETE CASCADE,
  position        INT NOT NULL,                  -- 1, 2, 3, 4, 5, 6
  name_fr         VARCHAR(128) NOT NULL,
  name_en         VARCHAR(128) NOT NULL,
  description_fr  TEXT,
  description_en  TEXT,
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  status          step_status DEFAULT 'upcoming',
  metadata        JSONB DEFAULT '{}',

  UNIQUE(category_id, position)
);

CREATE INDEX idx_timeline_category ON timeline_steps(category_id);

CREATE TYPE application_status AS ENUM (
  'draft',                    -- candidate is filling
  'submitted',                -- submitted by candidate
  'principal_validated',      -- school principal endorsed
  'preselected',              -- passed regional preselection
  'finalist',                 -- shortlisted by national jury
  'laureate',                 -- winner
  'rejected',
  'withdrawn'
);

CREATE TABLE applications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference             VARCHAR(24) UNIQUE NOT NULL,   -- e.g. CMR-2026-A01-00472

  edition_id            INT NOT NULL REFERENCES editions(id),
  category_id           UUID NOT NULL REFERENCES award_categories(id),
  candidate_id          UUID REFERENCES users(id),
  school_id             UUID REFERENCES schools(id),
  region_id             INT REFERENCES regions(id),

  status                application_status DEFAULT 'draft',
  data                  JSONB NOT NULL DEFAULT '{}',

  submitted_at          TIMESTAMPTZ,
  validated_at          TIMESTAMPTZ,                   -- by principal
  validated_by          UUID REFERENCES users(id),

  shortlisted_at        TIMESTAMPTZ,
  shortlisted_by        UUID REFERENCES users(id),

  preselected_at        TIMESTAMPTZ,
  preselected_by        UUID REFERENCES users(id),     -- regional delegate

  final_score           NUMERIC(5,2),                  -- aggregated jury score
  rank_regional         INT,
  rank_national         INT,

  withdrawal_reason     TEXT,
  rejection_reason      TEXT,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_apps_edition_category ON applications(edition_id, category_id);
CREATE INDEX idx_apps_region_status    ON applications(region_id, status);
CREATE INDEX idx_apps_candidate        ON applications(candidate_id);
CREATE INDEX idx_apps_school           ON applications(school_id);
CREATE INDEX idx_apps_status           ON applications(status);

CREATE TYPE document_kind AS ENUM (
  'photo',
  'transcript',                 -- school grades
  'bac_results',                -- Baccalauréat results
  'birth_certificate',
  'national_id',
  'recommendation_letter',
  'essay',
  'project_report',             -- for innovation/STEM awards
  'creative_work',              -- for arts/literary awards
  'medical_certificate',
  'principal_attestation',
  'other'
);

CREATE TABLE application_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  kind            document_kind NOT NULL,
  label           VARCHAR(256),                  -- e.g. "Bulletin Terminale T1"

  filename        VARCHAR(256) NOT NULL,
  storage_key     TEXT NOT NULL,                 -- S3/MinIO key
  size_bytes      BIGINT NOT NULL,
  mime_type       VARCHAR(64) NOT NULL,
  checksum_sha256 VARCHAR(64) NOT NULL,
  pages           INT,                           -- for PDFs
  ocr_text        TEXT,                          -- extracted for search

  uploaded_by     UUID REFERENCES users(id),
  uploaded_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_docs_application ON application_documents(application_id);

CREATE TABLE application_status_history (
  id              BIGSERIAL PRIMARY KEY,
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  from_status     application_status,
  to_status       application_status NOT NULL,
  changed_by      UUID REFERENCES users(id),
  reason          TEXT,
  changed_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_status_history_app ON application_status_history(application_id);

CREATE TABLE jury_appointments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id      INT NOT NULL REFERENCES editions(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  category_id     UUID REFERENCES award_categories(id),  -- NULL = general jury
  role            VARCHAR(32) DEFAULT 'member',          -- president | vice | member | secretary
  expertise       VARCHAR(128),                          -- e.g. "Mathematics", "Literature"
  affiliation     VARCHAR(256),                          -- university, ministry, etc.

  appointed_at    TIMESTAMPTZ DEFAULT NOW(),
  appointed_by    UUID REFERENCES users(id),
  active          BOOLEAN DEFAULT TRUE,

  UNIQUE(edition_id, user_id, category_id)
);

CREATE TABLE jury_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  juror_id        UUID NOT NULL REFERENCES users(id),
  assigned_at     TIMESTAMPTZ DEFAULT NOW(),
  due_at          TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,

  UNIQUE(application_id, juror_id)
);

CREATE INDEX idx_assignments_juror ON jury_assignments(juror_id);
CREATE INDEX idx_assignments_app   ON jury_assignments(application_id);

CREATE TABLE evaluations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  juror_id        UUID NOT NULL REFERENCES users(id),

  scores          JSONB NOT NULL,

  weighted_score  NUMERIC(5,2),                  -- computed final score /20

  comments        TEXT,                          -- private to jury
  recommendation  TEXT,                          -- public reasoning if laureate

  locked          BOOLEAN DEFAULT FALSE,         -- once locked, immutable
  evaluated_at    TIMESTAMPTZ,
  locked_at       TIMESTAMPTZ,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(application_id, juror_id)
);

CREATE INDEX idx_evals_application ON evaluations(application_id);
CREATE INDEX idx_evals_juror       ON evaluations(juror_id);

CREATE TABLE regional_preselections (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id        INT NOT NULL REFERENCES editions(id),
  category_id       UUID NOT NULL REFERENCES award_categories(id),
  region_id         INT NOT NULL REFERENCES regions(id),
  delegate_id       UUID NOT NULL REFERENCES users(id),

  applications_count INT,                        -- total received
  selected_count    INT,                         -- forwarded to national
  report_url        TEXT,                        -- regional report PDF
  notes             TEXT,

  submitted_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(edition_id, category_id, region_id)
);

CREATE TABLE laureates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id    UUID NOT NULL UNIQUE REFERENCES applications(id),
  edition_id        INT NOT NULL REFERENCES editions(id),
  category_id       UUID NOT NULL REFERENCES award_categories(id),
  user_id           UUID REFERENCES users(id),

  rank              INT NOT NULL DEFAULT 1,      -- 1st, 2nd, 3rd...
  citation_fr       TEXT,                        -- public reasoning
  citation_en       TEXT,
  prize_amount_fcfa BIGINT,
  scholarship       JSONB,

  announced_at      TIMESTAMPTZ,
  ceremony_present  BOOLEAN DEFAULT TRUE,        -- attended in person

  public_profile    BOOLEAN DEFAULT TRUE,        -- shown in archives
  metadata          JSONB DEFAULT '{}',

  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_laureates_edition  ON laureates(edition_id);
CREATE INDEX idx_laureates_category ON laureates(category_id);
CREATE INDEX idx_laureates_user     ON laureates(user_id);

CREATE TABLE certificates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  laureate_id         UUID NOT NULL REFERENCES laureates(id) ON DELETE CASCADE,
  verification_code   VARCHAR(32) UNIQUE NOT NULL,   -- public ID for QR code

  pdf_storage_key     TEXT NOT NULL,                 -- final PDF in S3
  pdf_signature       TEXT NOT NULL,                 -- digital signature

  issued_at           TIMESTAMPTZ DEFAULT NOW(),
  issued_by           UUID REFERENCES users(id),
  revoked_at          TIMESTAMPTZ,
  revoked_reason      TEXT,

  verification_count  INT DEFAULT 0,                 -- public verification hits
  last_verified_at    TIMESTAMPTZ
);

CREATE TYPE disbursement_method AS ENUM (
  'mtn_momo',
  'orange_money',
  'bank_transfer',
  'cheque',
  'cash'
);

CREATE TYPE disbursement_status AS ENUM (
  'pending',
  'authorized',
  'processing',
  'completed',
  'failed',
  'reversed'
);

CREATE TABLE prize_disbursements (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  laureate_id         UUID NOT NULL REFERENCES laureates(id),

  amount_fcfa         BIGINT NOT NULL,
  method              disbursement_method NOT NULL,
  status              disbursement_status DEFAULT 'pending',

  recipient_account   VARCHAR(64),                   -- phone, IBAN, etc.
  recipient_name      VARCHAR(256),

  external_reference  VARCHAR(128),                  -- gateway transaction ID
  gateway_response    JSONB,                         -- full provider response

  authorized_by       UUID REFERENCES users(id),
  authorized_at       TIMESTAMPTZ,
  processed_at        TIMESTAMPTZ,
  failure_reason      TEXT,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_disbursements_laureate ON prize_disbursements(laureate_id);
CREATE INDEX idx_disbursements_status   ON prize_disbursements(status);

CREATE TYPE sponsor_tier AS ENUM (
  'patronage',         -- Présidence
  'platinum',
  'gold',
  'silver',
  'bronze',
  'institutional'      -- UNESCO, UNICEF, AFD...
);

CREATE TABLE sponsors (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  VARCHAR(256) NOT NULL,
  legal_name            VARCHAR(256),
  tier                  sponsor_tier NOT NULL,
  sector                VARCHAR(128),                  -- Telecom, Banking, Energy, NGO...
  country               VARCHAR(64) DEFAULT 'Cameroun',

  logo_storage_key      TEXT,
  website               VARCHAR(256),

  contact_name          VARCHAR(128),
  contact_email         VARCHAR(256),
  contact_phone         VARCHAR(24),

  total_contribution_fcfa BIGINT DEFAULT 0,           -- lifetime total

  display_on_public     BOOLEAN DEFAULT TRUE,
  display_order         INT DEFAULT 100,

  metadata              JSONB DEFAULT '{}',
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sponsor_contributions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id      UUID NOT NULL REFERENCES sponsors(id),
  edition_id      INT NOT NULL REFERENCES editions(id),
  amount_fcfa     BIGINT NOT NULL,
  in_kind         JSONB,                              -- non-monetary contributions
  agreement_url   TEXT,                               -- signed agreement PDF

  pledged_at      TIMESTAMPTZ,
  received_at     TIMESTAMPTZ,

  UNIQUE(sponsor_id, edition_id)
);

CREATE TABLE category_sponsors (
  category_id     UUID NOT NULL REFERENCES award_categories(id),
  sponsor_id      UUID NOT NULL REFERENCES sponsors(id),
  is_primary      BOOLEAN DEFAULT FALSE,              -- principal sponsor for this prize
  contribution_fcfa BIGINT,
  PRIMARY KEY (category_id, sponsor_id)
);

CREATE TABLE category_prizes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID NOT NULL REFERENCES award_categories(id) ON DELETE CASCADE,
  position        INT NOT NULL,
  name_en         VARCHAR(128) NOT NULL,
  name_fr         VARCHAR(128) NOT NULL,
  amount_fcfa     BIGINT,
  description_en  TEXT,
  description_fr  TEXT,
  UNIQUE(category_id, position)
);

CREATE TABLE notification_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(64) UNIQUE NOT NULL,    -- e.g. 'application_submitted'
  channel         VARCHAR(16) NOT NULL,           -- email | sms | push | in_app

  subject_fr      VARCHAR(256),
  subject_en      VARCHAR(256),
  body_fr         TEXT NOT NULL,
  body_en         TEXT NOT NULL,
  variables       JSONB DEFAULT '[]',             -- expected {{variables}}

  active          BOOLEAN DEFAULT TRUE,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE notification_status AS ENUM (
  'queued', 'sending', 'sent', 'delivered', 'failed', 'bounced'
);

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  template_code   VARCHAR(64) REFERENCES notification_templates(code),
  channel         VARCHAR(16) NOT NULL,

  recipient       VARCHAR(256) NOT NULL,          -- email or phone
  language        VARCHAR(2) DEFAULT 'fr',
  subject         VARCHAR(256),
  body            TEXT,
  variables       JSONB,                          -- values used

  status          notification_status DEFAULT 'queued',
  provider        VARCHAR(32),                    -- resend | africastalking
  provider_id     VARCHAR(128),                   -- provider's tracking ID
  error_message   TEXT,

  sent_at         TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user      ON notifications(user_id);
CREATE INDEX idx_notif_status    ON notifications(status);
CREATE INDEX idx_notif_created   ON notifications(created_at DESC);

CREATE TABLE audit_logs (
  id              BIGSERIAL PRIMARY KEY,
  actor_id        UUID,                           -- nullable for system actions
  actor_role      VARCHAR(32),
  actor_ip        INET,
  actor_ua        TEXT,                           -- user agent

  action          VARCHAR(64) NOT NULL,           -- 'application.submit', 'evaluation.lock'
  entity_type     VARCHAR(64) NOT NULL,           -- 'application', 'evaluation', 'user'
  entity_id       UUID,

  before_state    JSONB,                          -- snapshot before
  after_state     JSONB,                          -- snapshot after
  changes         JSONB,                          -- diff

  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_actor    ON audit_logs(actor_id);
CREATE INDEX idx_audit_entity   ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action   ON audit_logs(action);
CREATE INDEX idx_audit_created  ON audit_logs(created_at DESC);
