const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m, text, botname } = context;

    const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Powered by 9bot.com.br`;
    };

    const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`API respondeu com status ${response.status}`);
                }
                return response;
            } catch (error) {
                if (attempt === retries) {
                    throw error;
                }
                console.error(
                    `Tentativa ${attempt} falhou: ${error.message}. Tentando novamente em ${delay}ms...`
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    };

    if (!text) {
        return m.reply(
            formatStylishReply(
                "Envie um link válido do Twitter/X para eu baixar o vídeo pra você. 📹\nExemplo: .twitterdl https://x.com/user/status/123"
            )
        );
    }

    if (!text.includes("twitter.com") && !text.includes("x.com")) {
        return m.reply(
            formatStylishReply(
                "Esse link não parece ser do Twitter/X. Verifique o endereço e tente novamente. 😉"
            )
        );
    }

    try {
        const encodedUrl = encodeURIComponent(text);
        const response = await fetchWithRetry(
            `https://api.privatezia.biz.id/api/downloader/alldownload?url=${encodedUrl}`,
            { headers: { Accept: "application/json" }, timeout: 15000 }
        );

        const data = await response.json();

        if (
            !data ||
            !data.status ||
            !data.result ||
            !data.result.video ||
            !data.result.video.url
        ) {
            return m.reply(
                formatStylishReply(
                    "Não encontrei nenhum vídeo nesse link. 😢\nTente novamente mais tarde ou envie outro vídeo."
                )
            );
        }

        const twtvid = data.result.video.url;
        const title = data.result.title || "Título não disponível";

        if (!twtvid) {
            return m.reply(
                formatStylishReply(
                    "Não consegui obter os dados desse vídeo do Twitter/X.\nVerifique se o vídeo existe e está público."
                )
            );
        }

        const videoResponse = await fetchWithRetry(twtvid, { timeout: 15000 });

        if (!videoResponse.ok) {
            throw new Error(`Falha ao baixar o vídeo: HTTP ${videoResponse.status}`);
        }

        const arrayBuffer = await videoResponse.arrayBuffer();
        const videoBuffer = Buffer.from(arrayBuffer);

        await client.sendMessage(
            m.chat,
            {
                video: videoBuffer,
                mimetype: "video/mp4",
                caption: formatStylishReply(
                    `🎥 Vídeo do Twitter/X\n\n📌 *Título:* ${title}`
                ),
                gifPlayback: false,
            },
            { quoted: m }
        );
    } catch (e) {
        console.error("Twitter/X download error:", e);
        m.reply(
            formatStylishReply(
                `Não consegui baixar esse vídeo agora. 😥\n\nDetalhes: ${e.message}\nVerifique o link e tente novamente.`
            )
        );
    }
};
