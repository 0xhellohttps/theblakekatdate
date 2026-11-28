/* ------------------------------------------------------------------
   KATFLIX — what's on.

   To post a new episode, copy one entry, change the details, and put
   its video and poster image in film/web/. The first entry marked
   featured: true is shown large at the top of the page.

   An entry with no "video" shows as "Coming soon".
------------------------------------------------------------------- */
window.EPISODES = [
  {
    id: 'episode-1',
    row: 'Episodes',
    label: 'Episode One',
    title: 'The Point-Two',
    length: '6 min 30',
    blurb: 'Blake and Kat attempt a run of historic proportions: 0.2 miles. There are nice houses, an invitation to Georgia, warm cookies, two phone calls and one classified surprise. Narrated by Chicken Nugget, who wins.',
    poster: 'film/web/episode-1-poster.jpg',
    backdrop: 'film/web/episode-1-still.jpg',
    video: 'film/web/episode-1.mp4',
    featured: true,
  },
  {
    id: 'episode-2',
    row: 'Episodes',
    label: 'Episode Two',
    title: 'Starting to Talk',
    length: '6 min 55',
    blurb: 'One phone call between Atlanta and Los Angeles that was supposed to be short. Three hours, two bowls of chicken and rice, a Swiss Demon, two phones, and nothing left out. Narrated by Chicken Nugget, who is also the clock.',
    poster: 'film/web/episode-2-poster.jpg',
    backdrop: 'film/web/episode-2-still.jpg',
    video: 'film/web/episode-2.mp4',
  },
  {
    id: 'episode-3',
    row: 'Episodes',
    label: 'Episode Three',
    title: 'To Be Continued',
    length: 'Very soon',
    blurb: 'There is a golf tournament to win. And then a phone call to make.',
  },
  {
    id: 'the-film',
    row: 'Films & Specials',
    label: 'A short film',
    title: 'The Beginning of Something',
    length: '1 min 25',
    blurb: 'From a message, to a conversation, to very soon. The story so far, ending on the invitation.',
    poster: 'film/web/poster-16x9.jpg',
    video: 'film/web/film-16x9.mp4',
    videoPortrait: 'film/web/film-9x16.mp4',
  },
];
