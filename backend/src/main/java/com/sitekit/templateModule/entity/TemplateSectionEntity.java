package com.sitekit.templateModule.entity;

import com.sitekit.utilityModule.enums.SectionType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "template_module_template_section")
public class TemplateSectionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "template_id", nullable = false)
    private TemplateEntity template;

    @Enumerated(EnumType.STRING)
    @Column(name = "section_type", nullable = false)
    private SectionType sectionType;

    @Column(name = "variant", nullable = false)
    private String variant;

    @Column(name = "position", nullable = false)
    private Integer position;

    @Lob
    @Column(name = "config_json", nullable = false, columnDefinition = "JSON")
    private String configJson;

}
