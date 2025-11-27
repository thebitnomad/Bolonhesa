const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Função de upload: envia a imagem para qu.ax e retorna a URL
async function uploadImage(buffer) {
    const tempFilePath = path.join(__dirname, `temp_${Date.now()}.jpg`);
    fs.writeFileSync(tempFilePath, buffer);

    const form = new FormData();
    form.append('files[]', fs.createReadStream(tempFilePath));

    try {
        const response = await axios.post('https://qu.ax/upload.php', form, {
            headers: form.getHeaders(),
        });

        const link = response.data?.files?.[0]?.url;
        if (!link) throw new Error('No URL returned in response');

        fs.unlinkSync(tempFilePath);
        return { url: link };
    } catch (error) {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        throw new Error(`Upload error: ${error.message}`);
    }
}

module.exports = {
    name: 'removebg',
    aliases: ['nobg', 'rmbg', 'transparent'],
    description: 'Remove o fundo de imagens usando IA',
    run: async (context) => {
        const { client, m, mime } = context;

        // Define se a imagem vem da mensagem respondida ou da própria mensagem
        const quoted = m.quoted ? m.quoted : m;
        const quotedMime = quoted.mimetype || mime || '';

        if (!/image/.test(quotedMime)) {
            return client.sendMessage(
                m.chat,
                {
                    text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Olá, @${m.sender.split('@')[0]}!
│❒ Por favor, responda a uma *imagem* para remover o fundo.
│❒ Exemplo: responda a uma imagem com *.removebg*
◈━━━━━━━━━━━━━━━━◈`,
                    mentions: [m.sender]
                },
                { quoted: m }
            );
        }

        // Mensagem de carregamento
        const loadingMsg = await client.sendMessage(
            m.chat,
            {
                text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Removendo o fundo da imagem... 🎨
│❒ Isso pode levar alguns instantes ⏳
◈━━━━━━━━━━━━━━━━◈`
            },
            { quoted: m }
        );

        try {
            // Etapa 1: baixar a imagem
            const media = await quoted.download();

            if (!media) {
                await client.sendMessage(m.chat, { delete: loadingMsg.key });
                return client.sendMessage(
                    m.chat,
                    {
                        text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Não foi possível baixar a imagem.
│❒ Tente novamente com outra imagem.
◈━━━━━━━━━━━━━━━━◈`
                    },
                    { quoted: m }
                );
            }

            // Etapa 2: checar limite de tamanho (10MB)
            if (media.length > 10 * 1024 * 1024) {
                await client.sendMessage(m.chat, { delete: loadingMsg.key });
                return client.sendMessage(
                    m.chat,
                    {
                        text:
`◈━━━━━━━━━━━━━━━━◈
│❒ A imagem é muito grande.
│❒ Tamanho máximo permitido: *10MB*.
◈━━━━━━━━━━━━━━━━◈`
                    },
                    { quoted: m }
                );
            }

            // Etapa 3: upload da imagem para obter URL pública
            await client.sendMessage(
                m.chat,
                {
                    text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Enviando a imagem para processamento... 📤
◈━━━━━━━━━━━━━━━━◈`
                },
                { quoted: m }
            );

            const { url: imageUrl } = await uploadImage(media);

            // Etapa 4: chamar a API de remoção de fundo
            await client.sendMessage(
                m.chat,
                {
                    text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Processando a imagem com IA... 🤖
│❒ Removendo o fundo...
◈━━━━━━━━━━━━━━━━◈`
                },
                { quoted: m }
            );

            const encodedUrl = encodeURIComponent(imageUrl);
            const removeBgApiUrl = `https://api.ootaizumi.web.id/tools/removebg?imageUrl=${encodedUrl}`;
            
            const response = await axios.get(removeBgApiUrl, {
                headers: { 
                    accept: 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 60000 // 60 segundos de timeout
            });

            // Valida resposta da API
            if (!response.data.status || !response.data.result) {
                throw new Error('Background removal API failed to process the image');
            }

            const transparentImageUrl = response.data.result;

            // Etapa 5: baixar a imagem com fundo removido
            await client.sendMessage(
                m.chat,
                {
                    text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Baixando o resultado... 📥
◈━━━━━━━━━━━━━━━━◈`
                },
                { quoted: m }
            );

            const transparentResponse = await axios.get(transparentImageUrl, {
                responseType: 'arraybuffer',
                timeout: 30000
            });

            const transparentImage = Buffer.from(transparentResponse.data);

            // Etapa 6: apagar mensagem de carregamento e enviar resultado
            await client.sendMessage(m.chat, { delete: loadingMsg.key });

            await client.sendMessage(
                m.chat,
                { 
                    image: transparentImage, 
                    caption:
`◈━━━━━━━━━━━━━━━━◈
│❒ Fundo removido com sucesso! ✨
│❒ A imagem agora está transparente.
│❒ Perfeita para criar figurinhas. 🎨
◈━━━━━━━━━━━━━━━━◈`
                },
                { quoted: m }
            );

            // Também envia como documento PNG para melhor qualidade, se for o caso
            if (transparentResponse.headers['content-type']?.includes('png')) {
                await client.sendMessage(
                    m.chat,
                    {
                        document: transparentImage,
                        mimetype: 'image/png',
                        fileName: `transparent_bg_${Date.now()}.png`,
                        caption:
`◈━━━━━━━━━━━━━━━━◈
│❒ Versão PNG (alta qualidade)
│❒ Ideal para uso em figurinhas. 🎨
◈━━━━━━━━━━━━━━━━◈`
                    },
                    { quoted: m }
                );
            }

        } catch (err) {
            console.error('RemoveBG error:', err);
            
            // Apaga mensagem de carregamento em caso de erro
            try {
                await client.sendMessage(m.chat, { delete: loadingMsg.key });
            } catch (e) {
                // Ignora erro ao apagar
            }

            let errorMessage = 'Ocorreu um erro inesperado.';

            if (err.message.includes('timeout')) {
                errorMessage = 'O processamento excedeu o tempo limite. A imagem pode ser muito complexa ou o servidor está ocupado.';
            } else if (err.message.includes('Network Error')) {
                errorMessage = 'Erro de rede. Verifique sua conexão e tente novamente.';
            } else if (err.message.includes('Upload error')) {
                errorMessage = 'Falha ao enviar a imagem para processamento.';
            } else if (err.message.includes('Background removal API failed')) {
                errorMessage = 'A IA não conseguiu remover o fundo desta imagem.';
            } else if (err.message.includes('ENOTFOUND')) {
                errorMessage = 'Não foi possível conectar ao serviço de remoção de fundo.';
            } else {
                errorMessage = err.message;
            }

            await client.sendMessage(
                m.chat,
                {
                    text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Não foi possível remover o fundo da imagem. 😔
│❒ Erro: ${errorMessage}
│❒ 
│❒ Dicas:
│❒ • Use imagens com bom contraste entre fundo e objeto.
│❒ • Evite fundos muito poluídos ou complexos.
│❒ • Tente com outra imagem, se possível.
◈━━━━━━━━━━━━━━━━◈`
                },
                { quoted: m }
            );
        }
    }
};
