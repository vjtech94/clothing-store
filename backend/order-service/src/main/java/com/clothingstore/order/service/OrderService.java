package com.clothingstore.order.service;

import com.clothingstore.common.dto.PagedResponse;
import com.clothingstore.common.exception.BaseException;
import com.clothingstore.common.exception.ResourceNotFoundException;
import com.clothingstore.order.dto.CheckoutRequest;
import com.clothingstore.order.dto.OrderResponse;
import com.clothingstore.order.dto.PaymentIntentResponse;
import com.clothingstore.order.entity.Order;
import com.clothingstore.order.entity.OrderItem;
import com.clothingstore.order.repository.OrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final StripePaymentService stripePaymentService;
    private final ObjectMapper objectMapper;
    private final AtomicInteger orderCounter = new AtomicInteger(1);

    @Transactional
    public PaymentIntentResponse checkout(UUID userId, CheckoutRequest request) {
        BigDecimal subtotal = request.getItems().stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal total = subtotal;
        String orderNumber = generateOrderNumber();

        String addressJson;
        try {
            addressJson = objectMapper.writeValueAsString(request.getShippingAddress());
        } catch (Exception e) {
            throw new BaseException("Failed to process address", HttpStatus.BAD_REQUEST);
        }

        Order order = Order.builder()
                .userId(userId)
                .orderNumber(orderNumber)
                .subtotal(subtotal)
                .total(total)
                .shippingAddress(addressJson)
                .build();

        request.getItems().forEach(item -> {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(item.getProductId())
                    .variantId(item.getVariantId())
                    .productName(item.getProductName())
                    .size(item.getSize())
                    .color(item.getColor())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .imageUrl(item.getImageUrl())
                    .build();
            order.getItems().add(orderItem);
        });

        PaymentIntentResponse paymentIntent = stripePaymentService.createPaymentIntent(
                total.longValue() * 100, "inr", order.getId() != null ? order.getId().toString() : orderNumber);

        order.setPaymentIntentId(paymentIntent.getPaymentIntentId());
        orderRepository.save(order);

        return paymentIntent;
    }

    @Transactional
    public void handlePaymentSuccess(String paymentIntentId) {
        Order order = orderRepository.findByPaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "paymentIntentId", paymentIntentId));
        order.setStatus("PAID");
        order.setPaidAt(LocalDateTime.now());
        orderRepository.save(order);
    }

    public PagedResponse<OrderResponse> getOrders(UUID userId, int page, int size) {
        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
        var content = orders.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());
        return PagedResponse.<OrderResponse>builder()
                .content(content)
                .page(orders.getNumber())
                .size(orders.getSize())
                .totalElements(orders.getTotalElements())
                .totalPages(orders.getTotalPages())
                .last(orders.isLast())
                .build();
    }

    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return mapToResponse(order);
    }

    private String generateOrderNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return String.format("ORD-%s-%03d", date, orderCounter.getAndIncrement());
    }

    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId().toString())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .shippingFee(order.getShippingFee())
                .tax(order.getTax())
                .total(order.getTotal())
                .paymentMethod(order.getPaymentMethod())
                .createdAt(order.getCreatedAt() != null ? order.getCreatedAt().toString() : null)
                .items(order.getItems().stream()
                        .map(i -> OrderResponse.OrderItemDTO.builder()
                                .id(i.getId().toString())
                                .productId(i.getProductId().toString())
                                .variantId(i.getVariantId().toString())
                                .productName(i.getProductName())
                                .size(i.getSize())
                                .color(i.getColor())
                                .quantity(i.getQuantity())
                                .unitPrice(i.getUnitPrice())
                                .imageUrl(i.getImageUrl())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
