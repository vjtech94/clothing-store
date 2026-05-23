package com.clothingstore.cart.service;

import com.clothingstore.cart.dto.CartItemRequest;
import com.clothingstore.cart.dto.CartResponse;
import com.clothingstore.cart.entity.Cart;
import com.clothingstore.cart.entity.CartItem;
import com.clothingstore.cart.repository.CartRepository;
import com.clothingstore.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;

    public CartResponse getCart(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToResponse(cart);
    }

    @Transactional
    public CartResponse addItem(UUID userId, CartItemRequest request) {
        Cart cart = getOrCreateCart(userId);

        cart.getItems().stream()
                .filter(i -> i.getVariantId().equals(request.getVariantId()))
                .findFirst()
                .ifPresentOrElse(
                        existing -> existing.setQuantity(existing.getQuantity() + request.getQuantity()),
                        () -> {
                            CartItem item = CartItem.builder()
                                    .cart(cart)
                                    .productId(request.getProductId())
                                    .variantId(request.getVariantId())
                                    .quantity(request.getQuantity())
                                    .unitPrice(request.getUnitPrice())
                                    .build();
                            cart.getItems().add(item);
                        }
                );

        cartRepository.save(cart);
        return mapToResponse(cart);
    }

    @Transactional
    public CartResponse updateItemQuantity(UUID userId, UUID itemId, int quantity) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
        }

        cartRepository.save(cart);
        return mapToResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(UUID userId, UUID itemId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().removeIf(i -> i.getId().equals(itemId));
        cartRepository.save(cart);
        return mapToResponse(cart);
    }

    @Transactional
    public void clearCart(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(UUID userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(Cart.builder().userId(userId).build()));
    }

    private CartResponse mapToResponse(Cart cart) {
        var items = cart.getItems().stream()
                .map(i -> CartResponse.CartItemDTO.builder()
                        .id(i.getId().toString())
                        .productId(i.getProductId().toString())
                        .variantId(i.getVariantId().toString())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .addedAt(i.getAddedAt() != null ? i.getAddedAt().toString() : null)
                        .build())
                .collect(Collectors.toList());

        BigDecimal subtotal = cart.getItems().stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = cart.getItems().stream().mapToInt(CartItem::getQuantity).sum();

        return CartResponse.builder()
                .id(cart.getId().toString())
                .userId(cart.getUserId().toString())
                .items(items)
                .totalItems(totalItems)
                .subtotal(subtotal)
                .build();
    }
}
