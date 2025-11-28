const fetch = require("node-fetch");
const axios = require("axios");

module.exports = {
  name: "pinterest",
  aliases: ["pin", "pinterestimg"],
  description: "Pesquisa imagens no Pinterest com base na sua mensagem",
  run: async (context) => {
    const { client, m, prefix, botname } = context;

    const formatStylishReply = (message) => {
      return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Powered by 9bot.com.br`;
    };

    const logStyled = (message, type = "log") => {
      const styled = formatStylishReply(message);
      if (type === "error") {
        console.error(styled);
      } else if (type === "warn") {
        console.warn(styled);
      } else {
        console.log(styled);
      }
    };

    const downloadImageBuffer = async (url, timeout = 20000) => {
      const res = await axios.get(url, { responseType: "arraybuffer", timeout });
      const buffer = Buffer.from(res.data);
      const mime = res.headers["content-type"] || "image/jpeg";
      return { buffer, mime };
    };

    const query = m.body
      .replace(new RegExp(`^${prefix}(pinterest|pin|pinterestimg)\\s*`, "i"), "")
      .trim();

    if (!query) {
      return client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Olá, @${m.sender.split("@")[0]}! 😊\nVocê esqueceu de digitar o termo da pesquisa.\n\nExemplo: ${prefix}pinterest gatos`
          ),
          mentions: [m.sender],
        },
        { quoted: m }
      );
    }

    const loadingMsg = await client.sendMessage(
      m.chat,
      {
        text: formatStylishReply(
          `Procurando imagens no Pinterest para: "${query}" 🔍\nAguarde só um instante...`
        ),
      },
      { quoted: m }
    );

    try {
      const apiUrl = `https://api-faa.my.id/faa/pinterest?q=${encodeURIComponent(
        query
      )}`;

      logStyled(`Consultando API do Pinterest em: ${apiUrl}`);

      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!data.status || !data.result || data.result.length === 0) {
        await client.sendMessage(m.chat, { delete: loadingMsg.key });

        return client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `Não encontrei resultados no Pinterest para "${query}" 😢\nTente usar outro termo de pesquisa.`
            ),
          },
          { quoted: m }
        );
      */

      const images = data.result.slice(0, 10);
      await client.sendMessage(m.chat, { delete: loadingMsg.key });

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Encontrei ${images.length} imagens no Pinterest para "${query}" 📸\nVou enviar as melhores para você.`
          ),
        },
        { quoted: m }
      );

      const album = [];
      let successful = 0;

      for (const [i, imgUrl] of images.entries()) {
        try {
          const { buffer, mime } = await downloadImageBuffer(imgUrl);

          const caption =
            i === 0
              ? `Pσɯҽɾԃ Ⴆყ Tσxιƈ-ɱԃȥ\n\n${formatStylishReply(
                  `*Resultado da busca no Pinterest*\n\n• Pesquisa: _${query}_\n• Imagem ${i + 1}/${images.length}\n• Alimentado por *${botname}*`
                )}`
              : "";

          album.push({
            image: buffer,
            mimetype: mime,
            caption,
          });
          successful++;
        } catch (err) {
          logStyled(
            `Falha ao baixar a imagem ${i + 1}: ${err.message}`,
            "warn"
          );
        }
      }

      if (album.length === 0) {
        return client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `Não consegui baixar nenhuma imagem agora 😔\nTente novamente em alguns instantes.`
            ),
          },
          { quoted: m }
        );
      }

      try {
        await client.sendMessage(
          m.chat,
          { albumMessage: album },
          { quoted: m }
        );

        if (successful < images.length) {
          await client.sendMessage(
            m.chat,
            {
              text: formatStylishReply(
                `Enviei ${successful}/${images.length} imagens.\nAlgumas não puderam ser carregadas.`
              ),
            },
            { quoted: m }
          );
        }
      } catch (err) {
        logStyled(
          `Falha ao enviar o álbum de imagens. Tentando enviar individualmente: ${err.message}`,
          "error"
        );

        let sentCount = 0;
        for (const img of album.slice(0, 5)) {
          try {
            await client.sendMessage(
              m.chat,
              {
                image: img.image,
                mimetype: img.mimetype,
                caption:
                  sentCount === 0
                    ? `Pσɯҽɾԃ Ⴆყ Tσxιƈ-ɱԃȥ\n\n${formatStylishReply(
                        `*Resultados da busca no Pinterest*\n\n• Pesquisa: _${query}_\n• Alimentado por *${botname}*`
                      )}`
                    : "",
              },
              { quoted: m }
            );
            sentCount++;
            await new Promise((r) => setTimeout(r, 1000));
          } catch (e) {
            logStyled(
              `Falha ao enviar imagem individualmente: ${e.message}`,
              "warn"
            );
          }
        }

        if (sentCount === 0) {
          throw new Error("Não foi possível enviar nenhuma imagem.");
        }
      }
    } catch (err) {
      logStyled(`Erro ao buscar imagens no Pinterest: ${err.message}`, "error");

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Ops, @${m.sender.split("@")[0]}! 😥\nAconteceu um erro ao buscar imagens no Pinterest.\n\nDetalhes: ${err.message}`
          ),
          mentions: [m.sender],
        },
        { quoted: m }
      );
    }
  },
};
