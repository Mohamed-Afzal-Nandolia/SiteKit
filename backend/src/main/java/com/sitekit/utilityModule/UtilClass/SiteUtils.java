package com.sitekit.utilityModule.UtilClass;

public class SiteUtils {

    // Allows: alphanumeric, hyphens, underscores, dots
    // Cannot start or end with special chars
    // Length: 1-63 characters
    private static final String DOMAIN_REGEX = "^(?![-_.])(?!.*[-_.]$)[A-Za-z0-9][A-Za-z0-9._-]{0,61}[A-Za-z0-9]$";

    public static boolean isValidDomain(String domain) {
        if (domain == null || domain.isEmpty()) {
            return false;
        }
        // Allow single character domains (just alphanumeric)
        if (domain.length() == 1) {
            return Character.isLetterOrDigit(domain.charAt(0));
        }
        return domain.matches(DOMAIN_REGEX);
    }

}
