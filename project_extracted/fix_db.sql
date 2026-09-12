-- 1. Add parent_id column if it doesn't exist
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id TEXT;

-- 2. Insert original categories and subcategories
INSERT INTO public.categories (id, name, slug, order_index, description, icon_name, parent_id)
VALUES
('cat-university', 'University', 'university', 3, 'University Admission', 'GraduationCap', NULL),
('cat-uni-varsity', 'ভার্সিটি', 'varsity', 4, 'Varsity Admission', NULL, 'cat-university'),
('cat-uni-medical', 'মেডিকেল', 'medical', 5, 'Medical Admission', NULL, 'cat-university'),
('cat-uni-engineering', 'Engineering', 'engineering', 6, 'Engineering Admission', NULL, 'cat-university'),
('cat-ssc', 'Ssc', 'ssc', 1, 'SSC Level Resources', 'BookOpen', NULL),
('cat-hsc', 'Hsc', 'hsc', 2, 'HSC Level Resources', 'BookOpen', NULL),
('cat-skill', 'Skill', 'skill', 7, 'Skill Development', 'Zap', NULL),
('cat-kit', 'Kit', 'kit', 8, 'Preparation Kits', 'Sparkles', NULL),
('cat-class', 'Class', 'class', 9, 'Class Resources', 'Users', NULL)
ON CONFLICT (id) DO UPDATE SET 
  parent_id = EXCLUDED.parent_id, 
  name = EXCLUDED.name, 
  order_index = EXCLUDED.order_index;
