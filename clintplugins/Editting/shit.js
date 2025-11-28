const canvacord = require("canvacord");

module.exports = async (context) => {
    const { client, m, Tag, botname } = context;

    let cap = `◈━━━━━━━━━━━━━━━━◈
│❒ Convertido por ${botname}
◈━━━━━━━━━━━━━━━━◈`;

    try {
        let img;

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, "image");
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
            result = await canvacord.Canvacord.shit(img);

        } else if (Tag) {
            try {
                const target = Tag[0] || m.sender;
                img = await client.profilePictureUrl(target, "image");
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
            }
            result = await canvacord.Canvacord.shit(img);
        }

        await client.sendMessage(
            m.chat,
            { image: result, caption: cap },
            { quoted: m }
        );

    } catch (e) {
        m.reply(`◈━━━━━━━━━━━━━━━━◈
│❒ Algo deu errado. 😞
◈━━━━━━━━━━━━━━━━◈`);
    }
};
