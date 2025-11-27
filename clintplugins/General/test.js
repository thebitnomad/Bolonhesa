const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'test',
  aliases: ['tst', 'testcmd'],
  description: 'Sends a test voice note to check if you’re worthy',
  run: async (context) => {
    const { client, m, botname, text } = context;

    if (text) {
      return client.sendMessage(m.chat, { text: `◈━━━━━━━━━━━━━━━━◈\n│❒ Olá, ${m.pushName}! Use apenas .test para verificar o áudio.\n◈━━━━━━━━━━━━━━━━◈` }, { quoted: m });
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
        console.log(`✅ Found audio file at: ${audioPath}`);
        await client.sendMessage(m.chat, {
          audio: { url: audioPath },
          ptt: true,
          mimetype: 'audio/mpeg',
          fileName: 'test.mp3'
        }, { quoted: m });
      } else {
        console.error('❌ Audio file not found at any of the following paths:', possibleAudioPaths);
        await client.sendMessage(m.chat, {
          text: `◈━━━━━━━━━━━━━━━━◈\n│❒ Não encontrei o arquivo test.mp3 em xh_clinton/.\n│❒ Verifique se o áudio está salvo corretamente.\n\nFeito por *${botname}*`
        }, { quoted: m });
      }
    } catch (error) {
      console.error('Error in test command:', error);
      await client.sendMessage(m.chat, {
        text: `◈━━━━━━━━━━━━━━━━◈\n│❒ Não consegui tocar o áudio de teste agora.\n│❒ Tente novamente em instantes.\n\nFeito por *${botname}*`
      }, { quoted: m });
    }
  }
};