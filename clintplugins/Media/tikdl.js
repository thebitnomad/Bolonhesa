const fetch = require("node-fetch");
const AbortController = require("abort-controller");

module.exports = async (context) => {
    const { client, botname, m, text } = context;

    const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Pσɯҽɾԃ Ⴆყ Tσxιƈ-ɱԃȥ`;
    };

    const logStyled = (message, type = "log") => {
        const styled = formatStylishReply(message);
        if (type === "error") {
            console.error(styled);
        } else if (type === "warn") {
            console.warn(styled);
        } else {
            console.log(styled);
        }
    };

    const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1500) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            const controller = new AbortController();
            const timeout = setTimeout(
                () => controller.abort(),
                options.timeout || 15000
            );

            try {
                logStyled(`Tentativa ${attempt} para buscar dados em:\n${url}`);
                const res = await fetch(url, {
                    ...options,
                    signal: controller.signal,
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 Chrome/120.0",
                        Accept: "application/json, text/plain, */*",
                        ...(options.headers || {}),
                    },
                });

                clearTimeout(timeout);

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                return res;
            } catch (err) {
                clearTimeout(timeout);

                if (attempt === retries) {
                    logStyled(
                        `Falha definitiva ao buscar dados: ${err.message}`,
                        "error"
                    );
                    throw err;
                }

                logStyled(
                    `Tentativa ${attempt} falhou: ${err.message}\nAguardando ${delay}ms para tentar novamente...`,
                    "warn"
                );
                await new Promise((r) => setTimeout(r, delay));
            }
        }
    };

    if (!text) {
        return m.reply(
            formatStylishReply(
                "Envie um link válido do *TikTok* para eu baixar o vídeo pra você. 📹\nExemplo: .tiktokdl https://vm.tiktok.com/ZMABNTpt6/"
            )
        );
    }

    if (!text.includes("tiktok.com")) {
        return m.reply(
            formatStylishReply(
                "Esse link não parece ser do *TikTok*.\nVerifique o endereço e tente novamente. 😉"
            )
        );
    }

    try {
        const encodedUrl = encodeURIComponent(text);

        const metadataResponse = await fetchWithRetry(
            `https://api.privatezia.biz.id/api/downloader/alldownload?url=${encodedUrl}`,
            { timeout: 15000 }
        );

        const data = await metadataResponse.json();

        if (!data?.status || !data?.result?.video?.url) {
            return m.reply(
                formatStylishReply(
                    "Não encontrei nenhum vídeo nesse link. 😢\nEle pode estar privado, indisponível ou a API pode estar instável."
                )
            );
        }

        const videoUrl = data.result.video.url;
        const tikDescription = data.result.title || "Sem descrição disponível";

        const caption = formatStylishReply(
            `🎥 Vídeo do TikTok\n\n📌 *Descrição:* ${tikDescription}`
        );

        m.reply(
            formatStylishReply(
                "Encontrei o vídeo! 🎬\nEstou baixando e já te envio, aguarde só um instante..."
            )
        );

        const videoRes = await fetchWithRetry(videoUrl, { timeout: 20000 });
        const buffer = Buffer.from(await videoRes.arrayBuffer());

        await client.sendMessage(
            m.chat,
            {
                video: buffer,
                mimetype: "video/mp4",
                caption,
            },
            { quoted: m }
        );
    } catch (error) {
        logStyled(`Erro ao baixar vídeo do TikTok: ${error.message}`, "error");
        m.reply(
            formatStylishReply(
                `Não consegui baixar esse vídeo agora. 😥\n\nDetalhes: ${error.message}\nTente novamente em alguns instantes ou envie outro link.`
            )
        );
    }
};
