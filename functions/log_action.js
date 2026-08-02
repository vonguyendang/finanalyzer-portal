export async function onRequest(context) {
    const { request, env } = context;
    
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json; charset=utf-8'
    };

    // Xử lý preflight request
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        let appId = 'unknown';
        
        // Nhận dữ liệu từ GET hoặc POST
        if (request.method === 'POST') {
            const data = await request.json();
            if (data && data.app_id) {
                appId = data.app_id;
            }
        } else if (request.method === 'GET') {
            const url = new URL(request.url);
            const paramAppId = url.searchParams.get('app_id');
            if (paramAppId) {
                appId = paramAppId;
            }
        }

        // Cập nhật biến đếm nhanh
        if (appId !== 'home' && appId !== 'unknown') {
            // Đọc dữ liệu cũ
            let realStats = await env.FINANALYZER_KV.get('real_stats', { type: 'json' });
            if (!realStats || typeof realStats !== 'object') {
                realStats = {};
            }
            
            // Tăng biến đếm
            if (!realStats[appId]) {
                realStats[appId] = 0;
            }
            realStats[appId]++;
            
            // Lưu lại vào KV
            await env.FINANALYZER_KV.put('real_stats', JSON.stringify(realStats));
        }

        return new Response(JSON.stringify({
            status: "success",
            message: "Tracking data saved"
        }), { headers: corsHeaders });
        
    } catch (err) {
        return new Response(JSON.stringify({
            status: "error",
            message: err.message || "Invalid payload"
        }), { status: 400, headers: corsHeaders });
    }
}
