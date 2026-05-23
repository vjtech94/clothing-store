package com.clothingstore.product.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
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
public class CreateProductRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String slug;

    private String description;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal basePrice;

    @DecimalMin("0.01")
    private BigDecimal salePrice;

    private String categoryId;

    private String brand;
    private String material;
    private String gender;

    @Valid
    private List<VariantRequest> variants;

    private List<String> imageUrls;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VariantRequest {
        @NotBlank
        private String size;
        @NotBlank
        private String color;
        private String colorHex;
        @NotBlank
        private String sku;
        @Min(0)
        private int stockQuantity;
        private BigDecimal priceOverride;
    }
}
