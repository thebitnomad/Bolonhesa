const { getSettings, getSudoUsers } = require("../Database/config");

module.exports = async (client, m, store, chatbotpmSetting) => {
    try {
        if (!m || !m.key || !m.message || !m.key.remoteJid.endsWith("@s.whatsapp.net") || m.key.fromMe) {
            return;
        }

        if (!chatbotpmSetting) {
            return;
        }

        const botNumber = await client.decodeJid(client.user.id);
        const sender = m.sender ? await client.decodeJid(m.sender) : null;
        const senderNumber = sender ? sender.split('@')[0] : null;

        if (!sender || !senderNumber) {
            return;
        }

        const sudoUsers = await getSudoUsers();
        if (sudoUsers.includes(senderNumber) || sender === botNumber) {
            return;
        }

        const messageContent = (
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption ||
            ""
        ).trim();

        const { prefix } = await getSettings();
        if (messageContent.startsWith(prefix)) {
            return;
        }

        if (!messageContent) {
            return;
        }

        try {
            const encodedText = encodeURIComponent(messageContent);
            const apiUrl = `https://api.privatezia.biz.id/api/ai/GPT-4?query=${encodedText}`;
            const response = await fetch(apiUrl, { timeout: 10000 });
            if (!response.ok) {
                throw new Error(`Requisição da API falhou com status ${response.status}`);
            }
            const data = await response.json();
            if (!data.status || !data.response) { 
                throw new Error("Resposta da API inválida: faltando status ou response");
            }
            await client.sendMessage(
                m.key.remoteJid,
                { text: data.response }, 
                { quoted: m }
            );
        } catch (e) {
            console.error(`Erro no ChatbotPM do Toxic-MD:`, e);
            await client.sendMessage(
                m.key.remoteJid,
                { 
                    text: 
`◈━━━━━━━━━━━━━━━━◈
│❒ Opa, algo deu errado com o chatbot 😵‍💫
│❒ Tenta de novo daqui a pouco, beleza?
┗━━━━━━━━━━━━━━━┛` 
                },
                { quoted: m }
            );
        }
    } catch (e) {
        console.error("Erro no ChatbotPM do Toxic-MD:", e);
    }
};
