-- 테이블이 이미 존재하면 지우고 새로 만듭니다 (초기화 목적)
DROP TABLE IF EXISTS products;

-- 상품 테이블 생성
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  image TEXT NOT NULL
);

-- 4개의 상품 데이터 삽입
INSERT INTO products (name, price, image) VALUES 
('glass cup', 18000, 'https://images.unsplash.com/photo-1577926286628-e434e39e5b44?auto=format&fit=crop&q=80&w=600'),
('Signature Coffee Beans', 18000, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600'),
('Whole coffee beans', 18000, 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&q=80&w=600'),
('Drip Coffee kit', 24000, 'https://images.unsplash.com/photo-1544787210-2827443cb69b?auto=format&fit=crop&q=80&w=600');

-- 기존 유저 테이블 확장
CREATE TABLE IF NOT EXISTS USER_AUTH (
  LOGIN_ID TEXT PRIMARY KEY,
  PASSWORD TEXT NOT NULL,
  NAME TEXT NOT NULL,
  EMAIL TEXT,
  PHONE TEXT,
  ADDRESS TEXT,
  CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 권한 테이블 (이건 그대로 유지하거나 새로 작성)
CREATE TABLE IF NOT EXISTS USER_ROLES (
  LOGIN_ID TEXT,
  ROLE_NAME TEXT NOT NULL,
  FOREIGN KEY(LOGIN_ID) REFERENCES USER_AUTH(LOGIN_ID)
);

-- 테스트용 관리자 계정
INSERT INTO USER_AUTH (LOGIN_ID, PASSWORD, NAME, EMAIL, PHONE, ADDRESS) 
VALUES ('admin', 'admin123', '관리자', 'admin@dos.com', '010-0000-0000', 'Daejeon, South Korea');

-- 권한은 그대로 유지
INSERT INTO USER_ROLES (LOGIN_ID, ROLE_NAME) VALUES ('admin', 'ROLE_USER');
INSERT INTO USER_ROLES (LOGIN_ID, ROLE_NAME) VALUES ('admin', 'ROLE_ADMIN');