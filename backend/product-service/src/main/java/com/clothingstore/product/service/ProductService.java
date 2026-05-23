package com.clothingstore.product.service;

import com.clothingstore.common.dto.PagedResponse;
import com.clothingstore.common.exception.ResourceNotFoundException;
import com.clothingstore.product.dto.*;
import com.clothingstore.product.entity.Category;
import com.clothingstore.product.entity.Product;
import com.clothingstore.product.entity.ProductImage;
import com.clothingstore.product.entity.ProductVariant;
import com.clothingstore.product.repository.CategoryRepository;
import com.clothingstore.product.repository.ProductImageRepository;
import com.clothingstore.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;

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

    // ========== ADMIN CRUD METHODS ==========

    @Transactional
    public ProductDTO createProduct(CreateProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .salePrice(request.getSalePrice())
                .categoryId(request.getCategoryId() != null ? UUID.fromString(request.getCategoryId()) : null)
                .brand(request.getBrand())
                .material(request.getMaterial())
                .gender(request.getGender())
                .build();

        if (request.getVariants() != null) {
            for (CreateProductRequest.VariantRequest vr : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .size(vr.getSize())
                        .color(vr.getColor())
                        .colorHex(vr.getColorHex())
                        .sku(vr.getSku())
                        .stockQuantity(vr.getStockQuantity())
                        .priceOverride(vr.getPriceOverride())
                        .build();
                product.getVariants().add(variant);
            }
        }

        if (request.getImageUrls() != null) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                ProductImage image = ProductImage.builder()
                        .product(product)
                        .imageUrl(request.getImageUrls().get(i))
                        .sortOrder(i)
                        .isPrimary(i == 0)
                        .build();
                product.getImages().add(image);
            }
        }

        Product saved = productRepository.save(product);
        return mapToDTO(saved);
    }

    @Transactional
    @CacheEvict(value = "products", key = "#id")
    public ProductDTO updateProduct(UUID id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getSlug() != null) product.setSlug(request.getSlug());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getBasePrice() != null) product.setBasePrice(request.getBasePrice());
        if (request.getSalePrice() != null) product.setSalePrice(request.getSalePrice());
        if (request.getCategoryId() != null) product.setCategoryId(UUID.fromString(request.getCategoryId()));
        if (request.getBrand() != null) product.setBrand(request.getBrand());
        if (request.getMaterial() != null) product.setMaterial(request.getMaterial());
        if (request.getGender() != null) product.setGender(request.getGender());
        if (request.getIsActive() != null) product.setIsActive(request.getIsActive());

        if (request.getVariants() != null) {
            product.getVariants().clear();
            for (CreateProductRequest.VariantRequest vr : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .size(vr.getSize())
                        .color(vr.getColor())
                        .colorHex(vr.getColorHex())
                        .sku(vr.getSku())
                        .stockQuantity(vr.getStockQuantity())
                        .priceOverride(vr.getPriceOverride())
                        .build();
                product.getVariants().add(variant);
            }
        }

        Product saved = productRepository.save(product);
        return mapToDTO(saved);
    }

    @Transactional
    @CacheEvict(value = "products", key = "#id")
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setIsActive(false);
        productRepository.save(product);
    }

    @Transactional
    public ProductDTO addProductImage(UUID productId, String imageUrl, String altText, boolean isPrimary) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (isPrimary) {
            product.getImages().forEach(img -> img.setIsPrimary(false));
        }

        ProductImage image = ProductImage.builder()
                .product(product)
                .imageUrl(imageUrl)
                .altText(altText)
                .sortOrder(product.getImages().size())
                .isPrimary(isPrimary)
                .build();
        product.getImages().add(image);

        Product saved = productRepository.save(product);
        return mapToDTO(saved);
    }

    @Transactional
    public void deleteProductImage(UUID imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductImage", "id", imageId));
        productImageRepository.delete(image);
    }

    @Transactional
    public CategoryDTO createCategory(CreateCategoryRequest request) {
        Category category = Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .parentId(request.getParentId() != null ? UUID.fromString(request.getParentId()) : null)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();

        Category saved = categoryRepository.save(category);
        return mapCategoryToDTO(saved);
    }

    @Transactional
    public CategoryDTO updateCategory(UUID id, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (request.getName() != null) category.setName(request.getName());
        if (request.getSlug() != null) category.setSlug(request.getSlug());
        if (request.getDescription() != null) category.setDescription(request.getDescription());
        if (request.getImageUrl() != null) category.setImageUrl(request.getImageUrl());
        if (request.getParentId() != null) category.setParentId(UUID.fromString(request.getParentId()));
        if (request.getSortOrder() != null) category.setSortOrder(request.getSortOrder());

        Category saved = categoryRepository.save(category);
        return mapCategoryToDTO(saved);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        category.setIsActive(false);
        categoryRepository.save(category);
    }

    // ========== PRIVATE HELPERS ==========

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
