/* ------------------------------------------------------------------
   BLAKE & KAT — the only file you need to edit.

   Replace each [INSERT …] with the real thing. Anything still wrapped
   in square brackets is shown on the page as an unfilled placeholder.
------------------------------------------------------------------- */
window.INVITATION = {
  // Scene 3 — The Details
  date: "December 18",
  location: "Hotel Bel-Air",

  // Scene 5 — The Story So Far (the three acts are written in index.html)
  evening: {
    // Optional. A link shown beneath the story so she can peruse the menu.
    // Set url to "" to hide it.
    dinnerMenu: {
      label: "Peruse the menu",
      venue: "The Restaurant at Hotel Bel-Air",
      url: "https://cms.dorchestercollection.com/media/ylufc2jp/hotel-bel-air_restaurant-sample-dinner-menu.pdf",
    },
  },

  // Scene 6 — The RSVP
  rsvp: {
    // Optional. A URL that accepts a JSON POST ({ reply, at }) — e.g. a
    // Formspree form or your own endpoint. Leave empty to skip.
    endpoint: "",

    // Optional. A link offered after she replies so the answer reaches you,
    // e.g. "sms:+15555550123?&body=With%20pleasure." or "mailto:you@example.com".
    // Leave empty and the reply is simply remembered on her device.
    replyLink: "",
    replyLinkLabel: "Send word to Blake",
  },
};
