-- 1. 기존 테이블이 있다면 깔끔하게 삭제 (순서 중요: 의존성이 있는 것부터 삭제)
DROP TABLE IF EXISTS USER_ROLES;
DROP TABLE IF EXISTS USER_AUTH;
DROP TABLE IF EXISTS products;

-- 2. 사용자 테이블 생성 (🌟 이메일 인증 컬럼 추가)
CREATE TABLE USER_AUTH (
    LOGIN_ID TEXT PRIMARY KEY,
    PASSWORD TEXT NOT NULL,
    NAME TEXT NOT NULL,
    EMAIL TEXT NOT NULL,
    PHONE TEXT,
    ADDRESS TEXT,
    IS_VERIFIED INTEGER DEFAULT 0, -- 🌟 이메일 인증 여부 (0: 미인증, 1: 인증완료)
    VERIFY_TOKEN TEXT,             -- 🌟 이메일 인증 링크에 쓰일 고유 난수 토큰
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 사용자 권한 테이블 생성 (다중 역할 부여 가능)
CREATE TABLE USER_ROLES (
    LOGIN_ID TEXT NOT NULL,
    ROLE_NAME TEXT NOT NULL,
    PRIMARY KEY (LOGIN_ID, ROLE_NAME),
    FOREIGN KEY (LOGIN_ID) REFERENCES USER_AUTH(LOGIN_ID) ON DELETE CASCADE
);

-- 4. 상품 테이블 생성
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 초기 더미 데이터 셋업
-- ==========================================

-- 관리자(admin) 계정 생성 
-- 🌟 주의: 관리자는 이메일 인증을 거치지 않아도 되도록 IS_VERIFIED 값을 1로 강제 설정합니다.
INSERT INTO USER_AUTH (LOGIN_ID, PASSWORD, NAME, EMAIL, PHONE, ADDRESS, IS_VERIFIED) 
VALUES ('admin', 'admin123', '관리자', 'admin@dos.com', '010-0000-0000', 'Daejeon, South Korea', 1);

-- 관리자 권한 부여
INSERT INTO USER_ROLES (LOGIN_ID, ROLE_NAME) VALUES ('admin', 'ROLE_USER');
INSERT INTO USER_ROLES (LOGIN_ID, ROLE_NAME) VALUES ('admin', 'ROLE_ADMIN');

-- ==========================================
-- 물품(Products) 초기 더미 데이터 주입 (외부 이미지 링크 적용)
-- ==========================================

INSERT INTO products (name, price, image) VALUES 
('Signature Coffee Beans', 18000, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600'),
('Whole coffee beans', 18000, 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&q=80&w=600');

INSERT INTO products (name, price, description, image) VALUES 
('아이스 아메리카노', 4500, '에티오피아 원두로 블렌딩한 산뜻하고 시원한 아메리카노', 'https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&w=600&q=80');

INSERT INTO products (name, price, description, image) VALUES 
('카페라떼', 5000, '고소한 우유와 진한 에스프레소의 완벽한 조화', 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=600&q=80');

INSERT INTO products (name, price, description, image) VALUES 
('바닐라 빈 라떼', 5500, '천연 바닐라 빈 시럽이 듬뿍 들어간 달콤한 라떼', 'https://images.unsplash.com/photo-1585494156145-1c60a4fe952b?auto=format&fit=crop&w=600&q=80');

INSERT INTO products (name, price, description, image) VALUES 
('콜드브루 오트 라떼', 6000, '12시간 우려낸 콜드브루와 건강한 귀리 우유의 만남', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80');

INSERT INTO products (name, price, description, image) VALUES 
('크림치즈 베이글', 3800, '따뜻하게 데운 쫄깃한 베이글과 플레인 크림치즈', 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80');