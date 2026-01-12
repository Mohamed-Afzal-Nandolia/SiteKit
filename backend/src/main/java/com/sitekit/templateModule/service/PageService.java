package com.sitekit.templateModule.service;

import com.sitekit.templateModule.model.PageDTO;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface PageService {

    public PageDTO createPage(PageDTO pageDTO);

    public List<PageDTO> getPagesBySite(PageDTO pageDTO);

    public PageDTO getPageBySlug(PageDTO pageDTO);

    public Map<String, String> deletePage(PageDTO pageDTO);

}
