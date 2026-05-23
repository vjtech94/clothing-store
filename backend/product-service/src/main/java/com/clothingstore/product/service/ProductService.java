package com.clothingstore.product.service;

import com.clothingstore.common.dto.PagedResponse;
import com.clothingstore.common.exception.ResourceNotFoundException;
import com.clothingstore.product.dto.CategoryDTO;
import com.clothingstore.product.dto.ProductDTO;
import com.clothingstore.product.entity.Category;
import com.clothingstore.product.entity.Product;
import com.clothingstore.product.repository.CategoryRepository;
import com.clothingstore.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public PagedResponse<ProductDTO> getProducts(int page, int size, UUID categoryId,
            BigDecimal minPrice, BigDecimal maxPrice, List<String> sizes,
            List<String> colors, String gender, String brand, String sort) {

        Sort sorting = switch (sort) {
            case "PRICE_ASC" -> Sort.by("basePrice").ascending();
            case "PRICE_DESC" -> Sort.by("basePrice").descending();
            case "POPULAR" -> Sort.by("createdAt").descending();
            default -> Sort.by("createdAt").descending();
        };

        PageRequest pageable = PageRequest.of(page, size, sorting);
        Page<Product> products;

        if (categoryId != null) {
            products = productRepository.findByCategoryIdAndIsActiveTrue(categoryId, pageable);
        } else {
            products = productRepository.findByIsActiveTrue(pageable);
        }

        return buildPagedResponse(products);
    }

    @Cacheable(value = "products", key = "#id")
    public ProductDTO getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToDTO(product);
    }

    public PagedResponse<ProductDTO> searchProducts(String query, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.searchProducts(query, pageable);
        return buildPagedResponse(products);
    }

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findByIsActiveTrueOrderBySortOrder().stream()
                .map(this::mapCategoryToDTO)
                .collect(Collectors.toList());
    }

    public PagedResponse<ProductDTO> getProductsByCategory(UUID categoryId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> products = productRepository.findByCategoryIdAndIsActiveTrue(categoryId, pageable);
        return buildPagedResponse(products);
    }

    private PagedResponse<ProductDTO> buildPagedResponse(Page<Product> products) {
        List<ProductDTO> content = products.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return PagedResponse.<ProductDTO>builder()
                .content(content)
                .page(products.getNumber())
                .size(products.getSize())
                .totalElements(products.getTotalElements())
                .totalPages(products.getTotalPages())
                .last(products.isLast())
                .build();
    }

    private ProductDTO mapToDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId().toString())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .salePrice(product.getSalePrice())
                .brand(product.getBrand())
                .material(product.getMaterial())
                .gender(product.getGender())
                .images(product.getImages().stream()
                        .map(img -> ProductDTO.ImageDTO.builder()
                                .id(img.getId().toString())
                                .imageUrl(img.getImageUrl())
                                .altText(img.getAltText())
                                .sortOrder(img.getSortOrder())
                                .isPrimary(img.getIsPrimary())
                                .build())
                        .collect(Collectors.toList()))
                .variants(product.getVariants().stream()
                        .map(v -> ProductDTO.VariantDTO.builder()
                                .id(v.getId().toString())
                                .size(v.getSize())
                                .color(v.getColor())
                                .colorHex(v.getColorHex())
                                .sku(v.getSku())
                                .stockQuantity(v.getStockQuantity())
                                .priceOverride(v.getPriceOverride())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    private CategoryDTO mapCategoryToDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId().toString())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .build();
    }
}
