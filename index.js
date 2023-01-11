const { DisconnectReason, useMultiFileAuthState } = require('@adiwajshing/baileys');
const makeWASocket = require("@adiwajshing/baileys").default;
const { Boom } = require('@hapi/boom');

async function connectToWhatsApp () {
  const {state, saveCreds} = await useMultiFileAuthState('auth');
   const sock = makeWASocket({
       // can provide additional config here
        printQRInTerminal: true,
        auth: state
    });
    sock.ev.on("creds.update", saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error == Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    })
    sock.ev.on('messages.upsert', async m => {
//       console.log(JSON.stringify(m, undefined, 2))
    const msg = m.messages[0];
    const nama = msg.pushName;
    const nomer = msg.key.remoteJid;
    const rpesan = msg.message.conversation;
    const ssd = "Nama Pengirim  : "+nama+"\nNomer pengirim : "+nomer.replace('@s.whatsapp.net','')+"\nIsi pesan      : "+rpesan+"\n";
      if(!msg.key.fromMe && m.type == "notify"){
        console.log(ssd);
       ///AWALAN PESAN
       if(rpesan == 'Hallo'){
         const hall = "Hallo "+nama;
         await sock.sendMessage(nomer, {
           text: hall});
       }else{
      await sock.sendMessage(nomer, { 
        text: 'Hallo kak '+nama+'\n\nSelamat datang di Wanda-BOT ' });
       }






      }///AKHIRAN PESAN
    })
}
// run in main file
connectToWhatsApp();

