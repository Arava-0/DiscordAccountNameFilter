const Core = require('./Core');

const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { User, Message, GuildMember, ThreadMember, Channel, Reaction } = Partials;

const client = new Client({
    intents: Object.values(GatewayIntentBits),
    partials: [User, Message, GuildMember, ThreadMember, Channel, Reaction]
});

require('dotenv').config();

client.login(process.env.TOKEN).then(async () => {
    Core.showInfo("LOGIN", "   Connexion à l'API Discord réussie | Pseudo: " + client.user.tag);
    await Core.shutdownHandler(client);
    await Core.initClient(client);
    await Core.errorHandler(client);
    await Core.loadEverything(client);
    await Core.cooldownService(client);
    await Core.launchPresenceService(client);
    Core.showInfo("READY", "   Bot prêt à l'emploi ! | Pseudo: " + client.user.tag);
    Core.ready(client);
})

module.exports = {
    client
}