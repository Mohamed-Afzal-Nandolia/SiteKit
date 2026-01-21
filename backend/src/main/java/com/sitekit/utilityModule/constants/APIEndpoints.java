package com.sitekit.utilityModule.constants;

public interface APIEndpoints {

    // Auth
    String BASE_VERSION = "/api/v1";
    String AUTH = "/auth";
    String AUTH_LOGIN = "/login";
    String AUTH_LOGOUT = "/logout";
    String AUTH_REFRESH = "/refresh";
    String PING = "/ping";

    // User
    String GET_ALL_USERS = "/get-all-users";
    String GET_USER_BY_ID = "/get-user";
    String CREATE_USER = "/create-user";
    String DELETE_USER = "/delete-user";

    // Site
    String CREATE_SITE = "/create-site";
    String UPDATE_SITE = "/update-site";
    String DELETE_SITE = "/delete-site";
    String GET_ALL_SITE = "/get-all-site";
    String GET_SITE_BY_ID = "/get-site";
    String UPDATE_SITE_STATUS = "/update-site-status";
    String UPDATE_SITE_NAME = "/update-site-name";
    String UPDATE_SITE_DOMAIN = "/update-site-domain";
    String GET_ALL_SITE_TEMPLATES = "/get-all-site-templates";
    String GET_ALL_TEMPLATES = "/get-all-templates";

    // Page
    String CREATE_PAGE = "/create-page";
    String GET_PAGE_BY_SITE_ID = "/get-page";
    String GET_PAGE_BY_SLUG = "/get-page/slug";
    String DELETE_PAGE = "/delete-page";

    // Page Section
    String ADD_SECTION = "/add-section";
    String GET_SECTIONS = "/get-sections";
    String UPDATE_SECTION = "/update-section";
    String DELETE_SECTION = "/delete-section";
    String REORDER_SECTIONS = "/reorder-sections";

    // Asset moule
    String CREATE_ASSET="/create-asset";
    String GET_ASSET="/get-asset";
    String GET_ALL_ASSETS="/get-all-assets";
    String GET_ASSETS_BY_SITE="/get-assets-by-site";
    String GET_ASSETS_BY_TYPE="/get-assets-by-type";
    String UPDATE_ASSET="/update-asset";
    String DELETE_ASSET="/delete-asset";



}
