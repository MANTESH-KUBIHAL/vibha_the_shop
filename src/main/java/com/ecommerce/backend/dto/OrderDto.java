package com.ecommerce.backend.dto;

import com.ecommerce.backend.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OrderDto {
    private Long id;
    private String customerName;
    private String customerEmail;
    private String paymentType;
    private OrderStatus status;
    private Double totalAmount;
}
