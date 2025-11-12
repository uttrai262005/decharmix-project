import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Khởi tạo Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Truy vấn tất cả sản phẩm từ bảng 'products' bằng Supabase
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    // Nếu có lỗi từ Supabase, ném ra lỗi
    if (error) {
      throw error;
    }

    // Trả về dữ liệu dưới dạng JSON với status 200 (OK)
    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    // Nếu có lỗi, in ra console và trả về lỗi 500
    console.error("Supabase Error:", error.message);
    return NextResponse.json(
      { message: "Failed to fetch products", error: error.message },
      { status: 500 }
    );
  }
}

// Thêm dòng này để Next.js không cache API route này,
// đảm bảo dữ liệu luôn mới nhất.
export const dynamic = "force-dynamic";
