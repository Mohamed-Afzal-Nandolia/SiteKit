package com.sitekit.utilityModule.UtilClass;

public class SiteUtils {

    private static final String DOMAIN_REGEX =
            "^(?=.{1,253}$)" +                    // total length
                    "(?!-)" +                             // cannot start with -
                    "(?:[A-Za-z0-9]" +                    // label starts with letter or digit
                    "(?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\\.)+" +
                    "[A-Za-z]{2,63}$";                    // TLD

    public static boolean isValidDomain(String domain) {
        if (domain == null) {
            return false;
        }
        return domain.matches(DOMAIN_REGEX);
    }


}
