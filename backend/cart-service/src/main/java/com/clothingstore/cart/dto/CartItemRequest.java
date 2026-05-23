package com.clothingstore.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CartItemRequest {
    @NotNull
    private UUID productId;

    @NotNull
    private UUID variantId;

    @Min(1)
    private int quantity;

    @NotNull
    private BigDecimal unitPrice;
}
