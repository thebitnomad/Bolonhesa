const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Função para fazer upload da figurinha no qu.ax e obter uma URL pública
async function uploadSticker(buffer) {
    const tempFilePath = path.join(__dirname, `temp_sticker_${Date.now()}.webp`);
    fs.writeFileSync(tempFilePath, buffer);

    const form = new FormData();
    form.append('files[]', fs.createReadStream(tempFilePath));

    try {
        const response = await axios.post('https://qu.ax/upload.php', form, {
            headers: form.getHeaders()
        });

        const link = response.data?.files?.[0]?.url;
        if (!link) {
            throw new Error('Nenhuma URL foi retornada na resposta do servidor.');
        }

        return { url: link };
    } catch (error) {
        throw new Error(`Erro no upload da figurinha: ${error.message}`);
    } finally {
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
}

module.exports = {
    name: 'toimg',
    aliases: ['toimage', 'stickertoimg', 'sticker'],
    description: 'Converts stickers to images',
    run: async (context) => {
        const { client, m } = context;

        const formatStylishReply = (message) => {
            return `◈━━━━━━━━━━━━━━━━◈
│❒ ${message}
◈━━━━━━━━━━━━━━━━◈`;
        };

        // Verificar se existe mensagem respondida e se é figurinha
        if (!m.quoted) {
            return client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        `Ei, @${m.sender.split('@')[0]}! 😤 Responda a uma figurinha para eu converter em imagem.
│❒ Exemplo: responda à figurinha e envie o comando .toimg`
                    ),
                    mentions: [m.sender]
                },
                { quoted: m }
            );
        }

        const quotedMime = m.quoted.mimetype || '';
        if (!/webp/.test(quotedMime)) {
            return client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        `Isso não é uma figurinha válida. 😤
│❒ Por favor, responda a um arquivo de figurinha (formato .webp).`
                    )
                },
                { quoted: m }
            );
        }

        let loadingMsg;

        try {
            // 1. Enviar mensagem de carregamento
            loadingMsg = await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        `Convertendo figurinha em imagem... 🎨
│❒ Isso pode levar alguns instantes. ⏳`
                    )
                },
                { quoted: m }
            );

            // 2. Baixar a figurinha
            const stickerBuffer = await m.quoted.download();

            if (!stickerBuffer) {
                if (loadingMsg?.key) {
                    await client.sendMessage(m.chat, { delete: loadingMsg.key }).catch(() => {});
                }
                return client.sendMessage(
                    m.chat,
                    {
                        text: formatStylishReply(
                            `Não foi possível baixar a figurinha.
│❒ Tente novamente com outra figurinha.`
                        )
                    },
                    { quoted: m }
                );
            }

            // 3. Upload da figurinha para obter URL pública
            await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        `Enviando figurinha para conversão... 📤
│❒ Aguarde enquanto preparo a imagem.`
                    )
                },
                { quoted: m }
            );

            const { url: stickerUrl } = await uploadSticker(stickerBuffer);

            // 4. Chamar API de conversão
            await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        `Convertendo para formato de imagem... 🔄
│❒ Quase lá, só mais um pouco.`
                    )
                },
                { quoted: m }
            );

            const encodedUrl = encodeURIComponent(stickerUrl);
            const convertApiUrl = `https://api.elrayyxml.web.id/api/maker/convert?url=${encodedUrl}&format=PNG`;

            const response = await axios.get(convertApiUrl, {
                headers: {
                    accept: 'application/json',
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 30000
            });

            // Validar resposta da API
            if (!response.data.status || !response.data.result) {
                throw new Error('O serviço de conversão não conseguiu processar esta figurinha.');
            }

            const imageUrl = response.data.result;

            // 5. Baixar a imagem convertida
            await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        `Baixando a imagem convertida... 📥
│❒ Finalizando a sua conversão.`
                    )
                },
                { quoted: m }
            );

            const imageResponse = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 20000
            });

            const imageBuffer = Buffer.from(imageResponse.data);

            // 6. Apagar mensagem de carregamento
            if (loadingMsg?.key) {
                await client.sendMessage(m.chat, { delete: loadingMsg.key }).catch(() => {});
            }

            // 7. Enviar como imagem
            await client.sendMessage(
                m.chat,
                {
                    image: imageBuffer,
                    caption: formatStylishReply(
                        `Figurinha convertida em imagem! 🖼️
│❒ Agora você pode usar como uma foto normal.`
                    )
                },
                { quoted: m }
            );

            // 8. Enviar também como documento (melhor qualidade)
            await client.sendMessage(
                m.chat,
                {
                    document: imageBuffer,
                    mimetype: 'image/png',
                    fileName: `converted_sticker_${Date.now()}.png`,
                    caption: formatStylishReply(
                        `Versão PNG em alta qualidade. 📁
│❒ Use esta versão para obter o melhor resultado.`
                    )
                },
                { quoted: m }
            );
        } catch (err) {
            console.error(
                formatStylishReply(
                    `Erro na conversão do comando toimg: ${err.message}`
                )
            );

            // Tentar apagar mensagem de carregamento em caso de erro
            if (loadingMsg?.key) {
                try {
                    await client.sendMessage(m.chat, { delete: loadingMsg.key });
                } catch (_) {
                    // Ignorar erro ao apagar
                }
            }

            let errorMessage;

            if (err.message.includes('timeout')) {
                errorMessage =
                    'A conversão demorou demais e foi interrompida. A figurinha pode estar muito grande.';
            } else if (err.message.includes('Network Error')) {
                errorMessage =
                    'Erro de conexão com o serviço de conversão. Verifique sua internet e tente novamente.';
            } else if (err.message.includes('upload da figurinha')) {
                errorMessage =
                    'Falha ao enviar a figurinha para processamento. Tente novamente em instantes.';
            } else if (err.message.includes('serviço de conversão')) {
                errorMessage =
                    'O serviço de conversão não conseguiu processar essa figurinha específica.';
            } else if (err.message.toLowerCase().includes('animated')) {
                errorMessage =
                    'Figurinhas animadas ainda não são suportadas por este comando.';
            } else {
                errorMessage = err.message || 'Ocorreu um erro inesperado durante a conversão.';
            }

            await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        `Falha na conversão da figurinha. 😤
│❒ Erro: ${errorMessage}
│❒ Dicas:
│❒ • Use apenas figurinhas estáticas
│❒ • Tente com figurinhas menores
│❒ • Verifique sua conexão com a internet`
                    )
                },
                { quoted: m }
            );
        }
    }
};
