const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m, text } = context;

    const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Powered by 9bot.com.br`;
    };

    const isValidYouTubeUrl = (url) => {
        return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|shorts\/|embed\/)?[A-Za-z0-9_-]{11}(\?.*)?$/.test(
            url
        );
    };

    const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`A API respondeu com status ${response.status}`);
                }
                return response;
            } catch (error) {
                if (attempt === retries || error.type !== "request-timeout") {
                    throw error;
                }
                console.error(
                    `Tentativa ${attempt} falhou: ${error.message}. Tentando novamente em ${delay}ms...`
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    };

    const userText = (text || "").trim();

    if (!userText || !isValidYouTubeUrl(userText)) {
        return client.sendMessage(
            m.chat,
            {
                text: formatStylishReply(
                    "Envie um link válido do YouTube para eu baixar o vídeo pra você. 📹\nExemplo: .ytmp4 https://youtu.be/60ItHLz5WEA"
                ),
            },
            { quoted: m, ad: true }
        );
    }

    try {
        await client.sendMessage(
            m.chat,
            {
                text: formatStylishReply(
                    "Recebi o link! 🎬\nEstou preparando o download do vídeo pra você, aguarde um instante... 🔥📽️"
                ),
            },
            { quoted: m, ad: true }
        );

        const encodedUrl = encodeURIComponent(userText);
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
            return client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        "Não consegui obter o vídeo a partir desse link. 😥\nA API pode estar indisponível. Tente novamente em alguns instantes."
                    ),
                },
                { quoted: m, ad: true }
            );
        }

        const videoUrl = data.result.video.url;
        const title = data.result.title || "Vídeo sem título";
        const quality = data.result.video.quality || "HD";

        const videoIdMatch =
            userText.match(/[?&]v=([^&]+)/)?.[1] ||
            userText.match(/youtu\.be\/([A-Za-z0-9_-]{11})/)?.[1] ||
            userText.match(/\/(shorts|embed)\/([A-Za-z0-9_-]{11})/)?.[2];

        const thumbnailUrl =
            data.result.thumbnail ||
            (videoIdMatch
                ? `https://i.ytimg.com/vi/${videoIdMatch}/hqdefault.jpg`
                : "https://via.placeholder.com/120x90");

        const videoResponse = await fetchWithRetry(videoUrl, { timeout: 15000 });
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
                fileName: `${title}.mp4`,
                caption: formatStylishReply(`🎥 Vídeo baixado com sucesso!\nQualidade: ${quality}`),
                contextInfo: {
                    externalAdReply: {
                        title: "Vídeo do YouTube",
                        body: `Qualidade: ${quality} | Powered by 9bot.com.br`,
                        thumbnailUrl,
                        sourceUrl: userText,
                        mediaType: 2,
                        renderLargerThumbnail: true,
                    },
                },
            },
            { quoted: m, ad: true }
        );
    } catch (error) {
        console.error("YouTube video download error:", error);
        await client.sendMessage(
            m.chat,
            {
                text: formatStylishReply(
                    `Não consegui baixar esse vídeo agora. 😥\n\nDetalhes: ${error.message}\nVerifique o link e tente novamente em alguns instantes.`
                ),
            },
            { quoted: m, ad: true }
        );
    }
};
