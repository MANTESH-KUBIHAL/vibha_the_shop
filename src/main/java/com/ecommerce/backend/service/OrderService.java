package com.ecommerce.backend.service;

import com.ecommerce.backend.model.*;
import com.ecommerce.backend.repository.CartItemRepository;
import com.ecommerce.backend.repository.OrderItemRepository;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.UserRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final JavaMailSender mailSender;

    public OrderService(UserRepository userRepository,
                        CartItemRepository cartItemRepository,
                        OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.mailSender = mailSender;
    }

    public List<Order> myOrders(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return orderRepository.findByUser(user);
    }

    @Transactional
    public Order buyNow(String email, String paymentType) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }
        double total = 0;
        Order order = Order.builder()
                .user(user)
                .paymentType(paymentType)
                .status(OrderStatus.PENDING)
                .totalAmount(0.0)
                .build();
        order = orderRepository.save(order);

        for (CartItem ci : cartItems) {
            Product p = ci.getProduct();
            int qty = ci.getQuantity();
            if (p.getStockAvailable() < qty) {
                throw new IllegalStateException("Insufficient stock: " + p.getName());
            }
            p.setStockAvailable(p.getStockAvailable() - qty);
            double price = p.getPrice() * qty;
            total += price;

            OrderItem oi = OrderItem.builder()
                    .order(order)
                    .product(p)
                    .quantity(qty)
                    .price(p.getPrice())
                    .build();
            orderItemRepository.save(oi);
        }

        order.setTotalAmount(total);
        orderRepository.save(order);

        cartItemRepository.deleteByUser(user);

        notifyManagerOrder(user, order);

        return order;
    }

    private void notifyManagerOrder(User user, Order order) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo("manager@example.com");
            message.setSubject("New order placed");
            message.setText("Customer: " + user.getFullName() + "\nEmail: " + user.getEmail() +
                    "\nAddress: " + user.getAddress() + "\nPayment: " + order.getPaymentType() +
                    "\nTotal: " + order.getTotalAmount());
            mailSender.send(message);
        } catch (Exception ignored) {
        }
    }
}
