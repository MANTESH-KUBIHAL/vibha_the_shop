package com.ecommerce.backend.controller;

import com.ecommerce.backend.model.CartItem;
import com.ecommerce.backend.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<List<CartItem>> list(Authentication auth) {
        return ResponseEntity.ok(cartService.list(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<CartItem> add(Authentication auth,
                                        @RequestParam Long productId,
                                        @RequestParam(defaultValue = "1") int quantity) {
        return ResponseEntity.ok(cartService.add(auth.getName(), productId, quantity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CartItem> update(@PathVariable Long id, @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.updateQuantity(id, quantity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        cartService.remove(id);
        return ResponseEntity.noContent().build();
    }
}
