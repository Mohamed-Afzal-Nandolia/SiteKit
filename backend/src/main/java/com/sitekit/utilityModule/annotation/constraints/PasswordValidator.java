package com.sitekit.utilityModule.annotation.constraints;

import com.sitekit.utilityModule.annotation.ValidPassword;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    // Regex explanation:
    // (?=.*[a-z])       -> at least one lowercase letter
    // (?=.*[A-Z])       -> at least one uppercase letter
    // (?=.*\\d)         -> at least one digit
    // (?=.*[@$!%*?&])   -> at least one special character
    // [A-Za-z\\d@$!%*?&]{8,} -> minimum 8 characters
    private static final String PASSWORD_REGEX =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile(PASSWORD_REGEX);

    @Override
    public boolean isValid(String password, ConstraintValidatorContext constraintValidatorContext) {
        if (password == null) {
            return false;
        }
        return PASSWORD_PATTERN.matcher(password).matches();
    }
}
