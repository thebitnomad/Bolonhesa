const {
  default: toxicConnect,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestWaWebVersion,
  makeInMemoryStore,
  downloadContentFromMessage,
  jidDecode,
  proto,
  getContentType,
  makeCacheableSignalKeyStore,
  Browsers
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const path = require("path");
const FileType = require("file-type");
const { exec, spawn, execSync } = require("child_process");
const axios = require("axios");
const chalk = require("chalk");
const figlet = require("figlet");
const express = require("express");
const app = express();
const port = process.env.PORT || 10000;
const _ = require("lodash");
const PhoneNumber = require("awesome-phonenumber");
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('../lib/exif');
const { isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('../lib/botFunctions');
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

const authenticationn = require('../Auth/auth.js');
const { smsg } = require('../Handler/smsg');
const { getSettings, getBannedUsers, banUser } = require("../Database/config");

const { botname } = require('../Env/settings');
const { DateTime } = require('luxon');
const { commands, totalCommands } = require('../Handler/commandHandler');

const sessionName = path.join(__dirname, '..', 'Session');

const groupEvents = require("../Handler/eventHandler");
const groupEvents2 = require("../Handler/eventHandler");
const connectionHandler = require('../Handler/connectionHandler');
const antidelete = require('../Functions/antidelete');
const antilink = require('../Functions/antilink');

// Function to write session from environment variable to creds.json
function writeSessionToCreds() {
  try {
    if (process.env.SESSION) {
      console.log('📝 Writing session data from environment variable to creds.json...');
      
      // Ensure Session directory exists
      if (!fs.existsSync(sessionName)) {
        fs.mkdirSync(sessionName, { recursive: true });
        console.log('✅ Created Session directory');
      }

      // Parse the session data
      let sessionData;
      if (typeof process.env.SESSION === 'string') {
        sessionData = JSON.parse(process.env.SESSION);
      } else {
        sessionData = process.env.SESSION;
      }

      // Write to creds.json
      const credsPath = path.join(sessionName, 'creds.json');
      fs.writeFileSync(credsPath, JSON.stringify(sessionData, null, 2));
      console.log('✅ Successfully wrote creds.json from environment variable');
      
      return true;
    } else {
      console.log('ℹ️  No SESSION environment variable found, using existing auth state');
      return false;
    }
  } catch (error) {
    console.error('❌ Error writing session to creds.json:', error);
    return false;
  }
}

// Simple function to check if session is valid
function isSessionValid(sessionData) {
  try {
    if (!sessionData) return false;
    if (!sessionData.me || !sessionData.me.id) return false;
    if (!sessionData.registered) return false;
    return true;
  } catch (error) {
    return false;
  }
}

const { checkDatabaseConnection } = require("../Database/config");

async function initializeApp() {
  console.log('🚀 Starting Toxic-MD initialization...');

  // First, write session data if available
  const sessionWritten = writeSessionToCreds();

  // Wait for database to be ready
  let dbConnected = false;
  let attempts = 0;

  while (!dbConnected && attempts < 10) {
    dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      console.log(`⏳ Database not ready, waiting... (attempt ${attempts + 1}/10)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    attempts++;
  }

  if (!dbConnected) {
    console.log('❌ Could not connect to database after 10 attempts');
    console.log('💡 Checking DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    process.exit(1);
  }

  console.log('✅ Database connected successfully!');

  // Now initialize authentication
  authenticationn();
}

async function startToxic() {
  let settingss = await getSettings();
  if (!settingss) {
    console.log(
      `◈━━━━━━━━━━━━━━━━◈\n` +
      `│❒ TOXIC-MD FAILED TO CONNECT 😵\n` +
      `│❒ Settings not found, check your database! 🖕\n` +
      `┗━━━━━━━━━━━━━━━┛`
    );
    return;
  }

  const { autobio, mode, anticall } = settingss;
  const { version } = await fetchLatestWaWebVersion();

  // Check if we have valid session data
  let authState;
  let usingEnvSession = false;
  
  if (process.env.SESSION) {
    try {
      const sessionData = typeof process.env.SESSION === 'string' ? JSON.parse(process.env.SESSION) : process.env.SESSION;
      
      if (isSessionValid(sessionData)) {
        console.log('🔑 Using session data from environment variable');
        // Use multi-file auth state since we already wrote the creds.json
        authState = await useMultiFileAuthState(sessionName);
        usingEnvSession = true;
      } else {
        console.log('❌ Invalid session data in environment, falling back to file auth state');
        authState = await useMultiFileAuthState(sessionName);
      }
    } catch (error) {
      console.error('❌ Failed to parse session from environment, falling back to file auth state:', error.message);
      authState = await useMultiFileAuthState(sessionName);
    }
  } else {
    console.log('📁 Using multi-file auth state');
    authState = await useMultiFileAuthState(sessionName);
  }

  const { saveCreds, state } = authState;

  // Check if we have valid credentials
  if (!state.creds || !state.creds.registered) {
    console.log('❌ No valid session found, will show QR code...');
  } else {
    console.log('✅ Valid session found, connecting...');
  }

  const client = toxicConnect({
    printQRInTerminal: !usingEnvSession || !state.creds.registered, // Show QR if no valid session
    syncFullHistory: true,
    markOnlineOnConnect: true,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000, 
    generateHighQualityLinkPreview: true, 
    patchMessageBeforeSending: (message) => { 
      const requiresPatch = !!(
        message.buttonsMessage ||
        message.templateMessage ||
        message.listMessage
      );
      if (requiresPatch) {
        message = {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadataVersion: 2,
                deviceListMetadata: {},
              },
              ...message,
            },
          },
        };
      }
      return message;
    },
    version: version,
    browser: ["Ubuntu", "Chrome", "125"], 
    logger: pino({ level: 'silent' }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: 'silent', stream: 'store' })),
    }
  });

  store.bind(client.ev);

  setInterval(() => {
    store.writeToFile("store.json");
  }, 3000);

  if (autobio) {
    setInterval(() => {
      const date = new Date();
      client.updateProfileStatus(
        `${botname} 𝐢𝐬 𝐚𝐜𝐭𝐢𝐯𝐞 𝟐𝟒/𝟕\n\n${date.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })} 𝐈𝐭'𝐬 𝐚 ${date.toLocaleString('en-US', { weekday: 'long', timeZone: 'Africa/Nairobi' })}.`
      );
    }, 10 * 1000);
  }

  const processedCalls = new Set();

  client.ws.on('CB:call', async (json) => {
    const settingszs = await getSettings();
    if (!settingszs?.anticall) return;

    const callId = json.content[0].attrs['call-id'];
    const callerJid = json.content[0].attrs['call-creator'];
    const callerNumber = callerJid.replace(/[@.a-z]/g, "");

    if (processedCalls.has(callId)) {
      return;
    }
    processedCalls.add(callId);

    const fakeQuoted = {
      key: {
        participant: '0@s.whatsapp.net',
        remoteJid: '0@s.whatsapp.net',
        id: callId
      },
      message: {
        conversation: "Toxic Verified By WhatsApp"
      },
      contextInfo: {
        mentionedJid: [callerJid],
        forwardingScore: 999,
        isForwarded: true
      }
    };

    await client.rejectCall(callId, callerJid);
    await client.sendMessage(callerJid, { 
      text: "> You Have been banned for calling without permission ⚠️!" 
    }, { quoted: fakeQuoted });

    const bannedUsers = await getBannedUsers();
    if (!bannedUsers.includes(callerNumber)) {
      await banUser(callerNumber);
    }
  });

  client.ev.on("messages.upsert", async ({ messages }) => {
    let settings = await getSettings();
    if (!settings) return;

    const { autoread, autolike, autoview, presence } = settings;

    let mek = messages[0];
    if (!mek || !mek.key || !mek.message) return;

    mek.message = Object.keys(mek.message)[0] === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;

    const remoteJid = mek.key.remoteJid;
    const sender = client.decodeJid(mek.key.participant || mek.key.remoteJid);
    const Myself = client.decodeJid(client.user.id);

    if (typeof antidelete !== 'function') {
      console.error('Toxic-MD Error: antidelete is not a function');
      return;
    }
    if (typeof antilink !== 'function') {
      console.error('Toxic-MD Error: antilink is not a function');
      return;
    }

    await antidelete(client, mek, store, fs.readFileSync(path.resolve(__dirname, '../toxic.jpg')));
    await antilink(client, mek, store);

    if (autolike && mek.key && mek.key.remoteJid === "status@broadcast") {
      const nickk = await client.decodeJid(client.user.id);
      const emojis = ['🗿', '⌚️', '💠', '👣', '🥲', '💔', '🤍', '❤️‍🔥', '💣', '🧠', '🦅', '🌻', '🧊', '🛑', '🧸', '👑', '📍', '😅', '🎭', '🎉', '😳', '💯', '🔥', '💫', '👽', '💗', '❤️‍🔥', '🥀', '👀', '🙌', '🙆', '🌟', '💧', '🦄', '🟢', '🎎', '✅', '🥱', '🌚', '💚', '💕', '😉', '😔'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      await client.sendMessage(mek.key.remoteJid, { react: { text: randomEmoji, key: mek.key } }, { statusJidList: [mek.key.participant, nickk] });
    }

    if (autoview && remoteJid === "status@broadcast") {
      await client.readMessages([mek.key]);
    } else if (autoread && remoteJid.endsWith('@s.whatsapp.net')) {
      await client.readMessages([mek.key]);
    }

    if (remoteJid.endsWith('@s.whatsapp.net')) {
      const Chat = remoteJid;
      if (presence === 'online') {
        await client.sendPresenceUpdate("available", Chat);
      } else if (presence === 'typing') {
        await client.sendPresenceUpdate("composing", Chat);
      } else if (presence === 'recording') {
        await client.sendPresenceUpdate("recording", Chat);
      } else {
        await client.sendPresenceUpdate("unavailable", Chat);
      }
    }

    if (!client.public && !mek.key.fromMe && messages.type === "notify") return;

    m = smsg(client, mek, store);
    require("./toxic")(client, m, { type: "notify" }, store);
  });

  client.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    if (msg.message.listResponseMessage) {
      const selectedCmd = msg.message.listResponseMessage.singleSelectReply.selectedRowId;

      const settings = await getSettings();
      const effectivePrefix = settings?.prefix || '.';

      let command = selectedCmd.startsWith(effectivePrefix)
        ? selectedCmd.slice(effectivePrefix.length).toLowerCase()
        : selectedCmd.toLowerCase();

      const m = {
        ...msg,
        body: selectedCmd,
        text: selectedCmd,
        command: command,
        prefix: effectivePrefix,
        sender: msg.key.remoteJid,
        from: msg.key.remoteJid,
        chat: msg.key.remoteJid,
        isGroup: msg.key.remoteJid.endsWith('@g.us')
      };

      try {
        require("./toxic")(client, m, { type: "notify" }, store);
      } catch (error) {
        console.error('Error processing list selection:', error);
      }
    }
  });

  const unhandledRejections = new Map();
  process.on("unhandledRejection", (reason, promise) => {
    unhandledRejections.set(promise, reason);
    console.error('Unhandled Rejection:', reason);
  });
  process.on("rejectionHandled", (promise) => {
    unhandledRejections.delete(promise);
  });
  process.on("Something went wrong", function (err) {});

  client.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    } else return jid;
  };

  client.getName = (jid, withoutContact = false) => {
    id = client.decodeJid(jid);
    withoutContact = client.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us"))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {};
        if (!(v.name || v.subject)) v = client.groupMetadata(id) || {};
        resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
      });
    else
      v = id === "0@s.whatsapp.net"
        ? { id, name: "WhatsApp" }
        : id === client.decodeJid(client.user.id)
        ? client.user
        : store.contacts[id] || {};
    return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
  };

  client.public = true;

  client.serializeM = (m) => smsg(client, m, store);

  client.ev.on("group-participants.update", async (m) => {
    groupEvents(client, m);
    groupEvents2(client, m);
  });

  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 5000;

  client.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    const reason = lastDisconnect?.error ? new Boom(lastDisconnect.error).output.statusCode : null;

    console.log('🔗 Connection update:', connection, 'Reason:', reason);

    if (connection === "open") {
      reconnectAttempts = 0;
      console.log('✅ WhatsApp connection established successfully!');
      console.log('🤖 Bot is now ready to receive messages!');
    }

    if (connection === "close") {
      console.log('❌ Connection closed, reason:', reason);
      
      if (reason === DisconnectReason.loggedOut || reason === 401) {
        console.log('❌ Logged out, clearing session...');
        // Clear the session files
        try {
          if (fs.existsSync(path.join(sessionName, 'creds.json'))) {
            fs.unlinkSync(path.join(sessionName, 'creds.json'));
          }
        } catch (error) {
          console.error('Error clearing session:', error);
        }
        console.log('🔄 Restarting bot...');
        setTimeout(() => startToxic(), 2000);
        return;
      }

      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts);
        reconnectAttempts++;
        console.log(`🔄 Reconnecting in ${delay/1000} seconds... (Attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
        setTimeout(() => startToxic(), delay);
      } else {
        console.log('❌ Max reconnection attempts reached. Please check your session data.');
        console.log('💡 If using environment session, verify the SESSION data is correct and complete.');
      }
    }

    await connectionHandler(client, update, startToxic);
  });

  client.ev.on("creds.update", saveCreds);

  client.sendText = (jid, text, quoted = "", options) => client.sendMessage(jid, { text: text, ...options }, { quoted });

  client.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };

  client.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await FileType.fromBuffer(buffer);
    const trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
    await fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
  };
}

app.use(express.static('public'));

app.get("/", (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));

// Start the app with database initialization
initializeApp().then(() => {
  startToxic();
});

module.exports = startToxic;

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});