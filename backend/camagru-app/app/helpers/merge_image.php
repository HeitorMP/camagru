<?php

    function getOverlay($overlay_name) {
        // Define the path to the overlays directory
        $overlays_dir = BASE_PATH . '/config/overlays/';

        // Construct the full path to the overlay image
        $overlay_path = $overlays_dir . $overlay_name . '.png';

        // Check if the overlay image exists
        if (!file_exists($overlay_path)) {
            return false;
        }

        return $overlay_path;
    }

    function merge_images($base_image_path, $overlay_name, $output_path) {
        // Load the base image
        $base_image = imagecreatefrompng($base_image_path);
        if (!$base_image) return false;
    
        // Load the overlay image
        $overlay_path = getOverlay($overlay_name);
        $original_overlay = imagecreatefrompng($overlay_path);
        if (!$original_overlay) {
            imagedestroy($base_image);
            return false;
        }
    
        // Get dimensions of base image
        $base_width = imagesx($base_image);
        $base_height = imagesy($base_image);
    
        // Create a resized version of the overlay with same dimensions as base
        $resized_overlay = imagecreatetruecolor($base_width, $base_height);
        imagesavealpha($resized_overlay, true);
        imagealphablending($resized_overlay, false);
    
        // Preserve transparency
        $transparent = imagecolorallocatealpha($resized_overlay, 0, 0, 0, 127);
        imagefill($resized_overlay, 0, 0, $transparent);
    
        imagecopyresampled(
            $resized_overlay,        // destination
            $original_overlay,       // source
            0, 0,                    // dst x,y
            0, 0,                    // src x,y
            $base_width, $base_height,      // dst width/height
            imagesx($original_overlay),     // src width
            imagesy($original_overlay)      // src height
        );
    
        // Merge the resized overlay onto the base image
        imagecopy($base_image, $resized_overlay, 0, 0, 0, 0, $base_width, $base_height);
    
        // Save result
        $result = imagepng($base_image, $output_path);
    
        // Cleanup
        imagedestroy($base_image);
        imagedestroy($original_overlay);
        imagedestroy($resized_overlay);
    
        return $result;
    }
    