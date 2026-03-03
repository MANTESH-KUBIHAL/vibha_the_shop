package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.OrderDto;
import com.ecommerce.backend.dto.UserDto;
import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.model.OrderStatus;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.CategoryRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public AdminController(UserRepository userRepository, OrderRepository orderRepository,
            ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping("/users/count")
    public ResponseEntity<Long> usersCount() {
        return ResponseEntity.ok(userRepository.count());
    }

    @GetMapping("/orders/count")
    public ResponseEntity<Long> ordersCount() {
        return ResponseEntity.ok(orderRepository.count());
    }

    @GetMapping("/products/count")
    public ResponseEntity<Long> productsCount() {
        return ResponseEntity.ok(productRepository.count());
    }

    @GetMapping("/categories/count")
    public ResponseEntity<Long> categoriesCount() {
        return ResponseEntity.ok(categoryRepository.count());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> users() {
        List<UserDto> list = userRepository.findAll().stream()
                .map(u -> new UserDto(u.getId(), u.getFullName(), u.getEmail(), u.getAddress(), u.getRole()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderDto>> orders() {
        List<OrderDto> list = orderRepository.findAll().stream()
                .map(o -> new OrderDto(o.getId(),
                        o.getUser() != null ? o.getUser().getFullName() : null,
                        o.getUser() != null ? o.getUser().getEmail() : null,
                        o.getPaymentType(),
                        o.getStatus(),
                        o.getTotalAmount()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        OrderStatus s = OrderStatus.valueOf(status);
        Order o = orderRepository.findById(id).orElseThrow();
        o.setStatus(s);
        o = orderRepository.save(o);
        OrderDto dto = new OrderDto(o.getId(),
                o.getUser() != null ? o.getUser().getFullName() : null,
                o.getUser() != null ? o.getUser().getEmail() : null,
                o.getPaymentType(),
                o.getStatus(),
                o.getTotalAmount());
        return ResponseEntity.ok(dto);
    }
}
