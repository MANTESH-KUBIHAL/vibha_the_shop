package com.ecommerce.backend.controller;

import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.Category;
import com.ecommerce.backend.repository.CategoryRepository;
import com.ecommerce.backend.service.ProductService;
import com.ecommerce.backend.service.FileStorageService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {
    private final ProductService productService;
    private final FileStorageService fileStorageService;
    private final CategoryRepository categoryRepository;

    public ProductController(ProductService productService, FileStorageService fileStorageService, CategoryRepository categoryRepository) {
        this.productService = productService;
        this.fileStorageService = fileStorageService;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping("/public/products")
    public ResponseEntity<List<Product>> list(@RequestParam(required = false) String search,
                                              @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(productService.list(search, categoryId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/products")
    public ResponseEntity<Product> create(@RequestBody Product p, @RequestParam Long categoryId) {
        return ResponseEntity.ok(productService.create(p, categoryId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(path = "/admin/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> createWithImage(
            @RequestParam String name,
            @RequestParam Double price,
            @RequestParam Integer ratings,
            @RequestParam String description,
            @RequestParam Integer stockAvailable,
            @RequestParam Long categoryId,
            @RequestParam(required = false) MultipartFile image
    ) throws Exception {
        Product p = Product.builder()
                .name(name)
                .price(price)
                .ratings(ratings)
                .description(description)
                .stockAvailable(stockAvailable)
                .build();
        if (image != null && !image.isEmpty()) {
            String stored = fileStorageService.store(image.getBytes(), image.getOriginalFilename());
            p.setImageUrl("/uploads/" + stored);
        }
        return ResponseEntity.ok(productService.create(p, categoryId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/products/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product updates) {
        return ResponseEntity.ok(productService.update(id, updates));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(path = "/admin/products/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> updateWithImage(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam Double price,
            @RequestParam Integer ratings,
            @RequestParam String description,
            @RequestParam Integer stockAvailable,
            @RequestParam Long categoryId,
            @RequestParam(required = false) MultipartFile image
    ) throws Exception {
        Product updates = Product.builder()
                .name(name)
                .price(price)
                .ratings(ratings)
                .description(description)
                .stockAvailable(stockAvailable)
                .build();
        Category c = categoryRepository.findById(categoryId).orElseThrow();
        updates.setCategory(c);
        if (image != null && !image.isEmpty()) {
            String stored = fileStorageService.store(image.getBytes(), image.getOriginalFilename());
            updates.setImageUrl("/uploads/" + stored);
        }
        return ResponseEntity.ok(productService.update(id, updates));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/products/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
