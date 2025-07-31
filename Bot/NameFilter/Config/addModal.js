const { EmbedBuilder } = require("discord.js");
const Core = require("../../../Core");
const { genDisplayPage } = require("./displayer");

module.exports = {
    id: "namefilter-add-modal",
    noDeferred: true,
    ephemeral: true,
    type: `modal`,

    async execute(interaction, client) {
        const content = interaction.fields.getTextInputValue("namefilter-add-input");
        const errorEmbed = []

        if (Core.isNullOrUndefined(content) || content.trim() === "") {
            errorEmbed.push(new EmbedBuilder()
                .setTitle(`${client.config.emote.error} **ERREUR**`)
                .setColor("#920E15")
                .setDescription("Vous devez entrer un pseudo valide.")
            );
        }

        const database = await Core.getConfigFile("nameFilterConfig");
        if (Core.isNullOrUndefined(database)) {
            errorEmbed.push(new EmbedBuilder()
                .setTitle(`${client.config.emote.error} **ERREUR**`)
                .setColor("#920E15")
                .setDescription("Le fichier de configuration du filtre de nom n'a pas été trouvé.")
            );
        }

        if (Core.isNullOrUndefined(database.invalidPseudos) || !Array.isArray(database.invalidPseudos)) {
            database.invalidPseudos = [];
            await Core.updateConfig("nameFilterConfig", database);
        }

        if (database.invalidPseudos.includes(content)) {
            errorEmbed.push(new EmbedBuilder()
                .setTitle(`${client.config.emote.error} **ERREUR**`)
                .setColor("#920E15")
                .setDescription(`Le pseudo \`${content}\` est déjà dans la liste des pseudos invalides.`)
            );
        }

        const currentPage = interaction.message.embeds[0].title;
        const titleRegex = /\*\*NAME FILTER CONFIGURATION - PAGE (\d+)\*\*/;
        const match = currentPage.match(titleRegex);
        const currentPageNumber = match ? parseInt(match[1], 10) : 1;

        if (errorEmbed.length > 0) {
            const { embed, components } = await genDisplayPage(client, database.invalidPseudos, currentPageNumber);

            await interaction.update({
                embeds: [embed, ...errorEmbed],
                components: components
            });
            return;
        }
        database.invalidPseudos.push(content.trim());
        await Core.updateConfig("nameFilterConfig", database);

        const successEmbed = new EmbedBuilder()
            .setTitle(`${client.config.emote.success} **SUCCÈS**`)
            .setColor("#00BF63")
            .setDescription(`Le pseudo \`${content}\` a été ajouté à la liste des pseudos invalides.`);

        const { embed, components } = await genDisplayPage(client, database.invalidPseudos, currentPageNumber);
        await interaction.update({
            embeds: [embed, successEmbed],
            components: components
        });
    }
};
