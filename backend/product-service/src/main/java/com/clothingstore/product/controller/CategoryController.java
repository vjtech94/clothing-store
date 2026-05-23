package com.clothingstore.product.controller;

import com.clothingstore.common.dto.ApiResponse;
import com.clothingstore.common.dto.PagedResponse;
import com.clothingstore.product.dto.CategoryDTO;
import com.clothingstore.product.dto.ProductDTO;
import com.clothingstore.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getCategories() {
        List<CategoryDTO> categories = productService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{id}/products")
    public ResponseEntity<ApiResponse<PagedResponse<ProductDTO>>> getProductsByCategory(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<ProductDTO> products = productService.getProductsByCategory(id, page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }
}
