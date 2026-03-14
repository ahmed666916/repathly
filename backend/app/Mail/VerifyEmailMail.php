<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerifyEmailMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $verificationToken;
    public string $userName;

    /**
     * Create a new message instance.
     */
    public function __construct(string $verificationToken, string $userName)
    {
        $this->verificationToken = $verificationToken;
        $this->userName = $userName;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Repathly — Email Adresinizi Doğrulayın',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.verify-email',
            with: [
                'token' => $this->verificationToken,
                'name'  => $this->userName,
            ],
        );
    }
}
