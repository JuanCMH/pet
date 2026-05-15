import Resend from "@auth/core/providers/resend";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";
import { ConvexError } from "convex/values";
import { Resend as ResendAPI } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = "PetWell <harmony@n3xus.cloud>";

export const ResendOTPPasswordReset = Resend({
  apiKey,
  id: "resend-otp",
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes) {
        crypto.getRandomValues(bytes);
      },
    };

    return generateRandomString(random, "0123456789", 8);
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    if (!provider.apiKey) {
      throw new ConvexError(
        "Falta configurar RESEND_API_KEY para enviar códigos de recuperación.",
      );
    }

    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: "Código de recuperación de PetWell",
      html: `
        <p>¡Hola!</p>
        <p>
          Recibimos una solicitud para restablecer tu contraseña de PetWell.
          Usa este código para continuar:
        </p>
        <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px;">
          ${token}
        </p>
        <p>Si no solicitaste este cambio, ignora este mensaje.</p>
      `,
    });

    if (error) {
      throw new ConvexError("No se pudo enviar el código de recuperación.");
    }
  },
});
