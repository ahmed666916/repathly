<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $resetToken;
    public string $userEmail;

    /**
     * Create a new message instance.
     */
    public function __construct(string $resetToken, string $userEmail)
    {
        $this->resetToken = $resetToken;
        $this->userEmail = $userEmail;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Repathly — Şifre Sıfırlama',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.reset-password',
            with: [
                'token' => $this->resetToken,
                'email' => $this->userEmail,
            ],
        );
    }
}
