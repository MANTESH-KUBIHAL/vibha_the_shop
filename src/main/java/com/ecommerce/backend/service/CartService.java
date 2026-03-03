package com.ecommerce.backend.service;

import com.ecommerce.backend.model.CartItem;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.CartItemRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CartService {
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartItemRepository cartItemRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public List<CartItem> list(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return cartItemRepository.findByUser(user);
    }

    @Transactional
    public CartItem add(String email, Long productId, int quantity) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Product product = productRepository.findById(productId).orElseThrow();
        if (product.getStockAvailable() <= 0) {
            throw new IllegalStateException("Out of stock");
        }
        CartItem item = CartItem.builder()
                .user(user)
                .product(product)
                .quantity(quantity)
                .build();
        return cartItemRepository.save(item);
    }

    @Transactional
    public CartItem updateQuantity(Long id, int quantity) {
        CartItem item = cartItemRepository.findById(id).orElseThrow();
        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    public void remove(Long id) {
        cartItemRepository.deleteById(id);
    }
}
