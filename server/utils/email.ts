import { MailService } from '@sendgrid/mail';

// Vérifie si la clé API SendGrid est définie
if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY n'est pas définie. Les fonctionnalités d'e-mail ne fonctionneront pas.");
}

// Initialiser le service SendGrid si la clé API est disponible
const mailService = process.env.SENDGRID_API_KEY 
  ? new MailService()
  : null;

if (mailService) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY as string);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Envoie un e-mail via SendGrid
 * @param params Paramètres de l'e-mail
 * @returns Succès de l'envoi de l'e-mail
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!mailService) {
    console.error('SendGrid n\'est pas configuré. Vérifiez la variable d\'environnement SENDGRID_API_KEY.');
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('Erreur d\'envoi d\'e-mail SendGrid:', error);
    return false;
  }
}

/**
 * Fonction d'aide pour envoyer un email de contact entre une école et une entreprise
 * @param fromEmail Email de l'expéditeur
 * @param toEmail Email du destinataire
 * @param fromName Nom de l'expéditeur
 * @param subject Sujet du message
 * @param message Corps du message
 * @returns Succès de l'envoi de l'e-mail
 */
export async function sendContactEmail(
  fromEmail: string,
  toEmail: string,
  fromName: string,
  subject: string,
  message: string
): Promise<boolean> {
  // Créer le corps HTML de l'e-mail
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Nouveau message de contact via Intega</h2>
      <p>Vous avez reçu un nouveau message de <strong>${fromName}</strong> (${fromEmail}).</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #374151;">${subject}</h3>
        <p style="white-space: pre-line;">${message}</p>
      </div>
      <p style="color: #6b7280; font-size: 0.8em;">Ce message a été envoyé via la plateforme Intega.</p>
    </div>
  `;

  // Envoyer l'e-mail
  return await sendEmail({
    from: 'no-reply@intega.example.com', // Utiliser un e-mail officiel de la plateforme
    to: toEmail,
    subject: `[Intega] ${subject}`,
    text: `Nouveau message de ${fromName} (${fromEmail}):\n\n${message}\n\nCe message a été envoyé via la plateforme Intega.`,
    html: htmlContent,
  });
}