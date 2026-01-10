-- User Table
CREATE TABLE IF NOT EXISTS access_management_engine_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    email_address VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_update_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Site Table
CREATE TABLE template_module_site (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL,

    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,

    site_status VARCHAR(50) NOT NULL,

    created_on DATETIME NOT NULL,
    last_update_on DATETIME NOT NULL,

    CONSTRAINT fk_template_site_user
        FOREIGN KEY (user_id)
        REFERENCES access_management_engine_user (id)
        ON DELETE CASCADE,

    CONSTRAINT chk_site_status
        CHECK (site_status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);
CREATE INDEX idx_template_site_user_id
    ON template_module_site (user_id);
CREATE UNIQUE INDEX idx_template_site_domain
    ON template_module_site (domain);

-- Page Table
CREATE TABLE template_module_page (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    site_id BIGINT NOT NULL,

    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,

    status VARCHAR(50) NOT NULL,

    created_on DATETIME NOT NULL,
    last_update_on DATETIME NOT NULL,

    CONSTRAINT fk_page_site
        FOREIGN KEY (site_id)
        REFERENCES template_module_site (id)
        ON DELETE CASCADE,

    CONSTRAINT uq_site_slug
        UNIQUE (site_id, slug),

    CONSTRAINT chk_page_status
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);
CREATE INDEX idx_page_site_id
    ON template_module_page (site_id);
CREATE INDEX idx_page_site_status
    ON template_module_page (site_id, status);

-- Page Section Table
CREATE TABLE template_module_page_section (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    page_id BIGINT NOT NULL,

    section_type VARCHAR(50) NOT NULL,
    variant VARCHAR(100) NOT NULL,
    position INT NOT NULL,

    config_json JSON NOT NULL,

    created_on DATETIME NOT NULL,
    last_update_on DATETIME NOT NULL,

    CONSTRAINT fk_page_section_page
        FOREIGN KEY (page_id)
        REFERENCES template_module_page (id)
        ON DELETE CASCADE,

    CONSTRAINT chk_section_type
        CHECK (section_type IN ('HEADER', 'HERO', 'CONTENT', 'CTA', 'FOOTER'))
);
CREATE INDEX idx_page_section_page
    ON template_module_page_section (page_id);
CREATE INDEX idx_page_section_page_position
    ON template_module_page_section (page_id, position);


-- Template Table
CREATE TABLE template_module_template (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,

    thumbnail_url VARCHAR(500),

    is_public BOOLEAN NOT NULL,

    created_by BIGINT,

    created_on DATETIME NOT NULL,
    last_update_on DATETIME NOT NULL,

    CONSTRAINT fk_template_created_by
        FOREIGN KEY (created_by)
        REFERENCES access_management_engine_user (id)
        ON DELETE SET NULL
);
CREATE INDEX idx_template_category
    ON template_module_template (category);
CREATE INDEX idx_template_public
    ON template_module_template (is_public);

-- Template Section Table
CREATE TABLE template_module_template_section (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    template_id BIGINT NOT NULL,

    section_type VARCHAR(50) NOT NULL,
    variant VARCHAR(100) NOT NULL,
    position INT NOT NULL,

    config_json JSON NOT NULL,

    CONSTRAINT fk_template_section_template
        FOREIGN KEY (template_id)
        REFERENCES template_module_template (id)
        ON DELETE CASCADE,

    CONSTRAINT chk_template_section_type
        CHECK (section_type IN ('HEADER', 'HERO', 'CONTENT', 'CTA', 'FOOTER'))
);
CREATE INDEX idx_template_section_template
    ON template_module_template_section (template_id);
CREATE INDEX idx_template_section_order
    ON template_module_template_section (template_id, position);


