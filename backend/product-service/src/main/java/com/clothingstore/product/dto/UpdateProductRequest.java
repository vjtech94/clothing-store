package com.clothingstore.product.dto;

import jakarta.validation.Valid;
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
public class UpdateProductRequest {

    private String name;
    private String slug;
    private String description;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private String categoryId;
    private String brand;
    private String material;
    private String gender;
    private Boolean isActive;

    @Valid
    private List<CreateProductRequest.VariantRequest> variants;
}
