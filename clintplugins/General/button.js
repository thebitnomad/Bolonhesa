const { default: makeWASocket } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'buttonz',
    aliases: ['btn'],
    description: 'Displays a list selection menu',
    run: async (context) => {
        const { client, m } = context;

        const formatStylish = (message) => {
            return `◈━━━━━━━━━━━━━━━━◈
│❒ ${message}
◈━━━━━━━━━━━━━━━━◈`;
        };

        try {
            await client.sendMessage(
                m.chat,
                {
                    text: formatStylish(
                        'Escolha uma das opções abaixo para continuar.'
                    ),
                    footer: '◈━━━━━━━━━━━━━━━━◈\n│❒ 9bot.com.br\n◈━━━━━━━━━━━━━━━━◈',
                    sections: [
                        {
                            title: 'Comandos Gerais',
                            rows: [
                                {
                                    title: '📌 Ajuda',
                                    rowId: '.help',
                                    description: 'Ver a lista de comandos do bot.'
                                },
                                {
                                    title: '🏓 Ping',
                                    rowId: '.ping',
                                    description: 'Checar a velocidade de resposta do bot.'
                                },
                                {
                                    title: 'ℹ Informações',
                                    rowId: '.info',
                                    description: 'Ver detalhes e status do bot.'
                                }
                            ]
                        },
                        {
                            title: 'Comandos de Diversão',
                            rows: [
                                {
                                    title: '🎲 Fato Aleatório',
                                    rowId: '.fact',
                                    description: 'Receber um fato curioso aleatório.'
                                },
                                {
                                    title: '😂 Piada',
                                    rowId: '.joke',
                                    description: 'Ouvir uma piada rápida.'
                                }
                            ]
                        }
                    ],
                    buttonText: 'Abrir Menu',
                    headerType: 1,
                    viewOnce: true
                },
                { quoted: m }
            );
        } catch (error) {
            console.error(
                formatStylish(`Erro ao exibir o menu de seleção: ${error.message}`)
            );

            await client.sendMessage(
                m.chat,
                {
                    text: formatStylish(
                        'Ocorreu um erro ao abrir o menu de opções.\n│❒ Tente novamente em alguns instantes.'
                    )
                },
                { quoted: m }
            );
        }
    }
};
