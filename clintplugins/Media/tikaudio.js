const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m, text, fetchJson } = context;

    const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Pσɯҽɾԃ Ⴆყ Tσxιƈ-ɱԃȥ`;
    };

    const fetchTikTokData = async (url, retries = 3, delay = 1500) => {
        let lastError;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const data = await fetchJson(url);

                if (
                    data &&
                    (data.status === 200 || data.status === true) &&
                    data.tiktok &&
                    data.tiktok.music
                ) {
                    return data;
                }

                lastError = new Error("Resposta da API inválida ou incompleta.");
            } catch (err) {
                lastError = err;
            }

            if (attempt < retries) {
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        throw lastError || new Error("Falha ao obter dados do TikTok após várias tentativas.");
    };

    try {
        const link = (text || "").trim();

        if (!link) {
            return m.reply(
                formatStylishReply(
                    "Envie um link válido do *TikTok* para eu baixar o áudio pra você. 🎶"
                )
            );
        }

        if (!link.includes("tiktok.com")) {
            return m.reply(
                formatStylishReply(
                    "Esse link não parece ser do *TikTok*.\nVerifique o endereço e tente novamente. 😉"
                )
            );
        }

        const apiUrl = `https://api.dreaded.site/api/tiktok?url=${encodeURIComponent(link)}`;

        await m.reply(
            formatStylishReply(
                "Um instante... 🔍\nEstou buscando o áudio desse TikTok pra você."
            )
        );

        const data = await fetchTikTokData(apiUrl);
        const tikAudioUrl = data.tiktok.music;

        if (!tikAudioUrl) {
            throw new Error("Não encontrei o áudio desse TikTok na resposta da API.");
        }

        await m.reply(
            formatStylishReply(
                "Áudio encontrado com sucesso! 🎧\nEnviando o arquivo para você agora..."
            )
        );

        const response = await fetch(tikAudioUrl);

        if (!response.ok) {
            throw new Error(`Falha ao baixar o áudio: HTTP ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);

        await client.sendMessage(
            m.chat,
            {
                audio: audioBuffer,
                mimetype: "audio/mpeg",
                ptt: false,
            },
            { quoted: m }
        );
    } catch (error) {
        const errMsg =
            error && error.message
                ? error.message
                : "Ocorreu um erro desconhecido ao processar o áudio do TikTok.";

        m.reply(
            formatStylishReply(
                `Não consegui baixar o áudio desse TikTok agora. 😥\n\nDetalhes: ${errMsg}\nTente novamente em alguns instantes ou envie outro link.`
            )
        );
    }
};
