const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m, text, botname } = context;

    const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Pσɯҽɾԃ Ⴆყ Tσxιƈ-ɱԃȥ`;
    };

    const logStyled = (message) => {
        console.log(formatStylishReply(message));
    };

    const fetchWithRetry = async (url, options = {}, retries = 3, delay = 2000) => {
        const defaultOptions = {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                Accept: "*/*",
                "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                Referer: "https://www.instagram.com/",
                DNT: "1",
            },
            timeout: 30000,
        };

        const finalOptions = { ...defaultOptions, ...options };
        const targetUrl = url.trim();

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                logStyled(`Tentativa ${attempt} para: ${targetUrl}`);
                const response = await fetch(targetUrl, finalOptions);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response;
            } catch (error) {
                logStyled(`Tentativa ${attempt} falhou: ${error.message}`);

                if (attempt === retries) {
                    throw error;
                }

                logStyled(`Tentando novamente em ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 1.5; // Backoff exponencial
            }
        }
    };

    const userText = (text || "").trim();

    if (!userText) {
        return m.reply(
            formatStylishReply(
                "Envie um link válido do Instagram para eu baixar o vídeo pra você. 📹\n\nExemplo: .instagramdl https://www.instagram.com/reel/DOlTuNlEsDm/"
            )
        );
    }

    if (!userText.includes("instagram.com")) {
        return m.reply(
            formatStylishReply(
                "Esse não parece ser um link válido do Instagram. Verifique o endereço e tente novamente."
            )
        );
    }

    try {
        const encodedUrl = encodeURIComponent(userText);
        const apiUrl = `https://api.privatezia.biz.id/api/downloader/alldownload?url=${encodedUrl}`;

        logStyled(`Buscando na API: ${apiUrl}`);

        const response = await fetchWithRetry(apiUrl);
        const data = await response.json();

        if (!data?.status || !data?.result?.video?.url) {
            return m.reply(
                formatStylishReply(
                    "Não encontrei nenhum vídeo nesse link. Ele pode estar privado, indisponível ou inválido."
                )
            );
        }

        const igVideoUrl = data.result.video.url;
        const title = (data.result.title || "Vídeo do Instagram").trim();

        logStyled(`URL do vídeo encontrada: ${igVideoUrl}`);

        await client.sendMessage(
            m.chat,
            {
                video: { url: igVideoUrl },
                mimetype: "video/mp4",
                caption: formatStylishReply(
                    `🎥 Vídeo do Instagram\n\n📌 *Título:* ${title}`
                ),
                gifPlayback: false,
            },
            { quoted: m }
        );
    } catch (error) {
        console.error(formatStylishReply(`Erro ao baixar vídeo do Instagram: ${error.message}`));

        let errorMessage = "Não consegui baixar o vídeo. ";

        const message = (error.message || "").toLowerCase();

        if (message.includes("timeout")) {
            errorMessage +=
                "A requisição expirou. O vídeo pode ser muito grande ou o servidor pode estar lento.";
        } else if (message.includes("404") || message.includes("403")) {
            errorMessage +=
                "O vídeo não foi encontrado ou o acesso foi negado. Verifique se o link está público.";
        } else if (message.includes("network") || message.includes("fetch")) {
            errorMessage +=
                "Parece que houve um problema de conexão. Confira sua internet e tente novamente.";
        } else {
            errorMessage += error.message;
        }

        m.reply(formatStylishReply(errorMessage));
    }
};
