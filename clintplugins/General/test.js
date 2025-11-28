const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'test',
  aliases: ['tst', 'testcmd'],
  description: 'Envia uma mensagem de voz de teste para verificar se está tudo funcionando corretamente.',
  run: async (context) => {
    const { client, m, botname, text } = context;

    if (text) {
      return client.sendMessage(
        m.chat,
        {
          text:
            `◈━━━━━━━━━━━━━━━━◈\n` +
            `│❒ Olá, ${m.pushName}! Este comando não precisa de texto extra.\n` +
            `│❒ Use apenas *.test* para executar o teste de áudio.\n` +
            `◈━━━━━━━━━━━━━━━━◈`
        },
        { quoted: m }
      );
    }

    try {
      const possibleAudioPaths = [
        path.join(__dirname, 'xh_clinton', 'test.mp3'),
        path.join(process.cwd(), 'xh_clinton', 'test.mp3'),
        path.join(__dirname, '..', 'xh_clinton', 'test.mp3'),
      ];

      let audioPath = null;
      for (const possiblePath of possibleAudioPaths) {
        if (fs.existsSync(possiblePath)) {
          audioPath = possiblePath;
          break;
        }
      }

      if (audioPath) {
        console.log(
          `◈━━━━━━━━━━━━━━━━◈\n` +
          `│❒ Arquivo de áudio de teste encontrado em:\n` +
          `│❒ ${audioPath}\n` +
          `◈━━━━━━━━━━━━━━━━◈`
        );

        await client.sendMessage(
          m.chat,
          {
            audio: { url: audioPath },
            ptt: true,
            mimetype: 'audio/mpeg',
            fileName: 'test.mp3'
          },
          { quoted: m }
        );
      } else {
        console.error(
          `◈━━━━━━━━━━━━━━━━◈\n` +
          `│❒ Arquivo de áudio test.mp3 não encontrado em nenhum dos caminhos configurados.\n` +
          `◈━━━━━━━━━━━━━━━━◈\n`,
          possibleAudioPaths
        );

        await client.sendMessage(
          m.chat,
          {
            text:
              `◈━━━━━━━━━━━━━━━━◈\n` +
              `│❒ Não consegui encontrar o arquivo *test.mp3* na pasta *xh_clinton/*.\n` +
              `│❒ Verifique se o arquivo foi enviado ou configurado corretamente.\n` +
              `│❒ Powered by *${botname}*\n` +
              `◈━━━━━━━━━━━━━━━━◈`
          },
          { quoted: m }
        );
      }
    } catch (error) {
      console.error(
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ Ocorreu um erro ao executar o comando de teste.\n` +
        `◈━━━━━━━━━━━━━━━━◈\n`,
        error
      );

      await client.sendMessage(
        m.chat,
        {
          text:
            `◈━━━━━━━━━━━━━━━━◈\n` +
            `│❒ Aconteceu um erro ao tentar enviar o áudio de teste.\n` +
            `│❒ Tente novamente em alguns instantes.\n` +
            `│❒ Powered by *${botname}*\n` +
            `◈━━━━━━━━━━━━━━━━◈`
        },
        { quoted: m }
      );
    }
  }
};
