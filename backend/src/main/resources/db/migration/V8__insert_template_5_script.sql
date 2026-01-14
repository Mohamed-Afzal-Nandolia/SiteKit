-- =========================================
-- V9__seed_evo_automotive_template.sql
-- =========================================

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
    'EVO Automotive Electric Car Template',
    'AUTOMOTIVE',
    'https://cdn.sitekit.dev/templates/evo-gt.png',
    TRUE,
    1,
    NOW(),
    NOW()
);

SET @template_id = LAST_INSERT_ID();

-- 2. HEADER
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'HEADER',
    'header_v1',
    0,
    '{
      "logoText":"EVO",
      "navLinks":[
        {"label":"Models","href":"#models"},
        {"label":"Technology","href":"#tech"},
        {"label":"Charging","href":"#charging"},
        {"label":"Find Us","href":"#dealer"}
      ],
      "actionButton":{
        "label":"Test Drive",
        "href":"#test-drive",
        "variant":"primary"
      }
    }'
);

-- 3. HERO (Launch)
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'HERO',
    'hero_v1',
    1,
    '{
      "headline":"The All-New Evo-GT",
      "subheadline":"0-60 in 1.9 seconds. 600 miles range. The future of electric performance is here.",
      "primaryCta":{"label":"Order Now","href":"#build"},
      "secondaryCta":{"label":"Watch Film","href":"#video"},
      "alignment":"center",
      "backgroundImage":"https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070"
    }'
);

-- 4. CONTENT (Performance)
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'CONTENT',
    'content_v1',
    2,
    '{
      "title":"Unleashed Performance",
      "description":"Engineering that defies physics.",
      "layout":"grid",
      "features":[
        {"title":"1,020 hp","description":"Peak power from tri-motor AWD system."},
        {"title":"200 mph","description":"Top speed that leaves competition in the dust."},
        {"title":"600 miles","description":"Industry-leading range on a single charge."},
        {"title":"0.20 Cd","description":"Lowest drag coefficient in its class."}
      ]
    }'
);

-- 5. HERO (Interior)
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'HERO',
    'hero_v1',
    3,
    '{
      "headline":"First Class Cabin",
      "subheadline":"A sanctuary of silence and technology. Vegan leather seats, immersive sound, and a panoramic glass roof.",
      "alignment":"left",
      "backgroundImage":"https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=2070"
    }'
);

-- 6. CONTENT (Technology)
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'CONTENT',
    'content_v1',
    4,
    '{
      "title":"Intelligent Systems",
      "description":"Your co-pilot for every journey.",
      "layout":"grid",
      "features":[
        {"title":"Evo-Pilot 3.0","description":"Full self-driving capability on highways and city streets."},
        {"title":"Hyperscreen","description":"56-inch curved glass display across the dashboard."},
        {"title":"OTA Updates","description":"Software that improves your car over time."},
        {"title":"5G Connected","description":"Instant streaming and navigation data."}
      ]
    }'
);

-- 7. HERO (Design)
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'HERO',
    'hero_v1',
    5,
    '{
      "headline":"Sculpted by Wind",
      "subheadline":"Every curve serves a purpose. Designed for maximum efficiency and stunning aesthetics.",
      "alignment":"center",
      "backgroundImage":"https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2070"
    }'
);

-- 8. CONTENT (Lineup)
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'CONTENT',
    'content_v1',
    6,
    '{
      "title":"The Evo Lineup",
      "description":"A vehicle for every lifestyle.",
      "layout":"grid",
      "features":[
        {"title":"Evo-S","description":"The luxury sedan that started it all. Starting at $89,000."},
        {"title":"Evo-X","description":"7-seater SUV with room for adventure. Starting at $99,000."},
        {"title":"Evo-Roadster","description":"Top-down freedom. Coming 2026."},
        {"title":"Evo-Cyber","description":"The indestructible pickup truck. Reserve now."}
      ]
    }'
);

-- 9. CONTENT (Sustainability)
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'CONTENT',
    'content_v1',
    7,
    '{
      "title":"Built for the Planet",
      "description":"Sustainability is at our core.",
      "layout":"grid",
      "features":[
        {"title":"Zero Emissions","description":"Driving a cleaner future for everyone."},
        {"title":"Recycled Materials","description":"Interiors made from ocean plastics and reclaimed wood."},
        {"title":"Green Factories","description":"Manufacturing powered 100% by renewable energy."}
      ]
    }'
);

-- 10. HERO (Safety)
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'HERO',
    'hero_v1',
    8,
    '{
      "headline":"Safety First",
      "subheadline":"Rated 5-Stars in every category. Reinforced chassis and 12 airbags protect what matters most.",
      "primaryCta":{"label":"Safety Report","href":"#safety"},
      "alignment":"left",
      "backgroundImage":"https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070"
    }'
);

-- 11. CTA
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'CTA',
    'cta_v1',
    9,
    '{
      "title":"Ready to Drive?",
      "description":"Schedule a demo drive near you or configure your dream car online.",
      "buttonText":"Design Yours",
      "buttonLink":"#design"
    }'
);

-- 12. FOOTER
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'FOOTER',
    'footer_v1',
    10,
    '{
      "brandName":"Evo Automotive",
      "description":"Accelerating the world''s transition to sustainable energy.",
      "copyrightText":"© 2024 Evo Motors Inc.",
      "columns":[
        {
          "title":"Vehicles",
          "links":[
            {"label":"Inventory","href":"#"},
            {"label":"Used Cars","href":"#"},
            {"label":"Fleet","href":"#"}
          ]
        },
        {
          "title":"Owners",
          "links":[
            {"label":"Service","href":"#"},
            {"label":"Charging Map","href":"#"},
            {"label":"Shop Parts","href":"#"}
          ]
        },
        {
          "title":"Company",
          "links":[
            {"label":"About","href":"#"},
            {"label":"Investors","href":"#"}
          ]
        }
      ]
    }'
);
