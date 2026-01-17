CREATE TABLE template_module_asset (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),

    site_id BIGINT,
    created_by BIGINT NOT NULL,

    created_on DATETIME NOT NULL,
    last_update_on DATETIME NOT NULL,

    CONSTRAINT fk_asset_site
        FOREIGN KEY (site_id)
        REFERENCES template_module_site (id)
        ON DELETE SET NULL,

    CONSTRAINT fk_asset_created_by
        FOREIGN KEY (created_by)
        REFERENCES access_management_engine_user (id)
        ON DELETE CASCADE,

    CONSTRAINT chk_asset_type
        CHECK (asset_type IN ('IMAGE', 'PDF', 'WORD', 'VIDEO', 'LINK'))
);

CREATE INDEX idx_asset_created_by
    ON template_module_asset (created_by);

CREATE INDEX idx_asset_site_id
    ON template_module_asset (site_id);

CREATE INDEX idx_asset_site_type
    ON template_module_asset (site_id, asset_type);

CREATE INDEX idx_asset_user_type
    ON template_module_asset (created_by, asset_type);