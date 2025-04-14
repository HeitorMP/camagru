<?php
$to = 'anything@example.com';
$subject = 'Test Email';
$message = 'This is a test email from PHP + MailDev';
$headers = "From: test@yourproject.com";

$result = mail($to, $subject, $message, $headers);
echo $result ? "Email sent!" : "Failed to send email.";
