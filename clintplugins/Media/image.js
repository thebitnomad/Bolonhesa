const fetch = require("node-fetch");
const axios = require("axios");

module.exports = {
  name: "image",
  aliases: ["img", "pic", "searchimage"],
  description: "Pesquisa imagens com base na sua mensagem",
  run: async (context) => {
    const { client, m, prefix, botname } = context;

    const formatStylishReply = (message) => {
      return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈\n> Pσɯҽɾԃ Ⴆყ Tσxιƈ-ɱԃȥ`;
    };

    const logStyled = (message, type = "log") => {
      if (type === "error") {
        console.error(formatStylishReply(message));
      } else if (type === "warn") {
        console.warn(formatStylishReply(message));
      } else {
        console.log(formatStylishReply(message));
      }
    };

    // Helper: Download image into a Buffer
    const downloadImageBuffer = async (url, timeout = 20000) => {
      const res = await axios.get(url, { responseType: "arraybuffer", timeout });
      const buffer = Buffer.from(res.data);
      const mime = res.headers["content-type"] || "image/jpeg";
      return { buffer, mime };
    };

    const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          logStyled(`Tentativa ${attempt} de buscar imagens na URL: ${url}`);
          const response = await fetch(url, options);
          if (!response.ok) {
            throw new Error(`A API retornou o status ${response.status}`);
          }
          return response;
        } catch (error) {
          logStyled(
            `Tentativa ${attempt} falhou: ${error.message}. Tentando novamente em ${delay}ms...`,
            "warn"
          );
          if (attempt === retries) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    };

    /**
     * Extract search query from message
     */
    const query = m.body
      .replace(new RegExp(`^${prefix}(image|img|pic|searchimage)\\s*`, "i"), "")
      .trim();

    if (!query) {
      return client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Olá, @${m.sender.split("@")[0]}! 😊\nVocê esqueceu de digitar o termo da pesquisa.\n\nExemplo: ${prefix}image gatos fofos`
          ),
          mentions: [m.sender],
        },
        { quoted: m }
      );
    }

    try {
      /**
       * Send loading message
       */
      const loadingMsg = await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Procurando imagens de: "${query}" 🔍\nPor favor, aguarde um instante...`
          ),
        },
        { quoted: m }
      );

      /**
       * Call the Google Images API
       */
      const apiUrl = `https://anabot.my.id/api/search/gimage?query=${encodeURIComponent(
        query
      )}&apikey=freeApikey`;

      logStyled(`Consultando API de imagens em: ${apiUrl}`);

      const response = await fetchWithRetry(apiUrl, { timeout: 15000 });
      const data = await response.json();

      /**
       * Validate API response
       */
      if (!data.success || !data.data?.result || data.data.result.length === 0) {
        await client.sendMessage(m.chat, {
          delete: loadingMsg.key,
        });

        return client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `Não encontrei nenhuma imagem para "${query}" 😢\nTente usar outro termo de pesquisa.`
            ),
          },
          { quoted: m }
        );
      }

      /**
       * Get images from response (limit to 10 for performance)
       */
      const images = data.data.result.slice(0, 10);

      // Delete loading message
      await client.sendMessage(m.chat, {
        delete: loadingMsg.key,
      });

      /**
       * Send success message
       */
      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Encontrei ${data.data.result.length} imagens para "${query}".\nEnviarei as ${images.length} melhores opções pra você 📸`
          ),
        },
        { quoted: m }
      );

      /**
       * Prepare and send image album
       */
      const albumImages = [];
      let successfulDownloads = 0;

      for (const [index, image] of images.entries()) {
        try {
          // Download image into buffer
          const { buffer, mime } = await downloadImageBuffer(image.url);

          // Prepare caption for each image
          const caption =
            index === 0
              ? formatStylishReply(
                  `*Resultado da busca de imagens*\n\n• Pesquisa: _${query}_\n• Tamanho: ${image.width}x${image.height}\n• Imagem ${index + 1}/${images.length}\n• Alimentado por *${botname}*`
                )
              : "";

          // Add to album
          albumImages.push({
            image: buffer,
            mimetype: mime,
            caption,
          });

          successfulDownloads++;
        } catch (error) {
          logStyled(
            `Falha ao baixar a imagem ${index + 1}: ${error.message}`,
            "warn"
          );
          // Continue with other images even if one fails
        }
      }

      if (albumImages.length === 0) {
        return client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `Não consegui baixar nenhuma imagem para "${query}" 😢\nAs imagens podem estar temporariamente indisponíveis.`
            ),
          },
          { quoted: m }
        );
      }

      /**
       * Send album message
       */
      try {
        await client.sendMessage(
          m.chat,
          {
            albumMessage: albumImages,
          },
          { quoted: m }
        );

        // Send completion message
        if (successfulDownloads < images.length) {
          await client.sendMessage(
            m.chat,
            {
              text: formatStylishReply(
                `Enviei ${successfulDownloads} imagens para "${query}".\n(${images.length - successfulDownloads} não puderam ser carregadas)`
              ),
            },
            { quoted: m }
          );
        }
      } catch (albumError) {
        logStyled(
          `Falha ao enviar o álbum de imagens, tentando enviar individualmente: ${albumError.message}`,
          "error"
        );

        // Fallback: send images individually
        let individualSentCount = 0;
        for (const img of albumImages.slice(0, 5)) {
          try {
            await client.sendMessage(
              m.chat,
              {
                image: img.image,
                mimetype: img.mimetype,
                caption:
                  individualSentCount === 0
                    ? formatStylishReply(
                        `*Resultados da busca de imagens*\n\n• Pesquisa: _${query}_\n• Alimentado por *${botname}*`
                      )
                    : "",
              },
              { quoted: m }
            );
            individualSentCount++;

            // Small delay between sends
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (e) {
            logStyled(
              `Falha ao enviar imagem individualmente: ${e.message}`,
              "warn"
            );
          }
        }

        if (individualSentCount > 0) {
          await client.sendMessage(
            m.chat,
            {
              text: formatStylishReply(
                `Enviei ${individualSentCount} imagens individualmente para "${query}".`
              ),
            },
            { quoted: m }
          );
        } else {
          throw new Error("Não foi possível enviar nenhuma imagem.");
        }
      }
    } catch (error) {
      logStyled(`Erro na busca de imagens: ${error.message}`, "error");

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Ops, @${m.sender.split("@")[0]}! 😥\nAconteceu um erro ao buscar as imagens.\n\nDetalhes: ${error.message}`
          ),
          mentions: [m.sender],
        },
        { quoted: m }
      );
    }
  },
};
