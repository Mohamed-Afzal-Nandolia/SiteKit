package com.sitekit.templateModule.service;

import com.sitekit.templateModule.model.SiteDTO;

import java.util.List;
import java.util.Map;

public interface SiteService {

    public List<SiteDTO> getAllSite(SiteDTO siteDTO);

    public SiteDTO getSiteById(SiteDTO siteDTO);

    public Map<String, String> createSite(SiteDTO siteDTO);

    public Map<String, String> deleteSite(SiteDTO siteDTO);

    public Map<String, String> updateSiteStatus(SiteDTO siteDTO);

}
