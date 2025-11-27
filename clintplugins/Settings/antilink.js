const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;

    const formatStylishReply = (message) => {
      return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n┗━━━━━━━━━━━━━━━┛`;
    };

    try {
      const settings = await getSettings();
      if (!settings || Object.keys(settings).length === 0) {
        return await client.sendMessage(
          m.chat,
          { 
            text: formatStylishReply(
              "Não encontrei nenhuma configuração no banco de dados.\n│❒ Verifique as definições do bot antes de tentar novamente."
            ) 
          },
          { quoted: m, ad: true }
        );
      }

      // Normaliza o valor recebido
      const value = args.join(" ").toLowerCase();
      const validModes = ["off", "delete", "remove"];

      // Atualiza o modo se um argumento válido for enviado
      if (validModes.includes(value)) {
        const currentMode = String(settings.antilink || "off").toLowerCase();
        if (currentMode === value) {
          return await client.sendMessage(
            m.chat,
            { 
              text: formatStylishReply(
                `O Antilink já está definido como '${value.toUpperCase()}'. 😉`
              ) 
            },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('antilink', value);
        return await client.sendMessage(
          m.chat,
          { 
            text: formatStylishReply(
              `Modo do Antilink atualizado para '${value.toUpperCase()}'. 🔥`
            ) 
          },
          { quoted: m, ad: true }
        );
      }

      // Garante que currentStatus seja sempre string
      const currentStatus = String(settings.antilink || "off").toLowerCase();

      const buttons = [
        { buttonId: `${prefix}antilink delete`, buttonText: { displayText: "DELETE 🗑️" }, type: 1 },
        { buttonId: `${prefix}antilink remove`, buttonText: { displayText: "REMOVE 🚫" }, type: 1 },
        { buttonId: `${prefix}antilink off`, buttonText: { displayText: "OFF 😴" }, type: 1 },
      ];

      // Escolhe o emoji com base no modo atual
      const emoji =
        currentStatus === "delete" ? "🗑️" :
        currentStatus === "remove" ? "🚫" :
        "😴";

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Modo atual do Antilink: ${currentStatus.toUpperCase()} ${emoji}\n` +
            `│❒ Escolha uma opção abaixo para alterar o comportamento de links no grupo. 💬`
          ),
          footer: "> Powered by *9bot*",
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      console.error("❌ Error in Antilink command:", error);
      await client.sendMessage(
        m.chat,
        { 
          text: formatStylishReply(
            "Ocorreu um erro ao atualizar o Antilink.\n│❒ Verifique o banco de dados ou tente novamente em alguns instantes."
          ) 
        },
        { quoted: m, ad: true }
      );
    }
  });
};
