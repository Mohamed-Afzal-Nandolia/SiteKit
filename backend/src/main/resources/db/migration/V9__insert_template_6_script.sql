-- =========================================
-- Vx__seed_lens_and_layer_creator_template.sql
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
    'Lens & Layer – Visual Artist Template',
    'CREATOR',
    'https://cdn.sitekit.dev/templates/lens-and-layer.png',
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
      "logoText":"LENS & LAYER",
      "navLinks":[
        {"label":"Photography","href":"#photo"},
        {"label":"VFX & Edit","href":"#vfx"},
        {"label":"Software","href":"#stack"},
        {"label":"Contact","href":"#contact"}
      ],
      "actionButton":{
        "label":"View Showreel",
        "href":"#reel",
        "variant":"outline"
      }
    }'
);

-- 3. HERO (Intro)
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'HERO',
    'hero_v1',
    1,
    '{
      "headline":"Capturing Reality, Creating Magic.",
      "subheadline":"I am a multi-disciplinary visual artist specializing in Photography, Video Editing, and Motion Graphics.",
      "primaryCta":{"label":"See My Work","href":"#work"},
      "secondaryCta":{"label":"Get in Touch","href":"#contact"},
      "alignment":"center",
      "backgroundImage":"https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop"
    }'
);

-- 4. CONTENT (Disciplines)
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'CONTENT',
    'content_v1',
    2,
    '{
      "title":"My Disciplines",
      "description":"Blurring the line between what is real and what is imagined.",
      "layout":"grid",
      "features":[
        {"title":"Photography","description":"Portrait, Street, and Landscape photography with a cinematic touch."},
        {"title":"Video Editing","description":"Narrative storytelling through pacing, rhythm, and color."},
        {"title":"VFX & Composition","description":"Integrating CGI, removing wires, and set extensions using Nuke & AE."},
        {"title":"Color Grading","description":"Mood enhancement and stylistic looks for film and commercials."}
      ]
    }'
);

-- 5. HERO (Photography)
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'HERO',
    'hero_v1',
    3,
    '{
      "headline":"Through The Lens",
      "subheadline":"A collection of moments frozen in time. From the streets of Tokyo to the mountains of Norway.",
      "primaryCta":{"label":"View Gallery","href":"#photo"},
      "alignment":"left",
      "backgroundImage":"https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2070"
    }'
);

-- 6. CONTENT (Featured Series)
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'CONTENT',
    'content_v1',
    4,
    '{
      "title":"Featured Series",
      "description":"Highlights from recent photo essays.",
      "layout":"grid",
      "features":[
        {"title":"Neon Nights","description":"Cyberpunk-inspired street photography in rain."},
        {"title":"The Silent Peaks","description":"Minimalist black and white landscapes."},
        {"title":"Urban Portraits","description":"High-fashion editorial shots in gritty environments."}
      ]
    }'
);

-- 7. HERO (VFX)
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'HERO',
    'hero_v1',
    5,
    '{
      "headline":"Beyond Reality: VFX & Motion",
      "subheadline":"Where imagination meets technical precision. Explosions, magic, and impossible worlds.",
      "primaryCta":{"label":"Watch Breakdown","href":"#vfx"},
      "alignment":"center",
      "backgroundImage":"https://images.unsplash.com/photo-1535016120720-40c6874c3b1c?q=80&w=2064"
    }'
);

-- 8. CONTENT (Toolbelt)
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'CONTENT',
    'content_v1',
    6,
    '{
      "title":"The Toolbelt",
      "description":"Software I use to bring visions to life.",
      "layout":"grid",
      "features":[
        {"title":"Adobe Photoshop","description":"Advanced retouching and compositing."},
        {"title":"Adobe Premiere Pro","description":"Timeline editing and narrative cut."},
        {"title":"After Effects","description":"Motion graphics and 2.5D animation."},
        {"title":"DaVinci Resolve","description":"Professional color grading."},
        {"title":"Blender 3D","description":"Modeling, rigging, and rendering."},
        {"title":"Nuke","description":"Node-based compositing for high-end VFX."}
      ]
    }'
);

-- 9. HERO (Experience)
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'HERO',
    'hero_v1',
    7,
    '{
      "headline":"Experience & Clients",
      "subheadline":"Trusted by brands and creators worldwide to deliver high-quality visual assets on time.",
      "alignment":"left"
    }'
);

-- 10. CTA
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'CTA',
    'cta_v1',
    8,
    '{
      "title":"Available for Freelance",
      "description":"Need a photographer for your event or a VFX artist for your short film? Let''s talk.",
      "buttonText":"Start a Project",
      "buttonLink":"mailto:contact@lensandlayer.com"
    }'
);

-- 11. FOOTER
INSERT INTO template_module_template_section
(template_id, section_type, variant, position, config_json)
VALUES (
    @template_id,
    'FOOTER',
    'footer_v1',
    9,
    '{
      "brandName":"LENS & LAYER",
      "description":"Visual Artistry by @CreatorName.",
      "copyrightText":"© 2024 Lens & Layer.",
      "columns":[
        {
          "title":"Socials",
          "links":[
            {"label":"Instagram","href":"#"},
            {"label":"ArtStation","href":"#"},
            {"label":"Behance","href":"#"},
            {"label":"Vimeo","href":"#"}
          ]
        },
        {
          "title":"Legal",
          "links":[
            {"label":"Terms","href":"#"},
            {"label":"Privacy","href":"#"}
          ]
        }
      ]
    }'
);
