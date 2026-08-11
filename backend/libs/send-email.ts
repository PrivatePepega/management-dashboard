import sgMail from "@sendgrid/mail";
import "dotenv/config";

const SEND_GRID_API = process.env.SEND_GRID_API;

if (!SEND_GRID_API) {
    throw new Error("JWT_SECRET environment variable is required");
}

sgMail.setApiKey(SEND_GRID_API);

const fromEmail = process.env.FROM_EMAIL;
    if (!fromEmail) {
        throw new Error("FROM_EMAIL environment variable is required");
    }
export const sendEmail = async (to:string, subject:string, html:any) => {
    const msg = {
        to,
        from: `Dashboard Manager <${fromEmail}>`,
        subject,
        html,
    }

    try{
        await sgMail.send(msg);
        console.log("Email send successfully");
        return true;
    } catch (error: any) {
        console.error(
          "SendGrid error:",
          JSON.stringify(error.response?.body, null, 2)
        );
      
        throw error;
      }

}



