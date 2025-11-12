import { format } from "date-fns";

// Định nghĩa kiểu dữ liệu
interface TraceInfo {
  batch: {
    batch_code: string;
    manufacturing_date: string;
    expiry_date: string | null;
    supplier_name: string;
    supplier_address: string;
  };
  products: { name: string }[];
}

// Hàm fetch dữ liệu ở phía server
async function getTraceData(batchCode: string): Promise<TraceInfo | null> {
  try {
    const res = await fetch(`http://localhost:5000/api/trace/${batchCode}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function TracePage({
  params,
}: {
  params: { batchCode: string };
}) {
  const data = await getTraceData(params.batchCode);

  if (!data) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold">Mã QR không hợp lệ</h1>
        <p className="text-gray-600 mt-2">
          Không tìm thấy thông tin truy vết cho mã lô hàng này.
        </p>
      </div>
    );
  }

  const { batch, products } = data;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-green-700 mb-2">
            Thông tin truy vết nguồn gốc
          </h1>
          <p className="text-xl font-mono text-gray-500 mb-8">
            {batch.batch_code}
          </p>

          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold uppercase text-gray-400 mb-2">
                Thông tin Lô hàng
              </h2>
              <div className="p-4 border rounded-lg space-y-2">
                <p>
                  <strong>Ngày sản xuất:</strong>{" "}
                  {format(new Date(batch.manufacturing_date), "dd/MM/yyyy")}
                </p>
                <p>
                  <strong>Ngày hết hạn:</strong>{" "}
                  {batch.expiry_date
                    ? format(new Date(batch.expiry_date), "dd/MM/yyyy")
                    : "Không có"}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase text-gray-400 mb-2">
                Nhà cung cấp
              </h2>
              <div className="p-4 border rounded-lg space-y-2">
                <p>
                  <strong>Tên:</strong> {batch.supplier_name}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {batch.supplier_address}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase text-gray-400 mb-2">
                Các sản phẩm trong Lô hàng này
              </h2>
              <div className="p-4 border rounded-lg">
                {products.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {products.map((p, index) => (
                      <li key={index}>{p.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Không có thông tin sản phẩm.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
