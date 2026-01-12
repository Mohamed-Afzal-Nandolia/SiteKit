package com.sitekit.templateModule.repository;

import com.sitekit.templateModule.entity.PageSectionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PageSectionRepository extends JpaRepository<PageSectionEntity, Long> {

    List<PageSectionEntity> findByPageIdOrderByPositionAsc(Long pageId);

    int countByPageId(Long pageId);

    List<PageSectionEntity> findByPage_Id(Long pageId);
}
