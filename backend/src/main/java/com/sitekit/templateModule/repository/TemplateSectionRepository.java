package com.sitekit.templateModule.repository;

import com.sitekit.templateModule.entity.TemplateSectionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TemplateSectionRepository extends JpaRepository<TemplateSectionEntity, Long> {

    List<TemplateSectionEntity> findAllByTemplateId(Long id);

}
