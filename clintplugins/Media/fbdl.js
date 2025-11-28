const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m, text, botname } = context;

    const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Powered by 9bot.com.br`;
    };

    const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`A API retornou o status ${response.status}`);
                }
                return response;
            } catch (error) {
                if (attempt === retries || error.type !== "request-timeout") {
                    throw error;
                }
                console.error(`Tentativa ${attempt} falhou: ${error.message}. Tentando novamente em ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    };

    if (!text) {
        return m.reply(
            formatStylishReply(
                `Envie um link válido do *Facebook* para baixar o vídeo.\n` +
                `Exemplo: .facebookdl https://www.facebook.com/reel/2892722884261200`
            )
        );
    }

    if (!text.includes("facebook.com")) {
        return m.reply(
            formatStylishReply(
                `Isso não parece ser um link válido do *Facebook*.\n` +
                `Verifique o link e tente novamente.`
            )
        );
    }

    try {
        const encodedUrl = encodeURIComponent(text.trim());
        const apiUrl = `https://api.fikmydomainsz.xyz/download/facebook?url=${encodedUrl}`;

        const response = await fetchWithRetry(apiUrl, {
            headers: { Accept: "application/json" },
            timeout: 20000
        });

        const data = await response.json();

        // Valida resposta da API
        if (!data.status || !data.result || !data.result.video || data.result.video.length === 0) {
            return m.reply(
                formatStylishReply(
                    `Não foi possível localizar um vídeo nesse link ou o serviço está indisponível.\n` +
                    `Tente outro link ou aguarde alguns instantes. 😢`
                )
            );
        }

        const result = data.result;

        // Pega a primeira URL de vídeo disponível
        const videoUrl = result.video[0].url;

        const title = result.title || "Vídeo do Facebook";
        const duration = result.duration || "Desconhecida";
        const quality = result.video[0].quality || "HD";

        await client.sendMessage(
            m.chat,
            {
                video: { url: videoUrl },
                caption: formatStylishReply(
                    `🎥 *Vídeo do Facebook baixado*\n\n` +
                    `📌 *Título:* ${title}\n` +
                    `⏱ *Duração:* ${duration}\n` +
                    `🎞 *Qualidade:* ${quality}\n` +
                    `📥 Baixado por *${botname || '9bot'}*`
                ),
                gifPlayback: false
            },
            { quoted: m }
        );

    } catch (e) {
        console.error("Facebook DL Error:", e);
        m.reply(
            formatStylishReply(
                `Não foi possível concluir o download do vídeo.\n` +
                `Motivo: ${e.message || e}\n\n` +
                `Verifique o link ou tente novamente mais tarde. 🚫`
            )
        );
    }
};
