package com.ecommerce.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String fullName;
    @Email
    @NotBlank
    private String email;
    @NotBlank
    private String phone;
    @Size(min = 6)
    @NotBlank
    private String password;
    @Size(min = 6)
    @NotBlank
    private String confirmPassword;
    @NotBlank
    private String address;
}
