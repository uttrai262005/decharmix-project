"use client";
import VoucherEditPage from "../[id]/page";

export default function NewVoucherPage() {
  // Tái sử dụng component Sửa/Edit cho trang "Tạo Mới"
  // Component [id]/page.tsx sẽ tự nhận biết đây là "Tạo Mới"
  // vì params.id sẽ là undefined (do chúng ta không truyền)
  // HOẶC trong logic code bên dưới, chúng ta check id === 'new'

  // *** LƯU Ý QUAN TRỌNG ***
  // Cách bạn đang làm là:
  // new/page.tsx -> import [id]/page.tsx
  // Khi truy cập /new, params.id sẽ là undefined

  // Logic trong code [id]/page.tsx của bạn lại là:
  // const id = params.id as string;
  // const isNew = id === "new"; // <-- LỖI Ở ĐÂY

  // Khi ở trang /new, id là undefined, nên isNew sẽ là false.
  // Bạn cần sửa lại file [id]/page.tsx.

  // Tốt nhất, bạn nên làm theo cách chuẩn là:
  // file new/page.tsx chỉ cần render component [id]/page.tsx
  // và file [id]/page.tsx sẽ tự lấy params.

  // Theo file [id]/page.tsx bạn gửi, nó đang mong đợi id là "new".
  // Vậy file new/page.tsx của bạn phải như sau:

  // <VoucherEditPage />
  // Sẽ không hoạt động đúng với logic `id === "new"` của bạn.

  // Bạn hãy **XÓA** file `new/page.tsx` đi.
  // Và chỉ cần dùng file `[id]/page.tsx` là đủ.
  // Khi bạn truy cập /vouchers/new, Next.js sẽ tự động
  // render file `[id]/page.tsx` và `params.id` sẽ là "new".

  // Nếu bạn VẪN MUỐN dùng file `new/page.tsx`,
  // thì file `[id]/page.tsx` phải sửa logic check `isNew`
  // thành `const params = useParams(); const id = params.id; const isNew = id === undefined;`

  // Theo code bạn gửi, bạn chỉ cần 1 file [id]/page.tsx là đủ.
  // Hãy xóa file `new/page.tsx` và chỉ dùng file dưới đây.

  // Nếu bạn vẫn giữ file new/page.tsx
  return <VoucherEditPage />;
}
