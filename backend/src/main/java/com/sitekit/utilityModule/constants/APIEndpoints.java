package com.sitekit.utilityModule.constants;

public interface APIEndpoints {

    // Auth
    String BASE_VERSION = "/api/v1";
    String AUTH = "/auth";
    String AUTH_LOGIN = "/login";
    String AUTH_LOGOUT = "/logout";
    String AUTH_REFRESH = "/refresh";

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

}
