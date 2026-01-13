package com.sitekit.templateModule.repository;

import com.sitekit.templateModule.entity.SiteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SiteRepository extends JpaRepository<SiteEntity, Long> {

    List<SiteEntity> findAllByUserId(Long userId);

    Optional<SiteEntity> findByIdAndUserId(Long siteId, Long userId);

    boolean existsByDomain(String domain);

}
