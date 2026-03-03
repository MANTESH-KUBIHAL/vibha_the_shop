package com.ecommerce.backend.dto;

import com.ecommerce.backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String fullName;
    private String email;
    private String address;
    private Role role;
}
