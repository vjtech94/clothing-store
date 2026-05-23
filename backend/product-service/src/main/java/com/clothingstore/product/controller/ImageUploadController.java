package com.clothingstore.product.controller;

import com.clothingstore.common.dto.ApiResponse;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class ImageUploadController {

    private final Cloudinary cloudinary;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestHeader("X-User-Role") String role,
            @RequestParam("file") MultipartFile file) throws IOException {
        if (!"ADMIN".equals(role)) {
            throw new com.clothingstore.common.exception.BaseException("Admin access required", org.springframework.http.HttpStatus.FORBIDDEN);
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
        }

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "clothing-store",
                        "resource_type", "image"
                ));

        Map<String, String> response = Map.of(
                "imageUrl", (String) uploadResult.get("secure_url"),
                "publicId", (String) uploadResult.get("public_id")
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }
}
