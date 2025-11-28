const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m, text, botname } = context;

    const formatStylishReply = (message) => {
        const lines = String(message || '')
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0);
        const body = lines.map((l) => `│❒ ${l}`).join('\n');
        return `◈━━━━━━━━━━━━━━━━◈\n${body}\n◈━━━━━━━━━━━━━━━━◈\n> Pσɯҽɾԃ Ⴆყ Tσxιƈ-ɱԃȥ`;
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
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    };

    if (!text) {
        return m.reply(
            formatStylishReply(
                `Envie um termo para pesquisa. 🔍\n` +
                `Exemplo: *.hentai hinata*`
            )
        );
    }

    try {
        const encodedQuery = encodeURIComponent(text.trim());

        const searchResponse = await fetchWithRetry(
            `https://api.privatezia.biz.id/api/anime/thehentai-search?query=${encodedQuery}`,
            { headers: { Accept: "application/json" }, timeout: 15000 }
        );

        const searchData = await searchResponse.json();

        if (
            !searchData ||
            !searchData.status ||
            !searchData.data ||
            !Array.isArray(searchData.data.posts) ||
            searchData.data.posts.length === 0
        ) {
            return m.reply(
                formatStylishReply(
                    `Não encontrei resultados para a sua pesquisa. 😢\n` +
                    `Tente usar outro termo ou um nome mais específico.`
                )
            );
        }

        const firstResult = searchData.data.posts[0];
        const contentUrl = firstResult.url;
        const title = firstResult.title || 'Sem título disponível';
        const thumbnail = firstResult.imgSrc || null;
        const views = firstResult.views || 'Desconhecido';
        const date = firstResult.date || 'Data não informada';

        const encodedContentUrl = encodeURIComponent(contentUrl);

        const downloadResponse = await fetchWithRetry(
            `https://api.privatezia.biz.id/api/anime/thehentai-download?url=${encodedContentUrl}`,
            { headers: { Accept: "application/json" }, timeout: 15000 }
        );

        const downloadData = await downloadResponse.json();

        if (
            !downloadData ||
            !downloadData.status ||
            !downloadData.data ||
            !Array.isArray(downloadData.data.gallery) ||
            downloadData.data.gallery.length === 0
        ) {
            return m.reply(
                formatStylishReply(
                    `Não consegui carregar a galeria para esse conteúdo. 😢\n` +
                    `Tente novamente mais tarde.`
                )
            );
        }

        const gallery = downloadData.data.gallery;
        const description = downloadData.data.description || 'Sem descrição disponível.';

        for (const image of gallery) {
            const altText = image.alt || 'Imagem da galeria';

            await client.sendMessage(
                m.chat,
                {
                    image: { url: image.imgSrc },
                    caption: formatStylishReply(
                        `🎨 *Conteúdo hentai*\n\n` +
                        `Título: ${title}\n` +
                        `Descrição: ${description}\n` +
                        `Visualizações: ${views}\n` +
                        `Data: ${date}\n` +
                        `Imagem: ${altText}\n\n` +
                        `Enviado por: ${botname || 'Toxic-MD'}`
                    )
                },
                { quoted: m }
            );
        }
    } catch (e) {
        console.error('hentai fetch error:', e);
        m.reply(
            formatStylishReply(
                `Ocorreu um problema ao buscar o conteúdo.\n` +
                `Motivo: ${e.message || e}\n` +
                `Verifique o termo de pesquisa e tente novamente. 😎`
            )
        );
    }
};
