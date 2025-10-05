-- =========================================================
-- ONE FILE SEED for Cloudflare D1 (SQLite)
-- - Generated with ChatGPT - am not writing all this seed data myself
-- =========================================================
DELETE FROM posts;
DELETE FROM users;
DELETE FROM sqlite_sequence WHERE name IN ('users','posts');

-- ----------------------------------------
-- Base users
-- ----------------------------------------
INSERT INTO users (first_name, last_name, email, role, created_at, updated_at) VALUES
  ('John',    'Doe',      'john.doe@example.com',     'admin', DATETIME('now','-110 days'), DATETIME('now','-110 days')),
  ('Jane',    'Smith',    'jane.smith@example.com',   'admin', DATETIME('now','-105 days'), DATETIME('now','-105 days')),
  ('Bob',     'Johnson',  'bob.johnson@example.com',  'user',  DATETIME('now','-90 days'),  DATETIME('now','-90 days')),
  ('Alice',   'Williams', 'alice.williams@example.com','guest',DATETIME('now','-86 days'),  DATETIME('now','-86 days')),
  ('Charlie', 'Brown',    'charlie.brown@example.com','user',  DATETIME('now','-82 days'),  DATETIME('now','-82 days')),
  ('Diana',   'Prince',   'diana.prince@example.com', 'user',  DATETIME('now','-78 days'),  DATETIME('now','-78 days')),
  ('Ethan',   'Hunt',     'ethan.hunt@example.com',   'guest', DATETIME('now','-74 days'),  DATETIME('now','-74 days')),
  ('Fiona',   'Gallagher','fiona.gallagher@example.com','user',DATETIME('now','-70 days'),  DATETIME('now','-70 days')),
  ('George',  'Miller',   'george.miller@example.com','user',  DATETIME('now','-66 days'),  DATETIME('now','-66 days')),
  ('Hannah',  'Taylor',   'hannah.taylor@example.com','guest', DATETIME('now','-62 days'),  DATETIME('now','-62 days'));

-- ----------------------------------------
-- Extra synthetic users (U001..U020)
-- Roles cycled: admin every 10th, guest every 3rd, else user
-- created_at scattered across last 120 days
-- ----------------------------------------
WITH RECURSIVE seq(n) AS (
  SELECT 1
  UNION ALL
  SELECT n+1 FROM seq WHERE n < 20
)
INSERT INTO users (first_name, last_name, email, role, created_at, updated_at)
SELECT
  'User' AS first_name,
  printf('U%03d', n) AS last_name,
  printf('user%03d@example.com', n) AS email,
  CASE
    WHEN n % 10 = 0 THEN 'admin'
    WHEN n % 3  = 0 THEN 'guest'
    ELSE 'user'
  END AS role,
  DATETIME('now', printf('-%d days', 5 + (ABS(RANDOM()) % 120))) AS created_at,
  DATETIME('now') AS updated_at
FROM seq;

-- ----------------------------------------
-- Post templates
-- ----------------------------------------
WITH
  templates(id, title, content) AS (
    VALUES
      (1, 'Welcome to our platform!', 'Kicking things off with a warm welcome to everyone.'),
      (2, 'Platform Updates', 'We’ve shipped a few improvements and bug fixes this week.'),
      (3, 'Tips for New Users', 'Here are some helpful tips to get started quickly.'),
      (4, 'Feature Idea', 'Thinking about adding a dark mode — thoughts?'),
      (5, 'Bug Report', 'Noticed something odd in the login flow, here are the details.'),
      (6, 'Community Guidelines', 'A quick reminder to keep things friendly and constructive.'),
      (7, 'Release Notes', 'Highlights from our latest release.'),
      (8, 'Question for the Team', 'How do you organise your workspace for productivity?')
  ),

  -- Days 0..89 (today..90 days ago)
  days(d) AS (
    SELECT 0
    UNION ALL
    SELECT d + 1 FROM days WHERE d < 89
  ),

  -- Up to 3 candidates per day; we’ll randomly drop some to get 0–3/day
  slots(s) AS (
    SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
  ),

  candidates AS (
    SELECT
      -- Spread timestamps during the day a bit (0–20 hours)
      DATETIME(DATE('now','-' || d || ' days'), printf('+%d hours', ABS(RANDOM()) % 21)) AS ts,
      -- Randomly keep or drop each slot
      ABS(RANDOM()) % 4 AS keep_flag,
      -- Pick a random existing user id in range 1..COUNT(users)
      (ABS(RANDOM()) % (SELECT COUNT(*) FROM users)) + 1 AS user_id,
      -- Choose a template id by mixing day and randomness
      ((d + ABS(RANDOM()) % (SELECT MAX(id) FROM templates)) % (SELECT MAX(id) FROM templates)) + 1 AS template_id
    FROM days
    CROSS JOIN slots
  )

INSERT INTO posts (user_id, title, content, created_at, updated_at)
SELECT
  c.user_id,
  t.title,
  t.content,
  c.ts AS created_at,
  c.ts AS updated_at
FROM candidates c
JOIN templates t ON t.id = c.template_id
WHERE c.keep_flag IN (1,2,3); -- ~0–3 posts/day

-- ----------------------------------------
-- Quick sanity check
-- ----------------------------------------
SELECT 'Users inserted:'  AS info, COUNT(*) AS count FROM users
UNION ALL
SELECT 'Posts inserted:'  AS info, COUNT(*) AS count FROM posts;
