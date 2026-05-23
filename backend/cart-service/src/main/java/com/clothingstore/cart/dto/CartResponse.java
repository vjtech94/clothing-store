package com.clothingstore.cart.dto;

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
public class CartResponse {
    private String id;
    private String userId;
    private List<CartItemDTO> items;
    private int totalItems;
    private BigDecimal subtotal;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemDTO {
        private String id;
        private String productId;
        private String variantId;
        private int quantity;
        private BigDecimal unitPrice;
        private String addedAt;
    }
}
