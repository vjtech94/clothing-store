package com.clothingstore.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private String id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private String brand;
    private String material;
    private String gender;
    private String categoryName;
    private List<ImageDTO> images;
    private List<VariantDTO> variants;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageDTO {
        private String id;
        private String imageUrl;
        private String altText;
        private int sortOrder;
        private boolean isPrimary;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VariantDTO {
        private String id;
        private String size;
        private String color;
        private String colorHex;
        private String sku;
        private int stockQuantity;
        private BigDecimal priceOverride;
    }
}
