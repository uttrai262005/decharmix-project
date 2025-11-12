export interface Post {
  slug: string;
  title: string;
  author: string;
  date: string;
  category: string;
  image: string;
  summary: string;
  content: string;
}

export const posts: Post[] = [
  {
    slug: "cong-thuc-salad-ca-hoi-ap-chao",
    title: "Công thức Salad Cá Hồi áp chảo hoàn hảo cho bữa tối nhẹ nhàng",
    author: "Bếp Shinsen",
    date: "Ngày 2 tháng 10, 2025",
    category: "Công thức",
    image: "/blog/blog-1.jpg",
    summary:
      "Một món salad không chỉ ngon miệng, đẹp mắt mà còn cực kỳ bổ dưỡng với cá hồi Na Uy giàu Omega-3 và các loại rau củ tươi mát. Hãy cùng Shinsen vào bếp nhé!",
    content: `
      <h2>Nguyên liệu chuẩn bị</h2>
      <ul>
        <li>200g phi lê cá hồi Na Uy tươi</li>
        <li>150g xà lách Romana (hoặc mix salad)</li>
        <li>10 quả cà chua bi</li>
        <li>1/2 quả dưa leo</li>
        <li>1/4 củ hành tây tím</li>
        <li>1 muỗng canh dầu ô liu, muối, tiêu</li>
      </ul>
      <h2>Công thức sốt Dầu Giấm Mật Ong</h2>
      <p>Trộn đều 3 muỗng canh dầu ô liu, 1 muỗng canh giấm táo, 1 muỗng cà phê mật ong, 1/2 muỗng cà phê mù tạt vàng, một ít muối và tiêu. Khuấy đều cho hỗn hợp hòa quyện.</p>
      <h2>Các bước thực hiện</h2>
      <p><strong>Bước 1: Sơ chế rau củ.</strong> Rửa sạch xà lách, cà chua, dưa leo. Cà chua bi cắt đôi, dưa leo thái lát mỏng, hành tây tím thái sợi mỏng.</p>
      <p><strong>Bước 2: Áp chảo cá hồi.</strong> Thấm khô miếng cá hồi, rắc đều muối và tiêu lên hai mặt. Làm nóng chảo với một ít dầu ô liu, cho cá vào áp chảo mỗi mặt khoảng 3-4 phút cho đến khi cá có màu vàng đẹp và chín tới. Lấy cá ra và để nguội bớt.</p>
      <p><strong>Bước 3: Trộn salad.</strong> Cho tất cả rau củ đã sơ chế vào một tô lớn. Rưới đều phần sốt đã chuẩn bị và trộn nhẹ tay. Xếp salad ra đĩa, đặt miếng cá hồi lên trên. Bạn có thể cắt cá thành miếng nhỏ hoặc để nguyên miếng. Thưởng thức ngay để cảm nhận độ tươi ngon!</p>
      <blockquote>Chúc bạn và gia đình có một bữa tối thật ngon miệng và lành mạnh cùng Shinsen!</blockquote>
    `,
  },
  {
    slug: "bi-quyet-chon-rau-cu-tuoi-ngon",
    title: "Bí quyết chọn rau củ quả luôn tươi ngon như vừa được hái",
    author: "Bếp Shinsen",
    date: "Ngày 28 tháng 9, 2025",
    category: "Mẹo Bếp",
    image: "/blog/blog-2.jpg",
    summary:
      "Làm thế nào để chọn được những loại rau củ quả tươi ngon nhất? Shinsen sẽ chia sẻ những mẹo nhỏ nhưng cực kỳ hữu ích giúp bạn trở thành người nội trợ thông thái.",
    content: `
      <h2>Nhìn vào màu sắc và hình dáng</h2>
      <p>Rau củ quả tươi thường có màu sắc tươi sáng, tự nhiên và đồng đều. Tránh chọn những sản phẩm có đốm đen, dập nát, hoặc màu sắc bị úa vàng. Hình dáng cũng rất quan trọng, hãy chọn những quả có hình dáng cân đối, không bị méo mó hay có những vết sần sùi bất thường.</p>
      <h2>Cảm nhận bằng tay</h2>
      <p>Độ cứng và chắc của sản phẩm là một chỉ số quan trọng. Ví dụ, dưa leo, cà rốt phải cứng và chắc tay. Cà chua, đào, mận thì nên có độ đàn hồi nhẹ khi ấn vào. Đối với các loại rau ăn lá như xà lách, cải bó xôi, lá phải giòn, không bị mềm hay héo úa.</p>
      <h2>Kiểm tra cuống và lá</h2>
      <p>Phần cuống và lá là nơi thể hiện rõ nhất độ tươi của sản phẩm. Cuống phải còn tươi, xanh và dính chặt vào quả. Nếu cuống đã héo hoặc ngả màu nâu, sản phẩm đó đã được hái khá lâu. Lá đi kèm (ví dụ như lá trên củ cà rốt, dâu tây) cũng phải xanh tươi, không bị dập nát.</p>
      <blockquote>Tại Shinsen, chúng tôi đã làm thay bạn công đoạn lựa chọn kỹ lưỡng này. Mọi sản phẩm đến tay bạn đều được đảm bảo chất lượng và độ tươi ngon cao nhất.</blockquote>
    `,
  },
  {
    slug: "5-loai-sinh-to-xanh-detox",
    title: "5 Loại Sinh Tố Xanh Detox Cơ Thể Dễ Làm Tại Nhà",
    author: "Bếp Shinsen",
    date: "Ngày 5 tháng 10, 2025",
    category: "Sống Khỏe",
    image: "/blog/blog-3.jpg",
    summary:
      "Bắt đầu một ngày mới đầy năng lượng hoặc thanh lọc cơ thể sau những ngày ăn uống quá đà với 5 công thức sinh tố xanh đơn giản, ngon miệng và giàu dinh dưỡng.",
    content: `
      <p>Sinh tố xanh là một cách tuyệt vời để nạp nhanh vitamin, khoáng chất và chất xơ. Dưới đây là 5 công thức bạn có thể thử ngay với các nguyên liệu từ Shinsen.</p>
      <h2>1. Sinh Tố Cải Bó Xôi & Xoài</h2>
      <p>Vị ngọt của xoài sẽ cân bằng hoàn hảo vị của cải bó xôi, tạo ra một ly sinh tố thơm ngon ngay cả cho người mới bắt đầu.</p>
      <ul>
        <li>1 nắm cải bó xôi</li>
        <li>1/2 quả xoài chín, cắt nhỏ</li>
        <li>1/2 quả chuối đông lạnh</li>
        <li>150ml sữa tươi không đường hoặc sữa hạt</li>
      </ul>
      <h2>2. Sinh Tố Dưa Leo & Táo Xanh</h2>
      <p>Một công thức cực kỳ thanh mát, giúp cấp nước và làm đẹp da.</p>
      <ul>
        <li>1/2 quả dưa leo</li>
        <li>1/2 quả táo xanh</li>
        <li>Một nhánh bạc hà nhỏ</li>
        <li>150ml nước dừa tươi</li>
      </ul>
      <h2>3. Sinh Tố Bơ & Cải Kale</h2>
      <p>Dành cho những ai cần một bữa sáng no lâu và giàu năng lượng, với độ béo ngậy từ bơ và siêu dinh dưỡng từ cải kale.</p>
      <ul>
        <li>1-2 lá cải kale (bỏ gân lá cứng)</li>
        <li>1/2 quả bơ chín</li>
        <li>1/2 quả chuối</li>
        <li>150ml sữa hạnh nhân</li>
      </ul>
      <blockquote>Lưu ý: Bạn có thể thêm một muỗng hạt chia hoặc hạt lanh vào bất kỳ công thức nào để tăng thêm Omega-3 và chất xơ. Chúc bạn ngon miệng!</blockquote>
    `,
  },
  {
    slug: "phan-biet-cac-phan-thit-bo",
    title: "Phân Biệt Các Phần Thịt Bò Phổ Biến: Ribeye, Sirloin và Thăn Nội",
    author: "Bếp Shinsen",
    date: "Ngày 8 tháng 10, 2025",
    category: "Mẹo Bếp",
    image: "/blog/blog-4.jpg",
    summary:
      "Bạn bối rối không biết nên chọn phần thịt bò nào cho món steak hay bò lúc lắc? Hãy cùng Shinsen tìm hiểu về đặc điểm của các phần thịt bò cao cấp nhé.",
    content: `
      <p>Chọn đúng phần thịt bò là chìa khóa cho một món ăn thành công. Mỗi phần thịt có kết cấu và hương vị khác nhau, phù hợp với các kiểu chế biến riêng.</p>
      <h2>1. Thăn Ngoại (Ribeye)</h2>
      <p>Đây là "vua của các loại steak". Ribeye nổi tiếng với những vân mỡ cẩm thạch (marbling) xen kẽ đều đặn trong thớ thịt. Khi nấu, lớp mỡ này tan chảy, giúp miếng thịt cực kỳ mềm, mọng nước và có hương vị béo ngậy, đậm đà. Ribeye lý tưởng nhất cho món steak áp chảo hoặc nướng ở nhiệt độ cao.</p>
      <h2>2. Thăn Ngoại Lưng (Sirloin)</h2>
      <p>Sirloin là một phần thịt nạc hơn Ribeye nhưng vẫn giữ được độ mềm và hương vị bò đặc trưng. Nó có một lớp mỡ mỏng ở một bên viền, giúp giữ ẩm cho thịt khi nấu. Sirloin là lựa chọn tuyệt vời cho những ai thích ăn steak nhưng không muốn quá béo. Ngoài ra, nó cũng rất ngon khi làm bò lúc lắc hoặc thái mỏng để xào.</p>
      <h2>3. Thăn Nội (Tenderloin / Filet Mignon)</h2>
      <p>Đây là phần thịt mềm nhất, ít vận động nhất của con bò. Thăn nội có kết cấu cực kỳ mềm mại, gần như tan trong miệng. Tuy nhiên, vì rất nạc và ít mỡ, hương vị của nó không đậm đà bằng Ribeye. Thăn nội thường có giá thành cao nhất và thường được chế biến thành món Filet Mignon trứ danh.</p>
      <blockquote>Hy vọng qua bài viết này, bạn có thể tự tin chọn lựa phần thịt bò phù hợp nhất cho bữa ăn sắp tới của gia đình mình!</blockquote>
    `,
  },
  {
    slug: "loi-ich-omega-3-tu-ca-hoi",
    title: "Lợi Ích Bất Ngờ Của Omega-3 Từ Cá Hồi Na Uy",
    author: "Bếp Shinsen",
    date: "Ngày 10 tháng 10, 2025",
    category: "Dinh Dưỡng",
    image: "/blog/blog-5.jpg",
    summary:
      'Cá hồi không chỉ là một món ăn ngon mà còn là một "siêu thực phẩm" cho não bộ và tim mạch. Cùng tìm hiểu về những lợi ích tuyệt vời của axit béo Omega-3 có trong cá hồi.',
    content: `
      <p>Axit béo Omega-3 là một loại chất béo thiết yếu mà cơ thể chúng ta không thể tự tổng hợp được. Cá hồi, đặc biệt là cá hồi từ vùng nước lạnh như Na Uy, là một trong những nguồn cung cấp Omega-3 (EPA và DHA) dồi dào và chất lượng nhất.</p>
      <h2>1. Tốt cho sức khỏe tim mạch</h2>
      <p>Omega-3 đã được chứng minh là có khả năng làm giảm mức triglyceride (một loại mỡ trong máu), làm chậm sự phát triển của các mảng bám trong động mạch, giảm huyết áp và ngăn ngừa rối loạn nhịp tim. Bổ sung cá hồi vào chế độ ăn 2 lần/tuần có thể giảm đáng kể nguy cơ mắc các bệnh về tim mạch.</p>
      <h2>2. Hỗ trợ chức năng não bộ</h2>
      <p>DHA, một loại Omega-3, là thành phần cấu trúc chính của não bộ và võng mạc. Bổ sung đủ DHA giúp cải thiện trí nhớ, tăng khả năng tập trung và giảm nguy cơ mắc các bệnh thoái hóa thần kinh như Alzheimer. Nó cũng rất quan trọng cho sự phát triển não bộ của thai nhi và trẻ nhỏ.</p>
      <h2>3. Chống viêm hiệu quả</h2>
      <p>Omega-3 có đặc tính chống viêm mạnh mẽ, giúp giảm các triệu chứng của các bệnh viêm khớp dạng thấp, bệnh vẩy nến và các tình trạng viêm mãn tính khác trong cơ thể.</p>
      <blockquote>Chỉ với một khẩu phần cá hồi, bạn đã có thể cung cấp đủ lượng Omega-3 cần thiết cho cả ngày. Hãy thêm siêu thực phẩm này vào thực đơn của bạn ngay hôm nay!</blockquote>
    `,
  },
];
