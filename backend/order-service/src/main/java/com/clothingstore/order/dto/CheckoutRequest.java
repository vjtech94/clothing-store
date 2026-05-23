package com.clothingstore.order.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CheckoutRequest {
    @NotNull
    private ShippingAddress shippingAddress;

    @NotNull
    private List<Item> items;

    @Data
    public static class ShippingAddress {
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
    }

    @Data
    public static class Item {
        private UUID productId;
        private UUID variantId;
        private String productName;
        private String size;
        private String color;
        private int quantity;
        private BigDecimal unitPrice;
        private String imageUrl;
    }
}
