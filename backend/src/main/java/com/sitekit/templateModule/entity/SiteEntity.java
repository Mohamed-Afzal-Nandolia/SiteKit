package com.sitekit.templateModule.entity;

import com.sitekit.userManagementModule.entity.UserEntity;
import com.sitekit.utilityModule.enums.SiteStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "template_module_site")
public class SiteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "domain", nullable = false, unique = true)
    private String domain;

    @Column(name = "site_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private SiteStatus siteStatus;

    @Column(name = "created_on")
    private LocalDateTime createdOn;

    @Column(name = "last_update_on")
    private LocalDateTime lastUpdatedOn;

    @PrePersist
    protected void onCreate() {
        this.createdOn = LocalDateTime.now();
        this.lastUpdatedOn = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastUpdatedOn = LocalDateTime.now();
    }

}
