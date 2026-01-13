-- ===============================
-- Modern SaaS Template Seed
-- ===============================

-- 1. Create Template
INSERT INTO template_module_template (
    name,
    category,
    thumbnail_url,
    is_public,
    created_by,
    created_on,
    last_update_on
) VALUES (
    'Modern SaaS Template',
    'SAAS',
    'https://cdn.sitekit.dev/templates/modern-saas.png',
    TRUE,
    1,
    NOW(),
    NOW()
);

-- Capture template ID
SET @template_id = LAST_INSERT_ID();

-- 2. HEADER section
INSERT INTO template_module_template_section (
    template_id,
    section_type,
    variant,
    position,
    config_json
) VALUES (
    @template_id,
    'HEADER',
    'header_v1',
    1,
    '{
      "logoText": "SiteKit",
      "navLinks": [
        { "label": "Features", "href": "#features" },
        { "label": "Pricing", "href": "#pricing" },
        { "label": "About", "href": "#about" }
      ],
      "actionButton": {
        "label": "Get Started",
        "href": "/signup",
        "variant": "primary"
      }
    }'
);

-- 3. HERO section
INSERT INTO template_module_template_section (
    template_id,
    section_type,
    variant,
    position,
    config_json
) VALUES (
    @template_id,
    'HERO',
    'hero_v1',
    2,
    '{
      "headline": "Build websites at warp speed",
      "subheadline": "The only website builder that gives you clean code and infinite flexibility.",
      "primaryCta": { "label": "Start Building", "href": "/signup" },
      "secondaryCta": { "label": "View Demo", "href": "/demo" },
      "alignment": "center"
    }'
);

-- 4. CONTENT (Features) section
INSERT INTO template_module_template_section (
    template_id,
    section_type,
    variant,
    position,
    config_json
) VALUES (
    @template_id,
    'CONTENT',
    'content_v1',
    3,
    '{
      "title": "Why choose SiteKit?",
      "description": "Everything you need to launch your SaaS in minutes.",
      "layout": "grid",
      "features": [
        {
          "title": "Drag & Drop",
          "description": "Intuitive editor that feels like magic."
        },
        {
          "title": "Fast Performance",
          "description": "Optimized for Core Web Vitals out of the box."
        },
        {
          "title": "SEO Ready",
          "description": "Built-in SEO tools to help you rank higher."
        }
      ]
    }'
);

-- 5. CTA section
INSERT INTO template_module_template_section (
    template_id,
    section_type,
    variant,
    position,
    config_json
) VALUES (
    @template_id,
    'CTA',
    'cta_v1',
    4,
    '{
      "title": "Ready to launch?",
      "description": "Join 10,000+ founders building with SiteKit.",
      "buttonText": "Start your free trial",
      "buttonLink": "/signup"
    }'
);

-- 6. FOOTER section
INSERT INTO template_module_template_section (
    template_id,
    section_type,
    variant,
    position,
    config_json
) VALUES (
    @template_id,
    'FOOTER',
    'footer_v1',
    5,
    '{
      "brandName": "SiteKit",
      "description": "Making web development accessible to everyone.",
      "columns": [
        {
          "title": "Product",
          "links": [
            { "label": "Features", "href": "#" },
            { "label": "Integrations", "href": "#" }
          ]
        },
        {
          "title": "Company",
          "links": [
            { "label": "About Us", "href": "#" },
            { "label": "Careers", "href": "#" }
          ]
        }
      ],
      "copyrightText": "© 2024 SiteKit Inc."
    }'
);
