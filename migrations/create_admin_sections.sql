-- Create admin_sections table
CREATE TABLE IF NOT EXISTS admin_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(100) NOT NULL,
  link_href VARCHAR(500) NOT NULL,
  link_text VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('frequent', 'content', 'management', 'tools')),
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create admin_section_usage table
CREATE TABLE IF NOT EXISTS admin_section_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES admin_sections(id) ON DELETE CASCADE,
  accessed_at TIMESTAMP DEFAULT NOW(),
  user_id VARCHAR(255),
  session_id VARCHAR(255)
);

-- Create indexes
CREATE INDEX idx_admin_sections_category ON admin_sections(category);
CREATE INDEX idx_admin_sections_priority ON admin_sections(priority);
CREATE INDEX idx_admin_sections_active ON admin_sections(is_active);
CREATE INDEX idx_admin_section_usage_section_id ON admin_section_usage(section_id);
CREATE INDEX idx_admin_section_usage_accessed_at ON admin_section_usage(accessed_at);

-- Insert default sections
INSERT INTO admin_sections (title, description, icon, link_href, link_text, category, priority) VALUES
('Blog', 'Manage your blog posts and articles', 'FileText', '/admin/blogs', 'Manage Blog', 'content', 1),
('Profile', 'Update your personal information and contact details', 'User', '/admin/profile', 'Edit Profile', 'frequent', 2),
('Settings', 'Manage your website settings', 'Settings', '/admin/settings', 'Manage Settings', 'management', 3),
('Family', 'Manage family members and their access', 'Users', '/admin/family', 'Manage Family', 'management', 4),
('Expertise', 'Manage your skills, certifications and professional competencies', 'Star', '/admin/expertise', 'Manage Expertise', 'content', 5),
('My Works', 'Manage your research publications and legal case studies', 'Award', '/admin/works', 'Manage Works', 'content', 6),
('Case Vault', 'Manage legal case studies and research', 'Briefcase', '/admin/casevault', 'Manage Cases', 'content', 7),
('URL Shortener', 'Create and manage short URLs', 'Link', '/admin/url-shortner', 'Manage URLs', 'tools', 8),
('Subscribers', 'View and manage newsletter subscribers', 'Users', '/admin/subscribers', 'Manage Subscribers', 'management', 9); 