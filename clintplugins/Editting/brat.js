const fetch = require('node-fetch');
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');

module.exports = {
    name: 'brat',
    aliases: ['bratsticker', 'brattext'],
    description: 'Cria figurinhas de texto no estilo brat',
    run: async (context) => {
        const { client, m, prefix } = context;

        const formatStylishReply = (message) => {
            return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
        };

        /**
         * Extrai o texto da mensagem
         */
        const text = m.body
            .replace(new RegExp(`^${prefix}(brat|bratsticker|brattext)\\s*`, 'i'), '')
            .trim();
        
        if (!text) {
            return client.sendMessage(
                m.chat,
                {
                    text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Olá, @${m.sender.split('@')[0]}!
│❒ Você esqueceu de enviar o texto.
│❒ Exemplo: ${prefix}brat Olá, tudo bem?
◈━━━━━━━━━━━━━━━━◈`,
                    mentions: [m.sender]
                },
                { quoted: m }
            );
        }

        let loadingMsg;

        try {
            /**
             * Mensagem de carregamento
             */
            loadingMsg = await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        `Criando figurinha estilo brat... 🎨\nTexto: "${text}"`
                    )
                },
                { quoted: m }
            );

            /**
             * Chama a API usada para gerar o texto no estilo brat
             */
            const apiUrl = `https://api.nekolabs.web.id/canvas/brat/v1?text=${encodeURIComponent(
                text
            )}`;
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`A API retornou o status: ${response.status}`);
            }

            // Pega a imagem como buffer
            const buffer = Buffer.from(await response.arrayBuffer());

            // Remove a mensagem de carregamento
            if (loadingMsg?.key) {
                await client.sendMessage(m.chat, { delete: loadingMsg.key });
            }

            /**
             * Cria a figurinha com metadados usando wa-sticker-formatter
             */
            const sticker = new Sticker(buffer, {
                pack: 'Brat Sticker Pack', // Nome do pack
                author: '9bot',            // Autor
                type: StickerTypes.FULL,
                categories: ['😎', '💬'],
                quality: 50,
                background: 'transparent'
            });

            // Envia a figurinha
            await client.sendMessage(
                m.chat,
                await sticker.toMessage(),
                { quoted: m }
            );

        } catch (error) {
            console.error('Brat command error:', error);

            // Tenta apagar a mensagem de carregamento, se existir
            try {
                if (loadingMsg?.key) {
                    await client.sendMessage(m.chat, { delete: loadingMsg.key });
                }
            } catch (e) {
                // Ignora erros ao apagar
            }

            let errorMessage = 'Não foi possível criar a figurinha.';

            if (error.message.includes('status')) {
                errorMessage = 'A API de brat não está respondendo corretamente. Tente novamente mais tarde.';
            } else if (error.message.includes('Network')) {
                errorMessage = 'Erro de rede. Verifique sua conexão e tente novamente.';
            } else {
                errorMessage = error.message;
            }

            await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        `Falha ao criar figurinha brat. 😔\nErro: ${errorMessage}`
                    )
                },
                { quoted: m }
            );
        }
    }
};
