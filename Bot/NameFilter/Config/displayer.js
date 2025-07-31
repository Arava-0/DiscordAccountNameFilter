const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const PAGE_SIZE = 15;

async function genDisplayPage(client, config, pageNumber) {
    const totalPages = Math.ceil(config.length / PAGE_SIZE);
    const components = [];
    const embed = new EmbedBuilder()
        .setTitle(`**NAME FILTER CONFIGURATION - PAGE ${pageNumber}**`)
        .setColor("#0099ff")
        .setFooter({ text: "Dév par Arava ❤️", iconURL: client.user.displayAvatarURL({ dynamic: true }) });

    if (config && config.length > 0) {
        const startIndex = (pageNumber - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const currentPageItems = config.slice(startIndex, endIndex);

        if (currentPageItems.length === 0) {
            embed.setDescription(`Aucun pseudo en plus. (Page ${pageNumber}/${totalPages})`);
        } else {
            embed.setDescription(`**Invalid Pseudos:**\n${currentPageItems.map((item, index) => `${startIndex + index + 1}. ${item}`).join("\n")}`);
        }
    } else {
        embed.setDescription("Aucun pseudo invalide configuré.");
    }

    components.push(
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`namefilter-page-${pageNumber - 1}`)
                    .setLabel("Précédent")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pageNumber == 1 || totalPages == 0),
                new ButtonBuilder()
                    .setCustomId(`namefilter-page-${pageNumber + 1}`)
                    .setLabel("Suivant")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pageNumber == totalPages || totalPages == 0),
            ),
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("namefilter-add")
                    .setLabel("Ajouter un pseudo")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("namefilter-remove")
                    .setLabel("Supprimer un pseudo")
                    .setStyle(ButtonStyle.Danger)
            )
    );

    return ({
        embed: embed,
        components: components
    });
}

module.exports = {
    genDisplayPage: genDisplayPage
};
