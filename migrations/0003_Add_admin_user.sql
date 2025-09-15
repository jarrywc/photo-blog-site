-- Migration number: 0003 	 2025-09-15T02:48:58.745Z

-- Add admin user husband@dianacain.com
INSERT INTO users (email, password, name) VALUES (
  'husband@dianacain.com',
  'VD2Dn0bPCs1XYP72TGZ4m1CBCtDd7tYps9h0qwv/D6KpuncQmckQmLfErCdWhn56e6n2sknq93+WZozmlxxS2w==',
  'Admin User'
);

-- Assign admin role (role_id = 1 for admin)
INSERT INTO user_roles (user_id, role_id) VALUES (
  (SELECT id FROM users WHERE email = 'husband@dianacain.com'),
  1
);
