
'use server';
/**
 * @fileOverview A flow to send a booking confirmation email.
 *
 * - sendBookingConfirmation - A function that handles sending the email.
 * - BookingConfirmationInput - The input type for the sendBookingConfirmation function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as nodemailer from 'nodemailer';

const BookingConfirmationInputSchema = z.object({
  appointmentDetails: z.object({
    fullName: z.string(),
    email: z.string(),
    phone: z.string(),
    dateOfBirth: z.string(),
    preferredArtist: z.string().optional(),
    tattooStyle: z.string().optional(),
    tattooDescription: z.string(),
    budgetRange: z.string().optional(),
    preferredTimeframe: z.string().optional(),
    createdAt: z.string(),
  }),
});

export type BookingConfirmationInput = z.infer<typeof BookingConfirmationInputSchema>;

/**
 * Sends a booking confirmation email using environment variables.
 */
export async function sendBookingConfirmation(
  input: BookingConfirmationInput
): Promise<{ success: boolean; message: string }> {
  return sendBookingConfirmationFlow(input);
}

const sendBookingConfirmationFlow = ai.defineFlow(
  {
    name: 'sendBookingConfirmationFlow',
    inputSchema: BookingConfirmationInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async (input) => {
    const { appointmentDetails } = input;
    
    // Get credentials from environment variables
    const USER_EMAIL = process.env.EMAIL_USER || 'ashgrayink@gmail.com';
    const APP_PASSWORD = process.env.EMAIL_PASS;

    if (!APP_PASSWORD) {
      console.error('Email password is not configured in .env');
      return { success: false, message: 'Server configuration error.' };
    }

    try {
      // Create transporter with explicit SMTP settings for stability
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: USER_EMAIL,
          pass: APP_PASSWORD,
        },
        // Wait up to 10 seconds for connection/response
        connectionTimeout: 10000,
        greetingTimeout: 10000,
      });

      const mailOptions = {
        from: `"Ashgray Ink Booking" <${USER_EMAIL}>`,
        to: USER_EMAIL,
        subject: `New Tattoo Appointment Request: ${appointmentDetails.fullName}`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h1 style="color: #000; border-bottom: 2px solid #FAA938; padding-bottom: 10px;">New Appointment Request</h1>
            <p><strong>Name:</strong> ${appointmentDetails.fullName}</p>
            <p><strong>Email:</strong> ${appointmentDetails.email}</p>
            <p><strong>Phone:</strong> ${appointmentDetails.phone}</p>
            <p><strong>Date of Birth:</strong> ${appointmentDetails.dateOfBirth || 'N/A'}</p>
            <p><strong>Preferred Artist:</strong> ${appointmentDetails.preferredArtist || 'N/A'}</p>
            <p><strong>Tattoo Style:</strong> ${appointmentDetails.tattooStyle || 'N/A'}</p>
            <p><strong>Budget:</strong> ${appointmentDetails.budgetRange || 'N/A'}</p>
            <p><strong>Timeframe:</strong> ${appointmentDetails.preferredTimeframe || 'N/A'}</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #FAA938;">
              <strong>Description:</strong><br/>
              ${appointmentDetails.tattooDescription.replace(/\n/g, '<br/>')}
            </div>
            <p style="font-size: 0.8em; color: #777; margin-top: 30px; text-align: right;">
              Submitted on: ${new Date(appointmentDetails.createdAt).toLocaleString()}
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      return { success: true, message: 'Email sent successfully.' };

    } catch (error: any) {
      console.error('Failed to send confirmation email:', error);
      return { success: false, message: error.message || 'Failed to send email.' };
    }
  }
);
