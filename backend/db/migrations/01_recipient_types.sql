CREATE TABLE recipient_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(32) UNIQUE NOT NULL,
  name_fr VARCHAR(128) NOT NULL,
  name_en VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE award_categories DROP COLUMN recipient_type;
ALTER TABLE award_categories ADD COLUMN recipient_type_id UUID REFERENCES recipient_types(id);

INSERT INTO recipient_types (code, name_fr, name_en) VALUES 
('students', 'Élèves', 'Students'),
('teachers', 'Enseignants', 'Teachers'),
('institutions', 'Établissements', 'Institutions'),
('innovation', 'Équipes d''Innovation', 'Innovation Teams');

INSERT INTO sponsors (name, tier, display_on_public, sector, metadata) VALUES 
('MTN Cameroon', 'platinum', true, 'Telecom', '{"logo": "MTN"}'),
('UNESCO', 'institutional', true, 'NGO', '{"logo": "UNESCO"}');
