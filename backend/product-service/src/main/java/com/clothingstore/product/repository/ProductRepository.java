package com.clothingstore.product.repository;

import com.clothingstore.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    Page<Product> findByIsActiveTrue(Pageable pageable);

    Page<Product> findByCategoryIdAndIsActiveTrue(UUID categoryId, Pageable pageable);

    @Query(value = "SELECT * FROM product_schema.products WHERE is_active = true AND search_vector @@ plainto_tsquery('english', :query)",
            nativeQuery = true)
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);
}
