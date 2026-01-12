package com.sitekit.templateModule.service.impl;

import com.sitekit.templateModule.entity.PageEntity;
import com.sitekit.templateModule.entity.SiteEntity;
import com.sitekit.templateModule.model.PageDTO;
import com.sitekit.templateModule.repository.PageRepository;
import com.sitekit.templateModule.repository.SiteRepository;
import com.sitekit.templateModule.service.PageService;
import com.sitekit.utilityModule.enums.PageStatus;
import com.sitekit.utilityModule.exceptions.ResourceAlreadyExists;
import com.sitekit.utilityModule.userUtils.UserUtils;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PageServiceImpl implements PageService {

    final private PageRepository pageRepository;
    final private SiteRepository siteRepository;
    final private ModelMapper modelMapper;
    final private UserUtils userUtils;

    @Override
    public PageDTO createPage(PageDTO pageDTO) {
        Long userId = pageDTO.getSite().getUser().getId();
        Long siteId = pageDTO.getSite().getId();
        String slug = pageDTO.getSlug();

        userUtils.getUserById(userId);

        if(pageRepository.existsBySiteIdAndSlug(siteId, slug)){
            throw new ResourceAlreadyExists("Slug already exists for this site");
        }
        SiteEntity site = siteRepository.findById(siteId)
                .orElseThrow(() -> new RuntimeException("Site not found"));

        PageEntity page = modelMapper.map(pageDTO, PageEntity.class);
        page.setSite(site);
        page.setStatus(PageStatus.DRAFT);
        pageRepository.save(page);

        return modelMapper.map(page, PageDTO.class);

    }

    @Override
    public List<PageDTO> getPagesBySite(PageDTO pageDTO) {
        Long userId = pageDTO.getSite().getUser().getId();
        Long siteId = pageDTO.getSite().getId();
        userUtils.getUserById(userId);
        return pageRepository.findBySiteId(siteId)
                .stream()
                .map(pageEntity -> modelMapper.map(pageEntity, PageDTO.class))
                .toList();
    }

    @Override
    public PageDTO getPageBySlug(PageDTO pageDTO) {
        Long userId = pageDTO.getSite().getUser().getId();
        Long siteId = pageDTO.getSite().getId();
        String slug = pageDTO.getSlug();
        userUtils.getUserById(userId);
        return pageRepository.findBySiteIdAndSlug(siteId, slug)
                .map(pageEntity -> modelMapper.map(pageEntity, PageDTO.class))
                .orElseThrow(() -> new RuntimeException("Page not found"));
    }

    @Override
    public Map<String, String> deletePage(PageDTO pageDTO) {
        Long userId = pageDTO.getSite().getUser().getId();
        Long pageId = pageDTO.getId();
        userUtils.getUserById(userId);
        PageEntity page = pageRepository.findById(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found"));
        pageRepository.delete(page);
        return Map.of("message", "Page deleted successfully");
    }
}
