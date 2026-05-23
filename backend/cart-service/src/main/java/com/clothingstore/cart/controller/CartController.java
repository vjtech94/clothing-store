package com.clothingstore.cart.controller;

import com.clothingstore.cart.dto.CartItemRequest;
import com.clothingstore.cart.dto.CartResponse;
import com.clothingstore.cart.service.CartService;
import com.clothingstore.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@RequestHeader("X-User-Id") String userId) {
        CartResponse cart = cartService.getCart(UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody CartItemRequest request) {
        CartResponse cart = cartService.addItem(UUID.fromString(userId), request);
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateQuantity(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID itemId,
            @RequestBody CartItemRequest request) {
        CartResponse cart = cartService.updateItemQuantity(UUID.fromString(userId), itemId, request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID itemId) {
        CartResponse cart = cartService.removeItem(UUID.fromString(userId), itemId);
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(@RequestHeader("X-User-Id") String userId) {
        cartService.clearCart(UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}
