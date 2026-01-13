package com.sitekit.templateModule.repository;

import com.sitekit.templateModule.entity.TemplateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TemplateRepository extends JpaRepository<TemplateEntity, Long> {

    List<TemplateEntity> findAllByCreatedBy_Id(Long id);

}
