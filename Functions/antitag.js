const { getGroupSettings } = require("../Database/config");

module.exports = async (client, m, isBotAdmin, itsMe, isAdmin, Owner, body) => {
    if (!m.isGroup) return;

    const groupSettings = await getGroupSettings(m.chat);
    const antitag = groupSettings?.antitag;

    if (antitag && !Owner && isBotAdmin && !isAdmin && m.mentionedJid && m.mentionedJid.length > 10) {
        if (itsMe) return;

        const kid = m.sender;

        try {
            await client.sendMessage(m.chat, {
                text: `@${kid.split("@")[0]}, marcar geral aqui não é permitido. Você será removido do grupo. 😅`,
                contextInfo: { mentionedJid: [kid] }
            }, { quoted: m });

            await client.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: m.key.id,
                    participant: kid
                }
            });

            await client.groupParticipantsUpdate(m.chat, [kid], "remove");
        } catch (e) {
            console.log("Erro no antitag:", e);
        }
    }
};
