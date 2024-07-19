// NAME: Copy to clipboard
// AUTHOR: uAreASimp
// VERSION: 0.1.0
// DESCRIPTION: Copies a song's cover
/// <reference path="../../../Local/spicetify/globals.d.ts" />

(async function copyCurrentSongImageExtension() {
    function initialize() {
        // Check if Spicetify is ready
        if (!(Spicetify.ContextMenu && Spicetify.URI && Spicetify.SVGIcons && Spicetify.Menu && Spicetify.Platform && Spicetify.ReactJSX && Spicetify.CosmosAsync)) {
            console.log("Spicetify not ready, retrying in 10ms...");
            setTimeout(initialize, 10);
            return;
        }
        console.log("Spicetify is ready. Initializing script...");

        const { Type } = Spicetify.URI;

        // Function to copy text to clipboard
        function copyToClipboard(text) {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            Spicetify.showNotification("Copied to clipboard!");
        }

        function ifItemIsTrack(uris) {
            const uriObj = Spicetify.URI.fromString(uris[0]);
            return uriObj.type === Type.TRACK;
        }

        // Function to get the current song's image URL
        async function getCurrentSongImageURL(size, uris) {
            const uri = uris[0];
            try {
                const trackData = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/tracks/${uri.split(':')[2]}`);
                const images = trackData.album.images;
                if (images.length === 0) {
                    Spicetify.showNotification("No images available for this track!");
                    return null;
                }

                // Get the appropriate image size
                let imageUrl;
                if (size === 0) {
                    imageUrl = images[0].url; // Large image
                } else if (size === 1 && images.length > 1) {
                    imageUrl = images[1].url; // Medium image
                } else if (size === 2 && images.length > 2) {
                    imageUrl = images[2].url; // Small image
                } else {
                    imageUrl = images[images.length - 1].url; // Default to the smallest available image
                }

                return imageUrl;
            } catch (error) {
                console.error("Error fetching track data:", error);
                Spicetify.showNotification("Failed to fetch track data!");
                return null;
            }
        }

        async function copyCover(size, uris) {
            const imageUrl = await getCurrentSongImageURL(size, uris);
            if (imageUrl) {
                copyToClipboard(imageUrl);
            }
        }

        // Create menu items
        const menuItem1 = new Spicetify.ContextMenu.Item(
            "Copy large cover",
            (uris) => copyCover(0, uris),
            ifItemIsTrack,
            Spicetify.SVGIcons["copy"]
        );

        const menuItem2 = new Spicetify.ContextMenu.Item(
            "Copy medium cover",
            (uris) => copyCover(1, uris),
            ifItemIsTrack,
            Spicetify.SVGIcons["copy"]
        );

        const menuItem3 = new Spicetify.ContextMenu.Item(
            "Copy small cover",
            (uris) => copyCover(2, uris),
            ifItemIsTrack,
            Spicetify.SVGIcons["copy"]
        );

        const menuItem4 = new Spicetify.ContextMenu.Item(
            "Copy smallest cover",
            (uris) => copyCover(3, uris),
            ifItemIsTrack,
            Spicetify.SVGIcons["copy"]
        );

        const subMenu = new Spicetify.ContextMenu.SubMenu(
            "Copy cover", 
            [menuItem1, menuItem2, menuItem3, menuItem4], 
            ifItemIsTrack
        );

        // Register the sub menu
        subMenu.register();

        console.log("Copy to clipboard extension loaded.");
    }

    initialize();
})();
