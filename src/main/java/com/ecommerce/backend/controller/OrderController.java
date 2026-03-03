package com.ecommerce.backend.controller;

import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/me")
    public ResponseEntity<List<Order>> myOrders(Authentication auth) {
        return ResponseEntity.ok(orderService.myOrders(auth.getName()));
    }

    @PostMapping("/checkout")
    public ResponseEntity<Order> checkout(Authentication auth, @RequestParam String paymentType) {
        return ResponseEntity.ok(orderService.buyNow(auth.getName(), paymentType));
    }
}
