INSERT INTO academy_courses (id,title,description,modules,active)
VALUES (
  'hlabi-property-professional-foundation',
  'Hlabi Property Professional Foundation',
  'A practical foundation for people preparing for a property career.',
  '["Property fundamentals","Buyer and seller journeys","Listing and marketing practice","Negotiation and client communication","Ethics, compliance and professional conduct","AI tools for property work"]'::jsonb,
  true
)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title,
  description=EXCLUDED.description,
  modules=EXCLUDED.modules,
  active=EXCLUDED.active,
  updated_at=NOW();
