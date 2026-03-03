package com.ecommerce.backend.service;

import com.ecommerce.backend.model.Category;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.repository.CategoryRepository;
import com.ecommerce.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Product> list(String search, Long categoryId) {
        if (search != null && !search.isBlank()) {
            return productRepository.findByNameContainingIgnoreCase(search);
        }
        if (categoryId != null) {
            Category c = categoryRepository.findById(categoryId).orElseThrow();
            return productRepository.findByCategory(c);
        }
        return productRepository.findAll();
    }

    @Transactional
    public Product create(Product p, Long categoryId) {
        Category c = categoryRepository.findById(categoryId).orElseThrow();
        p.setCategory(c);
        return productRepository.save(p);
    }

    @Transactional
    public Product update(Long id, Product updates) {
        Product p = productRepository.findById(id).orElseThrow();
        p.setName(updates.getName());
        p.setPrice(updates.getPrice());
        p.setRatings(updates.getRatings());
        p.setDescription(updates.getDescription());
        p.setStockAvailable(updates.getStockAvailable());
        p.setImageUrl(updates.getImageUrl());
        if (updates.getCategory() != null) {
            p.setCategory(updates.getCategory());
        }
        return productRepository.save(p);
    }

    public void delete(Long id) {
        productRepository.deleteById(id);
    }
}
