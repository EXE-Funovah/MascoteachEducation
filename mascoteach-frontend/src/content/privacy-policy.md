# Mascoteach Privacy Policy / Chính Sách Bảo Mật Mascoteach

*Effective Date / Ngày hiệu lực: June 24, 2026*

Welcome to **Mascoteach**, a learning platform developed by **Funovah** ("we", "us", "our"), including our website, web application, and mobile application. We are committed to protecting your privacy and ensuring a secure experience for our users (students, teachers, and parents). This Privacy Policy explains how we collect, use, store, and share information when you use Mascoteach across these services.

Chào mừng bạn đến với **Mascoteach**, nền tảng học tập được phát triển bởi **Funovah** ("chúng tôi"), bao gồm website, ứng dụng web và ứng dụng di động. Chúng tôi cam kết bảo vệ quyền riêng tư và đảm bảo trải nghiệm an toàn cho người dùng (học sinh, giáo viên và phụ huynh). Chính Sách Bảo Mật này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và chia sẻ thông tin khi bạn sử dụng Mascoteach trên các dịch vụ này.

---

## 1. Information We Collect / Thông tin chúng tôi thu thập

### a. Personal Information / Thông tin cá nhân
- **Account Information / Thông tin tài khoản**: Full Name (Họ tên), Email address (Địa chỉ email), and password when you register an account. We also collect your selected role (Student, Teacher, Parent) to customize your Mascoteach experience across supported web and mobile services.
- **Google Sign-In / Đăng nhập Google**: If you choose to register or log in using Google, we receive your email, display name, and profile picture URL from Google's authentication service.

### b. User-Generated Content / Nội dung do người dùng tạo
- **Learning Materials / Tài liệu học tập**: Documents (PDF, Word, or text files) that you upload for the AI quiz generation feature. These files are zipped and securely uploaded to our S3 storage bucket.
- **Quizzes and Attempts / Bộ câu hỏi và Lượt làm bài**: Quizzes created from your documents, as well as attempt records (correct answers, duration, earned XP, and streak progress).

### c. Device and Audio Data / Dữ liệu thiết bị và Âm thanh
- **Microphone and Audio / Micro và Âm thanh**: When you use the **Mascot AI Voice Chat** feature on a supported mobile app or web browser, we may request microphone access so that your audio can be transmitted in real time to our AI voice service. We do not record or store your voice audio files on our servers. The audio stream is transmitted solely to process your conversation with the AI mascot.
- **Device and Diagnostic Information / Thông tin thiết bị và Chẩn đoán**: We may collect standard technical information such as device model, browser type, OS version, application or browser crash logs, and network state to maintain service performance across web and mobile environments.

---

## 2. Mobile App Permissions & Browser Access / Quyền trên App Mobile & Truy cập Trình duyệt

To provide all functionalities, Mascoteach may request certain permissions or access depending on how you use the service. The items below apply primarily to the **mobile application**, while browser-based features may rely on your browser's own permission prompts.

Để cung cấp đầy đủ tính năng, Mascoteach có thể yêu cầu một số quyền hoặc quyền truy cập tùy theo cách bạn sử dụng dịch vụ. Các mục dưới đây áp dụng chủ yếu cho **ứng dụng di động**, còn các tính năng trên web có thể sử dụng hộp thoại xin quyền trực tiếp từ trình duyệt.

1. **Microphone (`RECORD_AUDIO` & `MODIFY_AUDIO_SETTINGS`)**:
   - *Purpose*: Required for the Mascot AI voice interaction feature on the mobile app. On the web, equivalent microphone access may be requested by your browser when you start a voice session.
   - *Mục đích*: Cần thiết cho tính năng trò chuyện bằng giọng nói với Mascot AI trên ứng dụng di động. Trên web, quyền truy cập micro tương đương có thể được trình duyệt yêu cầu khi bạn bắt đầu một phiên trò chuyện.
2. **Internet & Network (`INTERNET`, `ACCESS_NETWORK_STATE`, `CHANGE_NETWORK_STATE`)**:
   - *Purpose*: Required to connect to our backend APIs, upload documents to AWS S3, and establish WebRTC channels for AI voice chat on supported platforms.
   - *Mục đích*: Cần thiết để kết nối với hệ thống API, tải tài liệu lên AWS S3 và thiết lập kênh truyền WebRTC cho voice chat AI trên các nền tảng được hỗ trợ.
3. **Bluetooth (`BLUETOOTH`, `BLUETOOTH_CONNECT`)**:
   - *Purpose*: Required on certain mobile devices by the WebRTC audio routing library to support Bluetooth headphones/microphones during voice sessions.
   - *Mục đích*: Có thể cần trên một số thiết bị di động do thư viện định tuyến âm thanh WebRTC yêu cầu để hỗ trợ tai nghe/micro Bluetooth trong suốt cuộc trò chuyện.

---

## 3. How We Use Your Information / Cách chúng tôi sử dụng thông tin

We use the collected information for the following purposes:
- To create and maintain your user account.
- To process uploaded documents and generate customized quizzes via our AI service.
- To display learning statistics (XP, level, streak progress, and badges) on your dashboard.
- To facilitate real-time voice conversations with the Mascot AI tutor.
- To troubleshoot bugs, optimize website, web app, and mobile app performance, and prevent fraud.

Chúng tôi sử dụng thông tin thu thập được cho các mục đích:
- Tạo và duy trì tài khoản người dùng của bạn.
- Xử lý tài liệu tải lên và tạo câu hỏi tự động qua dịch vụ AI.
- Hiển thị tiến trình học tập (XP, cấp độ, streak và huy hiệu) trên bảng điều khiển.
- Hỗ trợ cuộc trò chuyện bằng giọng nói thời gian thực với gia sư Mascot AI.
- Khắc phục sự cố kỹ thuật, tối ưu hiệu suất website, ứng dụng web và ứng dụng di động, đồng thời ngăn chặn gian lận.

---

## 4. Data Sharing and Third-Party Services / Chia sẻ dữ liệu và Dịch vụ bên thứ ba

We do not sell your personal data. We only share information with third-party service providers under the following conditions:
- **AI Services (Mascoteach AI Service & third-party AI providers)**: Real-time voice stream and text prompts are sent to AI processing services to generate mascot responses.
- **Cloud Storage (AWS S3)**: Documents you upload are stored securely in cloud buckets.
- **Authentication (Google)**: Used to verify user identity for Google Sign-In.
- **Payment Processing (PayOS)**: When you purchase a Premium subscription, your payment is processed by PayOS. We do not store your card or banking details on our servers.

Chúng tôi không bán dữ liệu cá nhân của bạn. Chúng tôi chỉ chia sẻ thông tin với các dịch vụ bên thứ ba trong các điều kiện sau:
- **Dịch vụ AI (Mascoteach AI Service & nhà cung cấp AI bên thứ ba)**: Luồng âm thanh và văn bản thời gian thực được gửi đến các dịch vụ AI để tạo phản hồi cho mascot.
- **Lưu trữ đám mây (AWS S3)**: Tài liệu bạn tải lên được lưu trữ bảo mật trên các cloud bucket.
- **Xác thực (Google)**: Được dùng để xác minh danh tính người dùng khi đăng nhập Google.
- **Xử lý thanh toán (PayOS)**: Khi bạn mua gói Premium, khoản thanh toán được xử lý bởi PayOS. Chúng tôi không lưu thông tin thẻ/ngân hàng của bạn trên máy chủ.

---

## 5. Data Retention & Account Deletion / Lưu trữ & Xóa tài khoản

We retain your personal data while your account remains active or for a reasonable period needed to provide the service, resolve disputes, enforce agreements, and meet legal obligations.

**Account Deletion (Xóa tài khoản)**:
- Users have the right to delete their accounts at any time.
- You can request account deletion by contacting us at **support@mascoteach.com**.
- If the app provides an in-app account deletion control, you may also use that feature directly.
- After we verify a valid request, we will delete or deactivate your relevant profile information, uploaded documents, generated quizzes, and progress history within a reasonable period unless some data must be retained for legal, security, or fraud-prevention reasons.

Chúng tôi lưu trữ dữ liệu cá nhân của bạn trong thời gian tài khoản còn hoạt động hoặc trong khoảng thời gian hợp lý cần thiết để cung cấp dịch vụ, giải quyết tranh chấp, thực thi thỏa thuận và đáp ứng nghĩa vụ pháp lý.

**Yêu cầu xóa tài khoản**:
- Người dùng có quyền xóa tài khoản của mình bất kỳ lúc nào.
- Bạn có thể gửi yêu cầu xóa tài khoản qua email **support@mascoteach.com**.
- Nếu ứng dụng có cung cấp chức năng yêu cầu xóa tài khoản trong app, bạn cũng có thể sử dụng trực tiếp tính năng đó.
- Sau khi xác minh yêu cầu hợp lệ, chúng tôi sẽ xóa hoặc vô hiệu hóa dữ liệu liên quan trong thời gian hợp lý, trừ khi một phần dữ liệu cần được lưu lại vì lý do pháp lý, bảo mật hoặc chống gian lận.

---

## 6. Children's Privacy / Quyền riêng tư của trẻ em

Mascoteach is designed for students, teachers, and parents. For student accounts under the age of 13, we encourage parents or teachers to oversee the registration and usage. We do not knowingly collect personal data from children under 13 without parental or educational supervisor consent. If you believe we have inadvertently collected such data, please contact us, and we will promptly delete it.

Mascoteach được thiết kế dành cho học sinh, giáo viên và phụ huynh. Đối với tài khoản học sinh dưới 13 tuổi, chúng tôi khuyến khích phụ huynh hoặc giáo viên giám sát việc đăng ký và sử dụng. Chúng tôi không chủ ý thu thập dữ liệu cá nhân từ trẻ em dưới 13 tuổi mà không có sự đồng ý của phụ huynh hoặc người giám hộ. Nếu bạn tin rằng chúng tôi vô tình thu thập dữ liệu đó, vui lòng liên hệ và chúng tôi sẽ xóa ngay lập tức.

---

## 7. Changes to This Privacy Policy / Thay đổi Chính sách Bảo mật

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy in this file and updating the "Effective Date" at the top of this document.

Chúng tôi có thể cập nhật Chính Sách Bảo Mật này theo thời gian. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng chính sách mới tại đây và cập nhật "Ngày hiệu lực" ở đầu trang.

---

## 8. Contact Us / Liên hệ với chúng tôi

If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact us at:

Nếu bạn có bất kỳ câu hỏi, lo ngại hoặc yêu cầu nào liên quan đến Chính Sách Bảo Mật này hoặc dữ liệu của bạn, vui lòng liên hệ:

* **Email**: support@mascoteach.com
* **Website**: https://mascoteach.com
* **Developer**: Funovah Team
