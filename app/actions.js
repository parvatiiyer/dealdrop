"use server";
import { scrapeProduct } from "@/lib/firecrawl";
import { createServer } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signOut() {
    const supabase = await createServer();
    await supabase.auth.signOut();
    revalidatePath('/');
    redirect('/');
}

export async function addProduct({ url }) {
  if (!url) throw new Error("Product URL is required");

  try {
    const supabase = createServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be logged in to add products");

    const productData = await scrapeProduct(url);

    const name = productData.productName;
    const newPrice = parseFloat(productData.currentPrice);
    const currency = productData.currencyCode || "USD";
    const imageUrl = productData.productImageUrl;

    if (!name || isNaN(newPrice)) throw new Error("Failed to extract product");

    const { data: existingProduct } = await supabase
      .from("products")
      .select("id,current_price")
      .eq("user_id", user.id)
      .eq("url", url)
      .single();

    const isUpdate = !!existingProduct;

    const { data: product, error } = await supabase
      .from("products")
      .upsert(
        {
          user_id: user.id,
          url,
          name,
          current_price: newPrice,
          currency,
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id,url" }
      )
      .select()
      .single();

    if (error) throw error;

    if (!isUpdate || existingProduct.current_price !== newPrice) {
      await supabase.from("price_history").insert({
        product_id: product.id,
        price: newPrice,
        currency
      });
    }

    revalidatePath("/");
    return {
      success: true,
      message: isUpdate
        ? "Product updated successfully"
        : "Product added successfully"
    };
  } catch (err) {
    console.error("Add product error:", err);
    return { error: err.message };
  }
}

export async function getProducts() {
    try{
        const supabase = await createServer();
        const {data, error} = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });
            
        if (error) throw error;

        return data || [];    
    } catch (error) {
        console.error("Get products error:", error);
        return [];
    }
}

export async function deleteProduct(productId) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) throw error;

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getPriceHistory(productId) {
    try{
        const supabase = await createServer();
        const {data, error} = await supabase
            .from("price_history")
            .select("*")
            .eq("product_id", productId)
            .order("created_at", { ascending: true });
            
        if (error) throw error;

        return data || [];    
    } catch (error) {
        console.error("Get price history error:", error);
        return [];
    }
}