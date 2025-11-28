const { getSettings } = require('../../Database/config');

/**
 * Publica um status de grupo com texto, imagem, vídeo ou áudio.
 * @module gstatus
 */
module.exports = {
  name: 'gstatus',
  aliases: ['groupstatus', 'gs'],
  description: 'Publica um status no grupo com texto, imagem, vídeo ou áudio.',
  run: async (context) => {
    const { client, m, prefix, isBotAdmin, IsGroup, botname } = context;

    // Helper para estilizar todas as mensagens com o padrão do bot
    const formatMsg = (text) => {
      const lines = String(text || '')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const body = lines.map((line) => `│❒ ${line}`).join('\n');
      return `◈━━━━━━━━━━━━━━━━◈\n${body}\n◈━━━━━━━━━━━━━━━━◈`;
    };

    try {
      if (!botname) {
        return client.sendText(
          m.chat,
          formatMsg(
            `O nome do bot não está configurado.\n` +
            `Por favor, defina o *botname* antes de usar este comando.`
          ),
          m
        );
      }

      if (!m.sender || typeof m.sender !== 'string' || !m.sender.includes('@s.whatsapp.net')) {
        return client.sendText(
          m.chat,
          formatMsg(
            `Não consegui identificar o seu ID do WhatsApp.\n` +
            `Tente novamente em alguns instantes.`
          ),
          m
        );
      }

      if (!IsGroup) {
        return client.sendText(
          m.chat,
          formatMsg(
            `Este comando só pode ser usado em grupos.\n` +
            `Use-o dentro de um grupo para publicar o status.`
          ),
          m
        );
      }

      if (!isBotAdmin) {
        return client.sendText(
          m.chat,
          formatMsg(
            `Preciso ser *administrador* do grupo para publicar o status.\n` +
            `Defina o bot como admin e tente novamente.`
          ),
          m
        );
      }

      const settings = await getSettings();
      if (!settings) {
        return client.sendText(
          m.chat,
          formatMsg(
            `Não foi possível carregar as configurações no momento.\n` +
            `Tente novamente em alguns instantes.`
          ),
          m
        );
      }

      const quoted = m.quoted ? m.quoted : m;
      const mime = (quoted.msg || quoted).mimetype || '';

      const caption = m.body
        .replace(new RegExp(`^${prefix}(gstatus|groupstatus|gs)\\s*`, 'i'), '')
        .trim();

      if (!/image|video|audio/.test(mime) && !caption) {
        return client.sendText(
          m.chat,
          formatMsg(
            `Para usar este comando, responda a uma *imagem*, *vídeo*, *áudio* ou envie junto um texto.\n` +
            `Exemplo: ${prefix}gstatus Confira essa atualização do grupo!`
          ),
          m
        );
      }

      // Legenda padrão para status do grupo
      const defaultCaption =
        `Status do grupo publicado por *${botname}* ✅\n\n` +
        `Entre no grupo:\n` +
        `https://chat.whatsapp.com`;

      if (/image/.test(mime)) {
        const buffer = await client.downloadMediaMessage(quoted);
        await client.sendMessage(m.chat, {
          groupStatusMessage: {
            image: buffer,
            caption: caption || defaultCaption
          }
        });
        await client.sendText(
          m.chat,
          formatMsg(`Status de *imagem* publicado com sucesso ✅`),
          m
        );
      } else if (/video/.test(mime)) {
        const buffer = await client.downloadMediaMessage(quoted);
        await client.sendMessage(m.chat, {
          groupStatusMessage: {
            video: buffer,
            caption: caption || defaultCaption
          }
        });
        await client.sendText(
          m.chat,
          formatMsg(`Status de *vídeo* publicado com sucesso ✅`),
          m
        );
      } else if (/audio/.test(mime)) {
        const buffer = await client.downloadMediaMessage(quoted);
        await client.sendMessage(m.chat, {
          groupStatusMessage: {
            audio: buffer,
            mimetype: 'audio/mp4'
          }
        });
        await client.sendText(
          m.chat,
          formatMsg(`Status de *áudio* publicado com sucesso ✅`),
          m
        );
      } else if (caption) {
        await client.sendMessage(m.chat, {
          groupStatusMessage: { text: caption }
        });
        await client.sendText(
          m.chat,
          formatMsg(`Status de *texto* publicado com sucesso ✅`),
          m
        );
      }
    } catch (error) {
      console.error(
        formatMsg(
          `Erro ao tentar publicar o status do grupo.`
        ),
        error
      );

      await client.sendText(
        m.chat,
        formatMsg(
          `Ocorreu um erro ao publicar o status do grupo.\n` +
          `Tente novamente em alguns instantes.`
        ),
        m
      );
    }
  }
};
