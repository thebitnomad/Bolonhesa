const fetch = require("node-fetch");
const ytdl = require("ytdl-core");

module.exports = async (context) => {
    const { client, m, text, botname } = context;

    const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Powered by 9bot.com.br`;
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

    const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`API respondeu com status ${response.status}`);
                }
                return response;
            } catch (error) {
                if (attempt === retries || error.type !== "request-timeout") {
                    throw error;
                }
                logStyled(
                    `Tentativa ${attempt} falhou: ${error.message}. Tentando novamente em ${delay}ms...`,
                    "warn"
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    };

    if (!botname) {
        return m.reply(
            formatStylishReply(
                "Configuração incompleta: o nome do bot não está definido.\nPeça ao desenvolvedor para ajustar isso."
            )
        );
    }

    if (!text) {
        return m.reply(
            formatStylishReply(
                `Oi, ${m.pushName || "usuário"}! 😊\nVocê esqueceu de enviar o link do YouTube.\n\nExemplo: .ytmp3 https://youtube.com/watch?v=exemplo`
            )
        );
    }

    const urls =
        text.match(
            /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?[a-zA-Z0-9_-]{11})/gi
        ) || [];

    if (!urls.length) {
        return m.reply(
            formatStylishReply(
                `Esse link não parece ser um link válido do YouTube, ${
                    m.pushName || "usuário"
                }.\nVerifique o endereço e tente novamente. 😉`
            )
        );
    }

    try {
        const encodedUrl = encodeURIComponent(text);
        const response = await fetchWithRetry(
            `https://api.privatezia.biz.id/api/downloader/alldownload?url=${encodedUrl}`,
            {
                timeout: 15000,
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    Accept: "application/json",
                },
            }
        );

        const data = await response.json();

        if (!data || !data.result || !data.result.audio || !data.result.audio.url) {
            throw new Error(
                "API não retornou áudio disponível. fallback" // mantém a palavra-chave para o fallback
            );
        }

        const title = data.result.title || "Sem título disponível";
        const audioUrl = data.result.audio.url;
        const mimeType =
            data.result.audio.type === "mp3" ? "audio/mpeg" : "audio/mpeg";
        const quality = data.result.audio.quality || "128kbps";

        // Validação do arquivo de áudio
        const headResponse = await fetchWithRetry(audioUrl, {
            method: "HEAD",
            timeout: 5000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        const contentLength = headResponse.headers.get("content-length");

        if (
            !headResponse.ok ||
            !contentLength ||
            parseInt(contentLength) > 16 * 1024 * 1024
        ) {
            logStyled(
                `Arquivo de áudio inválido ou grande demais em ${audioUrl}, tamanho: ${contentLength}`,
                "warn"
            );
            throw new Error(
                "Arquivo de áudio retornado pela API está inconsistente. messed up"
            );
        }

        await m.reply(
            formatStylishReply(
                `Baixando o áudio: *${title}* 🎶\nQualidade: ${quality}`
            )
        );

        // Envia como áudio
        try {
            await client.sendMessage(
                m.chat,
                {
                    audio: { url: audioUrl },
                    fileName: `${title}.mp3`,
                    mimetype: mimeType,
                },
                { quoted: m }
            );
        } catch (audioError) {
            logStyled(
                `Falha ao enviar áudio via API principal: ${audioError.message}`,
                "error"
            );
            throw new Error(`Couldn’t send audio: ${audioError.message}`);
        }

        // Envia também como documento
        try {
            await client.sendMessage(
                m.chat,
                {
                    document: { url: audioUrl },
                    fileName: `${title}.mp3`,
                    mimetype: mimeType,
                },
                { quoted: m }
            );
        } catch (docError) {
            logStyled(
                `Falha ao enviar documento via API principal: ${docError.message}`,
                "error"
            );
            throw new Error(`Couldn’t send document: ${docError.message}`);
        }

        await client.sendMessage(
            m.chat,
            { text: "> Powered by 9bot.com.br" },
            { quoted: m }
        );
    } catch (error) {
        logStyled(`Erro no comando ytmp3: ${error.message}`, "error");

        // Fallback para ytdl-core
        if (
            error.message.includes("fallback") ||
            error.message.includes("messed up") ||
            error.message.includes("Couldn’t send")
        ) {
            try {
                logStyled(`Alternando para fallback com ytdl-core para: ${text}`, "warn");

                const info = await ytdl.getInfo(text);
                const format = ytdl.chooseFormat(info.formats, {
                    filter: "audioonly",
                    quality: "highestaudio",
                });

                const audioUrl = format.url;
                const title = info.videoDetails.title;
                const mimeType = "audio/mpeg";

                await m.reply(
                    formatStylishReply(
                        `A API principal falhou, mas estou baixando *${title}* com o plano de backup. 🎧`
                    )
                );

                // Envia áudio pelo fallback
                try {
                    await client.sendMessage(
                        m.chat,
                        {
                            audio: { url: audioUrl },
                            fileName: `${title}.mp3`,
                            mimetype: mimeType,
                        },
                        { quoted: m }
                    );
                } catch (audioError) {
                    logStyled(
                        `Falha ao enviar áudio pelo fallback: ${audioError.message}`,
                        "error"
                    );
                    throw new Error(
                        `Falha ao enviar o áudio pelo fallback: ${audioError.message}`
                    );
                }

                // Envia também documento pelo fallback
                try {
                    await client.sendMessage(
                        m.chat,
                        {
                            document: { url: audioUrl },
                            fileName: `${title}.mp3`,
                            mimetype: mimeType,
                        },
                        { quoted: m }
                    );
                } catch (docError) {
                    logStyled(
                        `Falha ao enviar documento pelo fallback: ${docError.message}`,
                        "error"
                    );
                    throw new Error(
                        `Falha ao enviar o documento pelo fallback: ${docError.message}`
                    );
                }

                await client.sendMessage(
                    m.chat,
                    { text: "> Powered by 9bot.com.br" },
                    { quoted: m }
                );
                return;
            } catch (fallbackError) {
                logStyled(
                    `Erro ao usar fallback com ytdl-core: ${fallbackError.message}`,
                    "error"
                );
                return m.reply(
                    formatStylishReply(
                        `Não consegui concluir o download desse áudio. 😢\n\nDetalhes: ${fallbackError.message}\nTente outro link ou tente novamente em alguns instantes.`
                    )
                );
            }
        }

        return m.reply(
            formatStylishReply(
                `Algo deu errado ao processar esse link. 😥\n\nDetalhes: ${error.message}\nTente novamente ou envie outro vídeo.`
            )
        );
    }
};
