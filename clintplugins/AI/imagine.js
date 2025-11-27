const fetch = require('node-fetch');

module.exports = {
    name: 'imagine',
    aliases: ['aiimage', 'dream', 'generate'],
    description: 'Gera imagens com IA a partir de prompts de texto',
    run: async (context) => {
        const { client, m, prefix, botname } = context;

        const formatStylishReply = (message) => {
            return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
        };

        /**
         * Extrai o prompt da mensagem
         */
        const prompt = m.body
            .replace(new RegExp(`^${prefix}(imagine|aiimage|dream|generate)\\s*`, 'i'), '')
            .trim();
        
        if (!prompt) {
            return client.sendMessage(
                m.chat,
                {
                    text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Olá, @${m.sender.split('@')[0]}!
│❒ Você esqueceu de enviar o prompt.
│❒ Exemplo: ${prefix}imagine um gato jogando futebol
│❒ Ou: ${prefix}dream uma paisagem fantástica
◈━━━━━━━━━━━━━━━━◈`,
                    mentions: [m.sender]
                },
                { quoted: m }
            );
        }

        try {
            /**
             * Envia mensagem de carregamento
             */
            const loadingMsg = await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        `Gerando imagem com IA... 🎨\nPrompt: "${prompt}"\nAguarde alguns instantes ⏳`
                    )
                },
                { quoted: m }
            );

            /**
             * Chama a API de geração de imagem
             */
            const encodedPrompt = encodeURIComponent(prompt);
            const apiUrl = `https://anabot.my.id/api/ai/dreamImage?prompt=${encodedPrompt}&models=Fantasy&apikey=freeApikey`;
            
            const response = await fetch(apiUrl, { timeout: 60000 });

            if (!response.ok) {
                throw new Error(`API retornou status: ${response.status}`);
            }

            const data = await response.json();

            /**
             * Valida resposta da API
             */
            if (!data.success || !data.data?.result) {
                throw new Error('A IA não conseguiu gerar a imagem.');
            }

            const imageUrl = data.data.result;

            // Remove a mensagem de carregamento
            await client.sendMessage(m.chat, { delete: loadingMsg.key });

            /**
             * Envia a imagem gerada
             */
            await client.sendMessage(
                m.chat,
                {
                    image: { url: imageUrl },
                    caption:
`◈━━━━━━━━━━━━━━━━◈
│❒ Imagem gerada com IA! ✨
│❒ Prompt: ${prompt}
◈━━━━━━━━━━━━━━━━◈
Powered by *9bot*`
                },
                { quoted: m }
            );

        } catch (error) {
            console.error('Imagine command error:', error);

            // Tenta apagar mensagem de loading
            try { await client.sendMessage(m.chat, { delete: loadingMsg.key }); } catch {}

            let errorMessage = 'Um erro inesperado ocorreu.';

            if (error.message.includes('status')) {
                errorMessage = 'O serviço de IA não está respondendo corretamente.';
            } else if (error.message.includes('Network') || error.message.includes('fetch')) {
                errorMessage = 'Erro de rede. Verifique sua conexão.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'A geração demorou demais. Tente um prompt mais simples.';
            } else if (error.message.includes('IA não conseguiu')) {
                errorMessage = 'A IA não conseguiu gerar uma imagem com esse prompt.';
            } else {
                errorMessage = error.message;
            }

            await client.sendMessage(
                m.chat,
                {
                    text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Falha ao gerar imagem! 😔
│❒ Erro: ${errorMessage}

│❒ Dicas:
│❒ • Use descrições claras
│❒ • Evite cenas complexas
│❒ • Teste palavras-chave diferentes
◈━━━━━━━━━━━━━━━━◈`
                },
                { quoted: m }
            );
        }
    }
};
