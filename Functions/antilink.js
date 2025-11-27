const { getSettings } = require("../Database/config");

module.exports = async (client, m) => {
    try {
        if (!m?.message) return;
        if (m.key.fromMe) return;
        if (!m.isGroup) return;

        const settings = await getSettings();
        const antilinkMode = (settings.antilink || "off").toLowerCase();

        // OFF = ignore everything
        if (antilinkMode === "off") return;

        const isAdmin = m.isAdmin;
        const isBotAdmin = m.isBotAdmin;

        // Allow admins to send links
        if (isAdmin) return;

        // Bot must be admin for any action
        if (!isBotAdmin) return;

        // Extract text
        let text = "";

        if (m.message.conversation) {
            text = m.message.conversation;
        } else if (m.message.extendedTextMessage?.text) {
            text = m.message.extendedTextMessage.text;
        } else if (m.message.imageMessage?.caption) {
            text = m.message.imageMessage.caption;
        } else if (m.message.videoMessage?.caption) {
            text = m.message.videoMessage.caption;
        } else if (m.message.documentMessage?.caption) {
            text = m.message.documentMessage.caption;
        }

        // Detect links
        const urlRegex =
            /(https?:\/\/[^\s]+|www\.[^\s]+|bit\.ly\/[^\s]+|t\.me\/[^\s]+|chat\.whatsapp\.com\/[^\s]+|whatsapp\.com\/[^\s]+)/gi;

        if (!urlRegex.test(String(text).toLowerCase())) return;

        // Delete message
        await client.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: m.key.id,
                participant: m.sender,
            },
        });

        // Mensagem de aviso divertida
        await client.sendMessage(m.chat, {
            text:
                `◈━━❰ *Antilink* ❱━━◈\n` +
                `│ 🙅 @${m.sender.split("@")[0]}, link aqui não, né? 😅\n` +
                `│ 🧹 Seu link foi limpo do rolê.\n` +
                (antilinkMode === "remove"
                    ? `│ 🚪 Modo hardcore ativado: você foi removido por mandar link no grupo.\n`
                    : `│ ⚠️ Da próxima pode rolar punição. Melhor não arriscar. 😉\n`) +
                `┗━━━━━━━━━━━━━━━━┛`,
            mentions: [m.sender],
        });

        // Kick user if mode = remove
        if (antilinkMode === "remove") {
            const user = m.sender;
            const tag = user.split("@")[0];

            try {
                await client.groupParticipantsUpdate(m.chat, [user], "remove");

                await client.sendMessage(m.chat, {
                    text:
                        `◈━━❰ *Antilink* ❱━━◈\n` +
                        `│ 🚫 @${tag} saiu do grupo por mandar link.\n` +
                        `│ 📜 Leiam as regras pra não sair sem se despedir de novo. 😅\n` +
                        `┗━━━━━━━━━━━━━━┛`,
                    mentions: [user],
                });
            } catch {
                await client.sendMessage(m.chat, {
                    text:
                        `◈━━❰ *Antilink* ❱━━◈\n` +
                        `│ 🤷 Não consegui remover @${tag}.\n` +
                        `│ 🔑 Parece que estou sem permissão de admin. Dono do grupo, me dá uma força aí. 🙌\n` +
                        `┗━━━━━━━━━━━━━━┛`,
                    mentions: [user],
                });
            }
        }
    } catch (err) {
        // Silent fail
    }
};
