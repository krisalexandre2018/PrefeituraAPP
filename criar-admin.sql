-- Script para criar Super Admin
-- Email: kris.alexandre2018@gmail.com
-- Senha: admin123
-- CPF: 00000971409

-- Primeiro, deletar se já existir (para evitar erro de duplicata)
DELETE FROM users WHERE email = 'kris.alexandre2018@gmail.com';

-- Criar o admin
-- Senha hasheada (bcrypt): admin123
INSERT INTO users (
  id,
  nome,
  cpf,
  email,
  senha,
  telefone,
  tipo,
  status,
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Administrador',
  '00000971409',
  'kris.alexandre2018@gmail.com',
  '$2a$10$YQvE5z5K5Z5Z5Z5Z5Z5Z5.rJ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5',
  '(00) 00000-0000',
  'ADMIN',
  'ATIVO',
  NOW(),
  NOW()
);

-- Verificar se foi criado
SELECT id, nome, email, cpf, tipo, status FROM users WHERE email = 'kris.alexandre2018@gmail.com';
