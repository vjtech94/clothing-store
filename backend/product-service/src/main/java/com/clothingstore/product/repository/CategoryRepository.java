package com.clothingstore.product.repository;

import com.clothingstore.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findByIsActiveTrueOrderBySortOrder();
    Optional<Category> findBySlug(String slug);
}
