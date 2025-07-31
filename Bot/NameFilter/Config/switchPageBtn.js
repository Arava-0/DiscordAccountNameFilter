const Core = require("../../../Core");
const { genDisplayPage } = require('./displayer');

module.exports = {
    id: "namefilter-page-{!}",
    noDeferred: true,
    ephemeral: true,
    type: `button`,

    async execute(interaction, client, page) {
        const database = await Core.getConfigFile("nameFilterConfig");
        if (Core.isNullOrUndefined(database)) {
            return interaction.editReply({
                content: `${client.config.emote.error} The name filter configuration file is not found.`,
                ephemeral: true
            });
        }

        if (Core.isNullOrUndefined(database.invalidPseudos) || !Array.isArray(database.invalidPseudos)) {
            database.invalidPseudos = [];
            await Core.updateConfig("nameFilterConfig", database);
        }
        const { embed, components } = await genDisplayPage(client, database.invalidPseudos, page);;

        return interaction.editReply({
            embeds: [embed],
            components: components
        });
    }
};
