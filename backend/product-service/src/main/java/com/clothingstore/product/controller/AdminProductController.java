package com.clothingstore.product.controller;

import com.clothingstore.common.dto.ApiResponse;
import com.clothingstore.product.dto.*;
import com.clothingstore.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductDTO>> createProduct(
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody CreateProductRequest request) {
        assertAdmin(role);
        ProductDTO product = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(product));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> updateProduct(
            @RequestHeader("X-User-Role") String role,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductRequest request) {
        assertAdmin(role);
        ProductDTO product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @RequestHeader("X-User-Role") String role,
            @PathVariable UUID id) {
        assertAdmin(role);
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/products/{id}/images")
    public ResponseEntity<ApiResponse<ProductDTO>> addProductImage(
            @RequestHeader("X-User-Role") String role,
            @PathVariable UUID id,
            @RequestParam String imageUrl,
            @RequestParam(required = false) String altText,
            @RequestParam(defaultValue = "false") boolean isPrimary) {
        assertAdmin(role);
        ProductDTO product = productService.addProductImage(id, imageUrl, altText, isPrimary);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(product));
    }

    @DeleteMapping("/products/{id}/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteProductImage(
            @RequestHeader("X-User-Role") String role,
            @PathVariable UUID id,
            @PathVariable UUID imageId) {
        assertAdmin(role);
        productService.deleteProductImage(imageId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryDTO>> createCategory(
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody CreateCategoryRequest request) {
        assertAdmin(role);
        CategoryDTO category = productService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryDTO>> updateCategory(
            @RequestHeader("X-User-Role") String role,
            @PathVariable UUID id,
            @Valid @RequestBody CreateCategoryRequest request) {
        assertAdmin(role);
        CategoryDTO category = productService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @RequestHeader("X-User-Role") String role,
            @PathVariable UUID id) {
        assertAdmin(role);
        productService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private void assertAdmin(String role) {
        if (!"ADMIN".equals(role)) {
            throw new com.clothingstore.common.exception.BaseException("Admin access required", org.springframework.http.HttpStatus.FORBIDDEN);
        }
    }
}
