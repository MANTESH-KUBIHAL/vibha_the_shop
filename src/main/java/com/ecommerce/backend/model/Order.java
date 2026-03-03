package com.ecommerce.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Prevent recursion with User
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({ "orders", "password" })
    private User user;

    @Column(name = "order_date", nullable = false)
    @Builder.Default
    private Instant orderDate = Instant.now(); // builder.defult added to solve warning

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "payment_type", nullable = false)
    private String paymentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING; // builder.defult added to solve warning

    // Prevent recursion with OrderItem
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("order")
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>(); // builder.defult added to solve warning
}