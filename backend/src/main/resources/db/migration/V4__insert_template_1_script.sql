-- ===============================
-- Modern SaaS Template Seed (Responsive & Draggable)
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

-- 2. HEADER section (Kept structured for logic, but can accept elements)
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
      },
      "elements": []
    }'
);


-- 3. HERO section (Converted to Draggable Elements)
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
      "sectionBackground": "transparent",
      "elements": [
        {
          "id": "hero-headline",
          "type": "text",
          "content": "Build websites at warp speed",
          "x": 50, "y": 30,
          "fontSize": 64,
          "fontWeight": "800",
          "textAlign": "center",
          "mobile": {
             "x": 50, "y": 20,
             "fontSize": 42
          }
        },
        {
          "id": "hero-subheadline",
          "type": "text",
          "content": "The only website builder that gives you clean code and infinite flexibility.",
          "x": 50, "y": 45,
          "fontSize": 20,
          "textAlign": "center",
          "mobile": {
             "x": 50, "y": 40,
             "fontSize": 18
          }
        },
        {
          "id": "hero-cta-primary",
          "type": "button",
          "content": "Start Building",
          "href": "/signup",
          "x": 42, "y": 60,
          "backgroundColor": "#2563EB", 
          "textColor": "#ffffff",
          "paddingX": 32, "paddingY": 16,
          "borderRadius": 12,
          "mobile": {
             "x": 50, "y": 60,
             "fontSize": 16
          }
        },
        {
          "id": "hero-cta-secondary",
          "type": "button",
          "content": "View Demo",
          "href": "/demo",
          "x": 58, "y": 60,
          "backgroundColor": "#ffffff", 
          "textColor": "#0f172a",
          "borderColor": "#e2e8f0",
          "borderWidth": 1,
          "paddingX": 32, "paddingY": 16,
          "borderRadius": 12,
          "mobile": {
             "x": 50, "y": 72,
             "fontSize": 16
          }
        }
      ]
    }'
);

-- 4. CONTENT (Features) section (Converted to Draggable Elements)
-- Represents a Grid layout using manual positioning
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
      "elements": [
        {
           "id": "feature-title",
           "type": "text",
           "content": "Why choose SiteKit?",
           "x": 50, "y": 10,
           "fontSize": 36,
           "fontWeight": "700",
           "textAlign": "center",
           "mobile": { "x": 50, "y": 5, "fontSize": 28 }
        },
        {
           "id": "feature-1-title",
           "type": "text",
           "content": "Drag & Drop",
           "x": 20, "y": 40,
           "fontSize": 24,
           "fontWeight": "600",
           "mobile": { "x": 50, "y": 25 }
        },
        {
           "id": "feature-1-desc",
           "type": "text",
           "content": "Intuitive editor that feels like magic.",
           "x": 20, "y": 55,
           "fontSize": 16,
           "mobile": { "x": 50, "y": 32 }
        },
         {
           "id": "feature-2-title",
           "type": "text",
           "content": "Fast Performance",
           "x": 50, "y": 40,
           "fontSize": 24,
           "fontWeight": "600",
           "mobile": { "x": 50, "y": 45 }
        },
        {
           "id": "feature-2-desc",
           "type": "text",
           "content": "Optimized for Core Web Vitals.",
           "x": 50, "y": 55,
           "fontSize": 16,
           "mobile": { "x": 50, "y": 52 }
        },
         {
           "id": "feature-3-title",
           "type": "text",
           "content": "SEO Ready",
           "x": 80, "y": 40,
           "fontSize": 24,
           "fontWeight": "600",
           "mobile": { "x": 50, "y": 65 }
        },
        {
           "id": "feature-3-desc",
           "type": "text",
           "content": "Built-in SEO tools to help you rank.",
           "x": 80, "y": 55,
           "fontSize": 16,
           "mobile": { "x": 50, "y": 72 }
        }
      ]
    }'
);


-- 5. CTA section (Converted to Draggable Elements)
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
      "sectionBackground": "#2563EB",
      "elements": [
        {
          "id": "cta-title",
          "type": "text",
          "content": "Ready to launch?",
          "x": 50, "y": 30,
          "fontSize": 48,
          "fontWeight": "700",
          "textColor": "#ffffff",
          "textAlign": "center",
          "mobile": { "x": 50, "y": 20, "fontSize": 32 }
        },
        {
          "id": "cta-desc",
          "type": "text",
          "content": "Join 10,000+ founders building with SiteKit.",
          "x": 50, "y": 50,
          "fontSize": 20,
          "textColor": "#bfdbfe",
          "textAlign": "center",
          "mobile": { "x": 50, "y": 40, "fontSize": 18 }
        },
        {
          "id": "cta-button",
          "type": "button",
          "content": "Start your free trial",
          "href": "/signup",
          "x": 50, "y": 70,
          "backgroundColor": "#ffffff",
          "textColor": "#2563EB",
          "paddingX": 32, "paddingY": 16,
          "borderRadius": 12,
          "mobile": { "x": 50, "y": 65 }
        }
      ]
    }'
);

-- 6. FOOTER section (Kept structured)
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
      "copyrightText": "© 2024 SiteKit Inc.",
      "elements": []
    }'
);
