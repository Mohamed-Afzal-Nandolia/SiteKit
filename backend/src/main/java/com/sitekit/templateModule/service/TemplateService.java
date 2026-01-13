package com.sitekit.templateModule.service;

import com.sitekit.templateModule.model.SiteDTO;
import com.sitekit.templateModule.model.TemplateDTO;

import java.util.List;

public interface TemplateService {

    public List<TemplateDTO> getAllSiteTemplates();

    public List<TemplateDTO> getAllTemplates();

}
