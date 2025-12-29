import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPriceDropAlert(userEmail, product, oldPrice, newPrice) {
  try {
    const priceDrop = oldPrice - newPrice;
    const percentageDrop = ((priceDrop / oldPrice) * 100).toFixed(2);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: userEmail,
      subject: `Price Drop Alert: ${product.name}`,
      html: `
      <html>
      <body style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin:auto;">

        <div style="background:#FA5D19; padding:24px; border-radius:10px 10px 0 0; text-align:center;">
          <h1 style="color:white; font-size:26px; margin:0;">🎉 Price Drop Alert!</h1>
        </div>

        <div style="border:1px solid #ddd; border-top:none; padding:24px;">
          
          ${
            product.image_url
              ? `<div style="text-align:center; margin-bottom:18px;">
                   <img src="${product.image_url}" width="250" height="250" style="border-radius:8px; display:block; margin:auto;" alt="${product.name}">
                 </div>`
              : ""
          }

          <h2 style="color:#111; margin-top:0;">${product.name}</h2>

          <p>Good news! The price dropped from 
            <del>${product.currency} ${oldPrice.toFixed(2)}</del> → 
            <strong style="color:#FA5D19;">${product.currency} ${newPrice.toFixed(2)}</strong>
          </p>

          <a href="${product.url}" 
            style="display:inline-block; background:#FA5D19; color:white; padding:12px 26px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:16px; margin:20px auto; text-align:center;">
            View Product →
          </a>

          <hr style="margin:30px 0;"/>

          <p style="font-size:12px; color:#666; text-align:center;">
            You're receiving this email because you're tracking this item.
            <br/>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#FA5D19;">Manage Tracked Products</a>
          </p>
        </div>
      </body>
      </html>
      `,
    });

    if (error) {
      console.error("Resend email error:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error sending price drop alert:", error);
    return { success: false, error };
  }
}
