<?php

function merge_images($base_image_path, $overlay_path, $output_path) {
    
    $base_image = imagecreatefrompng($base_image_path);
    if (!$base_image) return false;

    $original_overlay = imagecreatefrompng($overlay_path);
    if (!$original_overlay) {
        imagedestroy($base_image);
        return false;
    }


    $base_width = imagesx($base_image);
    $base_height = imagesy($base_image);


    $resized_overlay = imagecreatetruecolor($base_width, $base_height);
    imagesavealpha($resized_overlay, true);
    imagealphablending($resized_overlay, false);


    $transparent = imagecolorallocatealpha($resized_overlay, 0, 0, 0, 127);
    imagefill($resized_overlay, 0, 0, $transparent);

    imagecopyresampled(
        $resized_overlay, $original_overlay,
        0, 0, 0, 0,
        $base_width, $base_height,
        imagesx($original_overlay), imagesy($original_overlay)
    );


    imagecopy($base_image, $resized_overlay, 0, 0, 0, 0, $base_width, $base_height);


    $result = imagepng($base_image, $output_path);


    imagedestroy($base_image);
    imagedestroy($original_overlay);
    imagedestroy($resized_overlay);

    return $result;
}

function overlay_gif_on_image($baseImagePath, $overlayGifPath, $outputPath) {
    if (!file_exists($baseImagePath) || !file_exists($overlayGifPath)) {
        return false;
    }

    try {
        
        $overlay = new Imagick($overlayGifPath);
        $frames   = $overlay->coalesceImages();

       
        $base = new Imagick($baseImagePath);

        $result = new Imagick();
        $result->setFormat('gif');

        foreach ($frames as $frame) {
            
            $fw = $frame->getImageWidth();
            $fh = $frame->getImageHeight();

            
            $baseClone = clone $base;
            $baseClone->resizeImage($fw, $fh, Imagick::FILTER_LANCZOS, 1);
            $baseClone->setImageFormat('gif');

            
            $baseClone->compositeImage($frame, Imagick::COMPOSITE_OVER, 0, 0);

            
            $baseClone->setImageDelay($frame->getImageDelay());
            $baseClone->setImageDispose($frame->getImageDispose());

            $result->addImage($baseClone);
        }

        // Exporta animação unindo todos os frames
        $result->writeImages($outputPath, true);
        return true;

    } catch (Exception $e) {
        error_log("Overlay GIF error: " . $e->getMessage());
        return false;
    }
}

