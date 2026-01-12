package com.sitekit.templateModule.repository;

import com.sitekit.templateModule.entity.PageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PageRepository extends JpaRepository<PageEntity, Long> {
    List<PageEntity> findBySiteId(Long siteId);

    Optional<PageEntity> findBySiteIdAndSlug(Long siteId, String slug);

    boolean existsBySiteIdAndSlug(Long siteId, String slug);
}
