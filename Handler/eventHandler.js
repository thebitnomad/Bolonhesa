const { getGroupSetting, getSudoUsers } = require("../Database/config");

const Events = async (client, event, pict) => {
    const botJid = await client.decodeJid(client.user.id);

    try {
        const metadata = await client.groupMetadata(event.id);
        const participants = event.participants;
        const desc = metadata.desc || "Algum grupo qualquer por aqui 😅.";
        const groupSettings = await getGroupSetting(event.id);
        const eventsEnabled = groupSettings?.events === true;
        const antidemote = groupSettings?.antidemote === true;
        const antipromote = groupSettings?.antipromote === true;
        const sudoUsers = await getSudoUsers();
        const currentDevs = Array.isArray(sudoUsers)
            ? sudoUsers.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
            : [];

        for (const participant of participants) {
            let dpUrl = pict;
            try {
                dpUrl = await client.profilePictureUrl(participant, "image");
            } catch {
                dpUrl = pict; // Fallback para imagem padrão se o usuário não tiver foto
            }

            if (eventsEnabled && event.action === "add") {
                try {
                    const userName = participant.split("@")[0];
                    const welcomeText = 
`╭───「 💬 𝐁𝐞𝐦-𝐯𝐢𝐧𝐝𝐨(𝐚) 💬 」
│ 😀 *@${userName}, seja bem-vindo(a) ao grupo!*  
│
│ 🤖 *Bot*: *9bot*
│ 🦁 *Grupo*: ${metadata.subject}
│ 📜 *Descrição*: ${desc}
│
│ 🙌 *Chega mais, se apresenta e bora trocar ideia!* 
╰───「 🚀 Powered by *9bot*  🚀 」`;

                    await client.sendMessage(event.id, {
                        image: { url: dpUrl },
                        caption: welcomeText,
                        mentions: [participant]
                    });
                } catch {
                    // Mantém em silêncio, sem flood de erro
                }
            } else if (eventsEnabled && event.action === "remove") {
                try {
                    const userName = participant.split("@")[0];
                    const leaveText = 
`╭───「 🚪 𝐒𝐚í𝐝𝐚 𝐝𝐨 𝐆𝐫𝐮𝐩𝐨 🚪 」
│ 👋 *@${userName} saiu do grupo.*  
│
│ 🤖 *Bot*: *9bot*
│ 🦁 *Grupo*: ${metadata.subject}
│
│ 😊 *Valeu pela presença, porta aberta se quiser voltar um dia!* 
╰───「 🚀 Powered by *9bot* 🚀 」`;

                    await client.sendMessage(event.id, {
                        image: { url: dpUrl },
                        caption: leaveText,
                        mentions: [participant]
                    });
                } catch {
                    // Sem drama nos erros
                }
            }

            if (event.action === "demote" && antidemote) {
                try {
                    if (
                        event.author === metadata.owner ||
                        event.author === botJid ||
                        event.author === participant ||
                        currentDevs.includes(event.author)
                    ) {
                        await client.sendMessage(event.id, {
                            text: 
`╭───「 🔽 𝐃𝐞𝐦𝐨çã𝐨 🔽 」
│ 😅 *@${participant.split("@")[0]} virou membro comum de novo.*  
│
│ 🤖 *Bot*: *9bot*
│ 🦁 *Grupo*: ${metadata.subject}
╰───「 🚀 Powered by *9bot* 🚀 」`,
                            mentions: [participant]
                        });
                        return;
                    }

                    await client.groupParticipantsUpdate(event.id, [event.author], "demote");
                    await client.groupParticipantsUpdate(event.id, [participant], "promote");

                    await client.sendMessage(event.id, {
                        text: 
`╭───「 🔽 𝐀𝐧𝐭𝐢𝐝𝐞𝐦𝐨𝐭𝐞 🔽 」
│ 😉 *@${event.author.split("@")[0]} foi rebaixado por tentar tirar o cargo de @${participant.split("@")[0]}.*  
│
│ 🤖 *Bot*: *9bot*
│ 🦁 *Grupo*: ${metadata.subject}
│ 📜 *Regra*: Antidemote ativo — só donos e admins autorizados podem rebaixar.
╰───「 🚀 Powered by *9bot* 🚀 」`,
                        mentions: [event.author, participant]
                    });
                } catch {
                    // Ignora erros
                }
            } else if (event.action === "promote" && antipromote) {
                try {
                    if (
                        event.author === metadata.owner ||
                        event.author === botJid ||
                        event.author === participant ||
                        currentDevs.includes(event.author)
                    ) {
                        await client.sendMessage(event.id, {
                            text: 
`╭───「 🔼 𝐏𝐫𝐨𝐦𝐨çã𝐨 🔼 」
│ 😎 *@${participant.split("@")[0]} agora é administrador(a) do grupo!*  
│
│ 🤖 *Bot*: *9bot*
│ 🦁 *Grupo*: ${metadata.subject}
╰───「 🚀 Powered by *9bot* 🚀 」`,
                            mentions: [participant]
                        });
                        return;
                    }

                    await client.groupParticipantsUpdate(event.id, [event.author, participant], "demote");

                    await client.sendMessage(event.id, {
                        text: 
`╭───「 🔼 𝐀𝐧𝐭𝐢𝐩𝐫𝐨𝐦𝐨𝐭𝐞 🔼 」
│ 😆 *@${event.author.split("@")[0]} foi rebaixado por tentar promover @${participant.split("@")[0]} sem permissão.*  
│
│ 🤖 *Bot*: *9bot*
│ 🦁 *Grupo*: ${metadata.subject}
│ 📜 *Regra*: Antipromote ativo — só a galera autorizada pode promover.
╰───「 🚀 Powered by *9bot* 🚀 」`,
                        mentions: [event.author, participant]
                    });
                } catch {
                    // Erros são ignorados
                }
            }
        }
    } catch {
        try {
            await client.sendMessage(event.id, {
                text: 
`╭───「 ⚠️ 𝐄𝐫𝐫𝐨 𝐧𝐨 𝐄𝐯𝐞𝐧𝐭𝐨 ⚠️ 」
│ 😬 *Algo deu errado ao processar o evento do grupo.*  
│
│ 🤖 *Bot*: *9bot*
│ 🦁 *Grupo*: ${metadata.subject}
│ 🔁 *Tente novamente em alguns instantes.*
╰───「 🚀 Powered by *9bot* 🚀 」`
            });
        } catch {
            // Se até isso falhar, hoje não é o dia 😅
        }
    }
};

module.exports = Events;
