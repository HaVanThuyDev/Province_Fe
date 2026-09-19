// ============================================================
// AI SERVICE – Trợ lý ảo Hạnh AI CIVIL-PRO
// Quản lý API Key và gửi yêu cầu sinh phản hồi thông minh
// ============================================================

import { ChatMessage } from '../types/ai.types';

const API_KEY_STORAGE = 'cudan_ai_api_key';

export function getStoredApiKey(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(API_KEY_STORAGE) || '';
  }
  return '';
}

export function setStoredApiKey(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(API_KEY_STORAGE, key.trim());
  }
}

export function clearStoredApiKey(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(API_KEY_STORAGE);
  }
}

const SYSTEM_PROMPT = `
Bạn là "Hạnh" - Trợ lý ảo AI thông minh của Hệ thống Cơ sở dữ liệu Dân cư & Hộ khẩu Toàn tỉnh (CIVIL-PRO).
Nhiệm vụ của bạn:
1. Hỗ trợ cán bộ quản lý tra cứu công dân, hộ khẩu, biến động cư trú, thủ tục hành chính.
2. Cung cấp quy định pháp luật chuẩn xác theo Luật Cư trú 2020, Luật Căn cước 2023 và Đề án 06 của Chính phủ.
3. Hướng dẫn sử dụng các tính năng trong hệ thống (tìm kiếm công dân, thêm mới, sửa đổi, xuất báo cáo, bản đồ GIS).
Phong cách: Thân thiện, tôn trọng, trả lời súc tích, gạch đầu dòng rõ ràng, định dạng dễ đọc.
`;

/**
 * Trả lời thông minh mặc định khi chưa có API Key (Simulated Civil Knowledge Base)
 */
function getSimulatedResponse(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('chào') || lower.includes('hello') || lower.includes('hi')) {
    return `Chào bạn! Em là **Hạnh** - Trợ lý ảo AI của Hệ thống Quản lý Dân cư CIVIL-PRO 🌸\n\nEm có thể hỗ trợ bạn:\n• Tra cứu thông tin công dân và hộ khẩu\n• Hướng dẫn thủ tục đăng ký thường trú, tạm trú, tạm vắng\n• Quy định về cấp đổi thẻ Căn cước mới\n• Hướng dẫn sử dụng các tính năng trong hệ thống\n\n💡 *Bạn có thể nhấn vào biểu tượng ⚙️ ở góc trên để nhập Gemini API Key cá nhân nhằm kích hoạt trí tuệ nhân tạo toàn diện nhé!*`;
  }

  if (lower.includes('thường trú') || lower.includes('hộ khẩu')) {
    return `📋 **Quy định đăng ký Thường trú (Luật Cư trú 2020):**\n\n1. **Hồ sơ gồm:**\n   • Tờ khai thay đổi thông tin cư trú (Mẫu CT01).\n   • Giấy tờ, tài liệu chứng minh chỗ ở hợp pháp (Sổ đỏ, hợp đồng thuê nhà, văn bản đồng ý của chủ sở hữu...).\n2. **Thời hạn giải quyết:** Tối đa **07 ngày làm việc** kể từ ngày nhận đủ hồ sơ hợp lệ.\n3. **Lưu ý:** Hiện nay toàn bộ thông tin cư trú đã được số hóa trên Cơ sở dữ liệu quốc gia về dân cư, không còn cấp Sổ hộ khẩu giấy.`;
  }

  if (lower.includes('tạm trú')) {
    return `⏱️ **Quy định đăng ký Tạm trú:**\n\n• **Thời hạn khai báo:** Trong thời hạn **30 ngày** kể từ ngày đến chỗ ở hợp pháp mới.\n• **Thời hạn tạm trú:** Tối đa **02 năm** cho mỗi lần đăng ký và có thể gia hạn nhiều lần.\n• **Hồ sơ:** Tờ khai CT01 + Giấy tờ chứng minh chỗ ở hợp pháp (Hợp đồng thuê nhà có chữ ký hai bên).\n• **Thời gian xử lý:** Trong vòng **03 ngày làm việc**.`;
  }

  if (lower.includes('tạm vắng')) {
    return `🚶 **Khai báo Tạm vắng:**\n\n• Áp dụng khi công dân đi khỏi nơi cư trú từ **12 tháng liên tục trở lên** (đối với người không có chỗ ở hợp pháp) hoặc theo yêu cầu quản lý của cơ quan công an.\n• Có thể khai báo trực tiếp tại Công an xã/phường hoặc nộp qua Cổng dịch vụ công Quốc gia / VNeID.`;
  }

  if (lower.includes('cccd') || lower.includes('căn cước') || lower.includes('định danh')) {
    return `🪪 **Quy định Luật Căn cước mới:**\n\n• Thẻ Căn cước chính thức thay thế tên gọi CCCD từ ngày **01/07/2024**.\n• Bổ sung thông tin sinh trắc học mống mắt (Iris) và ADN/giọng nói (tự nguyện).\n• Người từ đủ **14 tuổi** bắt buộc phải cấp thẻ; trẻ em từ **0 đến dưới 14 tuổi** được cấp theo nhu cầu của cha mẹ/người giám hộ.\n• Thẻ CCCD gắn chip đã cấp vẫn có giá trị sử dụng đến hết hạn ghi trên thẻ.`;
  }

  if (lower.includes('tra cứu') || lower.includes('tìm kiếm') || lower.includes('công dân')) {
    return `🔍 **Hướng dẫn tra cứu Công dân trên hệ thống:**\n\n1. Vào phân hệ **"Quản lý công dân"** từ menu bên trái.\n2. Nhập họ tên, mã công dân (CDxxxxxx) hoặc số CCCD vào ô tìm kiếm.\n3. Có thể lọc nhanh theo trạng thái: **Tất cả**, **Thường trú**, **Tạm trú**, **Tạm vắng**.\n4. Bấm vào biểu tượng **Con mắt** để xem hồ sơ chi tiết, hoặc biểu tượng **Cây bút** để cập nhật thông tin.`;
  }

  if (lower.includes('thống kê') || lower.includes('báo cáo') || lower.includes('dân số')) {
    return `📊 **Hệ thống Báo cáo & Thống kê:**\n\n• Bạn có thể truy cập mục **"Thống kê - Báo cáo"** trên menu để xem biểu đồ tháp tuổi, phân bổ giới tính, cơ cấu nghề nghiệp và mật độ dân cư theo từng xã/phường.\n• Hỗ trợ xuất dữ liệu ra file Excel (.xlsx) hoặc PDF chuẩn quy định của Bộ Công an.`;
  }

  return `Cảm ơn bạn đã hỏi! 🌸\n\nEm đã ghi nhận câu hỏi: *"${prompt}"*.\n\nTrong cơ sở dữ liệu dân cư CIVIL-PRO, em khuyên bạn nên kiểm tra kỹ tại phân hệ tương ứng trên thanh điều hướng bên trái.\n\n🔑 **Để em có thể trò chuyện và phân tích sâu hơn bằng AI siêu việt, bạn chỉ cần bấm vào biểu tượng ⚙️ ở góc trên khung chat và dán Google Gemini API Key vào nhé!**`;
}

/**
 * Gửi tin nhắn đến AI (Ưu tiên Gemini API nếu có Key, fallback kiến thức dân cư nếu chưa có)
 */
export async function sendMessageToAi(
  history: ChatMessage[],
  latestPrompt: string,
): Promise<string> {
  const apiKey = getStoredApiKey();

  // Nếu không có API Key, sử dụng cơ chế phản hồi chuyên gia dân cư tích hợp sẵn
  if (!apiKey) {
    // Giả lập độ trễ suy nghĩ của AI một cách tự nhiên (~600ms)
    await new Promise(r => setTimeout(r, 650));
    return getSimulatedResponse(latestPrompt);
  }

  // Gọi Google Gemini 1.5 Flash API
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Chuẩn bị lịch sử hội thoại gần nhất (tối đa 6 tin nhắn để tiết kiệm token)
    const recentHistory = history.slice(-6);
    const contents = [
      ...recentHistory.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
      {
        role: 'user',
        parts: [{ text: latestPrompt }],
      },
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents,
        generationConfig: {
          temperature    : 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.error?.message || `Lỗi API (${response.status})`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (candidateText) {
      return candidateText;
    }

    return 'Em xin lỗi, hiện tại không nhận được phản hồi từ mô hình AI. Vui lòng thử lại sau giây lát!';
  } catch (err: any) {
    // Nếu lỗi kết nối hoặc API key không đúng, thông báo rõ ràng kèm phản hồi dự phòng
    const fallback = getSimulatedResponse(latestPrompt);
    return `⚠️ *Thông báo API:* ${err?.message ?? 'Không thể kết nối đến Gemini'}.\n\n*Phản hồi từ cơ sở tri thức dân cư:*\n\n${fallback}`;
  }
}
