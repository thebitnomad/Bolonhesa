const fetch = require('node-fetch');
const FormData = require('form-data');

module.exports = async (context) => {
    const { client, m, text, botname } = context;

    const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
    };

    if (!botname) {
        return m.reply(
            formatStylishReply(
                'Erro de configuração: o nome do bot não está definido.\nAvise o desenvolvedor para ajustar o bot.'
            )
        );
    }

    if (!text && !m.quoted) {
        return m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Olá, ${m.pushName}.
│❒ Você precisa enviar a URL de uma imagem ou responder a uma imagem.
│❒ Exemplo: *.remini https://exemplo.com/imagem.png* ou responda a uma imagem com *.remini*.
◈━━━━━━━━━━━━━━━━◈`
        );
    }

    let imageUrl = text;

    // Trata imagem respondida (quoted)
    if (!text && m.quoted && m.quoted.mtype === 'imageMessage') {
        try {
            const buffer = await client.downloadMediaMessage(m.quoted);
            const form = new FormData();
            form.append('file', buffer, { filename: 'image.png' });

            // Upload para serviço temporário
            const uploadResponse = await fetch('https://files.giftedtech.web.id/upload', {
                method: 'POST',
                body: form,
                headers: form.getHeaders(),
                timeout: 10000
            });

            if (!uploadResponse.ok) {
                throw new Error(`Upload falhou com status ${uploadResponse.status}`);
            }

            const uploadData = await uploadResponse.json();
            if (!uploadData.url) {
                throw new Error('O serviço de upload não retornou uma URL válida.');
            }

            imageUrl = uploadData.url;
        } catch (uploadError) {
            console.error(`Failed to upload quoted image: ${uploadError.message}`);
            return m.reply(
                formatStylishReply(
                    `Não foi possível enviar a imagem respondida.\nDetalhes: ${uploadError.message}`
                )
            );
        }
    }

    if (!imageUrl) {
        return m.reply(
            formatStylishReply(
                'Nenhuma URL de imagem válida ou imagem respondida foi detectada.\nVerifique e tente novamente.'
            )
        );
    }

    try {
        const encodedUrl = encodeURIComponent(imageUrl);
        const apiUrl = `https://api.giftedtech.web.id/api/tools/remini?apikey=gifted_api_se5dccy&url=${encodedUrl}`;
        const response = await fetch(apiUrl, {
            timeout: 10000,
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`A API retornou o status ${response.status}`);
        }

        const data = await response.json();
        if (!data.success || !data.result || !data.result.image_url) {
            return m.reply(
                formatStylishReply(
                    `A API não conseguiu gerar uma versão melhorada da imagem.\n${
                        data.msg || 'Tente novamente em alguns instantes.'
                    }`
                )
            );
        }

        const { image_url } = data.result;

        // Mensagem de processo
        await m.reply(
            formatStylishReply('Realçando a imagem... Aguarde alguns instantes. 🖼️')
        );

        // Verifica se a URL da imagem está acessível
        const urlCheck = await fetch(image_url, {
            method: 'HEAD',
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!urlCheck.ok) {
            // Busca a imagem como buffer se a URL não estiver acessível diretamente
            const imageResponse = await fetch(image_url, {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!imageResponse.ok) {
                throw new Error(`Não foi possível acessar a imagem. Status ${imageResponse.status}`);
            }

            const imageBuffer = await imageResponse.buffer();

            try {
                await client.sendMessage(
                    m.chat,
                    {
                        image: imageBuffer,
                        fileName: 'enhanced_image.png'
                    },
                    { quoted: m }
                );
            } catch (sendError) {
                console.error(`Failed to send image: ${sendError.message}`);
                throw new Error(`Não foi possível enviar a imagem melhorada.\n${sendError.message}`);
            }
        } else {
            try {
                await client.sendMessage(
                    m.chat,
                    {
                        image: { url: image_url },
                        fileName: 'enhanced_image.png'
                    },
                    { quoted: m }
                );
            } catch (sendError) {
                console.error(`Failed to send image: ${sendError.message}`);
                throw new Error(`Não foi possível enviar a imagem melhorada.\n${sendError.message}`);
            }
        }

        // Envia legenda final
        await client.sendMessage(
            m.chat,
            {
                text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Imagem realçada com sucesso. ✨
◈━━━━━━━━━━━━━━━━◈
Powered by *${botname}*`
            },
            { quoted: m }
        );
    } catch (error) {
        console.error(`Error in remini: ${error.message}`);
        await m.reply(
            formatStylishReply(
                `Não foi possível realçar a imagem no momento.\nDetalhes: ${error.message}`
            )
        );
    }
};
