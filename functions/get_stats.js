const INITIAL_FAKE_STATS = {
    "bctc": 1254,
    "kthkd": 842,
    "tracuu-hkd": 2038,
    "tncn": 3125,
    "vat": 1563,
    "bhxh1lan": 892,
    "gross-net": 4207,
    "bhtn": 671,
    "thaisan": 1504,
    "laivay": 2345,
    "khanangvay": 1254,
    "tietkiem": 1840
};

export async function onRequest(context) {
    const { env } = context;
    
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json; charset=utf-8'
    };

    try {
        // Lấy real stats từ KV
        let realStats = await env.FINANALYZER_KV.get('real_stats', { type: 'json' });
        if (!realStats || typeof realStats !== 'object') {
            realStats = {};
        }

        // Lấy fake stats state từ KV
        let fakeState = await env.FINANALYZER_KV.get('fake_stats_state', { type: 'json' });
        
        const currentHour = Math.floor(Date.now() / 1000 / 3600);

        if (!fakeState || typeof fakeState !== 'object' || !fakeState.last_hour || !fakeState.stats) {
            fakeState = {
                last_hour: currentHour,
                stats: { ...INITIAL_FAKE_STATS }
            };
            await env.FINANALYZER_KV.put('fake_stats_state', JSON.stringify(fakeState));
        }

        let hoursPassed = currentHour - fakeState.last_hour;
        if (hoursPassed > 0) {
            if (hoursPassed > 24 * 30) hoursPassed = 24 * 30; // Max 30 days
            
            const appKeys = Object.keys(INITIAL_FAKE_STATS);
            const totalApps = appKeys.length;

            for (let i = 0; i < hoursPassed; i++) {
                const numAppsToUpdate = Math.floor(Math.random() * (totalApps + 1));
                if (numAppsToUpdate > 0) {
                    // Chọn ngẫu nhiên numAppsToUpdate ứng dụng
                    const shuffled = [...appKeys].sort(() => 0.5 - Math.random());
                    const selectedApps = shuffled.slice(0, numAppsToUpdate);
                    
                    for (const appKey of selectedApps) {
                        const increase = Math.floor(Math.random() * 51); // 0-50
                        if (!fakeState.stats[appKey]) {
                            fakeState.stats[appKey] = 0;
                        }
                        fakeState.stats[appKey] += increase;
                    }
                }
            }
            
            fakeState.last_hour = currentHour;
            await env.FINANALYZER_KV.put('fake_stats_state', JSON.stringify(fakeState));
        }

        // Combine stats
        const finalStats = { ...realStats };
        for (const [app, count] of Object.entries(fakeState.stats)) {
            if (!finalStats[app]) {
                finalStats[app] = 0;
            }
            finalStats[app] += count;
        }

        return new Response(JSON.stringify({
            status: "success",
            data: finalStats
        }), { headers: corsHeaders });
        
    } catch (err) {
        return new Response(JSON.stringify({
            status: "error",
            message: err.message
        }), { status: 500, headers: corsHeaders });
    }
}
