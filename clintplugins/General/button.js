const { default: makeWASocket } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'buttonz',
  aliases: ['btn'],
  description: 'Displays a list selection menu',
  run: async (context) => {
    const { client, m } = context;

    try {
      await client.sendMessage(m.chat, {
        text: '◈━━━━━━━━━━━━━━━━◈\n│❒ Escolha uma opção na lista abaixo.\n│❒ Tudo pronto para ajudar!\n◈━━━━━━━━━━━━━━━━◈',
        footer: 'Toxic-MD Bot',
        sections: [
          {
            title: 'Comandos Gerais',
            rows: [
              { title: '📌 Ajuda', rowId: '.help', description: 'Ver comandos do bot' },
              { title: '🏓 Ping', rowId: '.ping', description: 'Testar velocidade' },
              { title: 'ℹ Info', rowId: '.info', description: 'Ver detalhes do bot' }
            ]
          },
          {
            title: 'Comandos Divertidos',
            rows: [
              { title: '🎲 Curiosidade', rowId: '.fact', description: 'Receber um fato divertido' },
              { title: '😂 Piada', rowId: '.joke', description: 'Ouvir uma piada' }
            ]
          }
        ],
        buttonText: 'Abrir Menu',
        headerType: 1,
        viewOnce: true
      }, { quoted: m });

    } catch (error) {
      console.error(`Menu command error: ${error.stack}`);
    }
  }
};
