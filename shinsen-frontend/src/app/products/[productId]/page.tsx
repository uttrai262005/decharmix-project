export default function TestPage({
  params,
}: {
  params: { productId: string };
}) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ color: "#0070f3" }}>🚀 Đường dẫn đã hoạt động!</h1>
      <p>
        Giá trị productId hiện tại là: <strong>{params.productId}</strong>
      </p>
      <p style={{ color: "#666" }}>
        Nếu bạn thấy trang này, hãy báo cho mình biết nhé.
      </p>
    </div>
  );
}
