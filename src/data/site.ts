// All editable site content lives here. Change copy, prices or links in one place.

export const site = {
  name: 'Sat Manav Tattoos',
  tagline: 'Tattoos & Talismans',
  description:
    'Sacred, custom tattoos by yogi-artist Bhagavan Das Shyam (Shug) in Farmington, Maine. Each piece is co-created with intention, completed with ceremony and empowered as a living talisman.',
  url: 'https://satmanavyogitattoos.com',
  mantra: 'Om Narbhavi Swaha',
  artist: {
    name: 'Bhagavan Das Shyam',
    nickname: 'Shug',
    years: 25,
  },
  contact: {
    street: '186 Main St. Suite #3',
    city: 'Farmington',
    region: 'ME',
    postal: '04938',
    phone: '(207) 542-6606',
    phoneHref: 'tel:+12075426606',
    email: 'satmanavyogi@gmail.com',
    mapsUrl: 'https://maps.google.com/?q=186+Main+St+Suite+3+Farmington+ME+04938',
  },
  social: {
    instagram: 'https://www.instagram.com/satmanavyogi_tattoo/',
    facebook: 'https://www.facebook.com/satmanavyogitattoos',
  },
  // Optional: set PUBLIC_FORM_ENDPOINT in Vercel (e.g. a Formspree / Basin URL) to receive
  // Journey submissions directly. Without it, the form opens a pre-filled email instead.
  formEndpoint: import.meta.env.PUBLIC_FORM_ENDPOINT ?? '',
};

export const nav = [
  { href: '/#approach', label: 'Approach' },
  { href: '/#process', label: 'Process' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/shop', label: 'Shop' },
  { href: '/#offerings', label: 'Offerings' },
  { href: '/#visit', label: 'Visit' },
];

export type GalleryItem = { slug: string; alt: string; title: string; w: number; h: number };

export const gallery: GalleryItem[] = [
  { slug: 'tiger-back', title: 'Tiger Rising', alt: 'Full back piece: a tiger rising through waves and blossoms', w: 956, h: 2048 },
  { slug: 'ganesha-back', title: 'Ganesha', alt: 'Full back piece: Ganesha in fine black-and-grey linework', w: 957, h: 2048 },
  { slug: 'peony-sleeve', title: 'Peony & Wind', alt: 'Full sleeve: red peonies and dark wind bars', w: 1200, h: 1834 },
  { slug: 'tiger-chest', title: 'Leaping Tiger', alt: 'Chest piece: a leaping tiger among clouds', w: 956, h: 2048 },
  { slug: 'crown-head', title: 'Crown Mandala', alt: 'Crown of the head: sacred mandala pattern', w: 956, h: 2048 },
  { slug: 'guardian-back', title: 'Guardian', alt: 'Full back piece: a fierce Himalayan guardian mask', w: 946, h: 2048 },
  { slug: 'sanskrit-ribs', title: 'Sacred Script', alt: 'Ribs: flowing Sanskrit script', w: 1105, h: 2048 },
  { slug: 'tiger-bodysuit', title: 'Tiger & Deity', alt: 'Side and sleeve: tiger, deity and koi in full colour', w: 1140, h: 2048 },
  { slug: 'serpent-sleeve', title: 'Naga', alt: 'Sleeve: serpentine black-work with ornamental scales', w: 956, h: 2048 },
  { slug: 'guardian-sleeve', title: 'Guardian Lion', alt: 'Half sleeve: guardian lion in black-and-grey', w: 957, h: 2048 },
];

export type Product = {
  slug: string;
  name: string;
  price: number;
  kind: 'Art print' | 'Aftercare';
  blurb: string;
  details: string[];
  images: { src: string; alt: string }[];
  // Paste a Stripe / Square payment link here to enable instant checkout.
  checkoutUrl?: string;
};

export const products: Product[] = [
  {
    slug: 'saraswati-and-dragon-print',
    name: 'Saraswati and Dragon',
    price: 120,
    kind: 'Art print',
    blurb: 'Saraswati, goddess of wisdom, music and learning, rides with a coiling dragon. An original painting by Shug, reproduced as a print.',
    details: ['Original artwork by Bhagavan Das Shyam', 'Ships unframed'],
    images: [{ src: '/images/shop/saraswati.webp', alt: 'Painting of Saraswati playing the veena above a golden dragon' }],
  },
  {
    slug: 'tiger-on-waterfall-print',
    name: 'Tiger on Waterfall',
    price: 20,
    kind: 'Art print',
    blurb: 'A black-and-grey tiger descending a waterfall through bamboo: strength meeting flow. Print of an original drawing by Shug.',
    details: ['Original drawing by Bhagavan Das Shyam', 'Ships unframed'],
    images: [{ src: '/images/shop/tiger-waterfall.webp', alt: 'Ink drawing of a tiger on a waterfall with bamboo' }],
  },
  {
    slug: 'sat-manav-tattoo-salve',
    name: 'Sat Manav Tattoo Salve',
    price: 20,
    kind: 'Aftercare',
    blurb: 'The healing balm Shug sends home with clients. A gentle salve to nourish fresh ink through the vulnerable first weeks.',
    details: ['Pocket-sized tin', 'For fresh and healed tattoos'],
    images: [
      { src: '/images/shop/salve-1.webp', alt: 'Sat Manav Tattoo Salve tin on a dark wooden surface' },
      { src: '/images/shop/salve-2.webp', alt: 'Open tin showing the pale golden salve' },
      { src: '/images/shop/salve-3.webp', alt: 'A stack of Sat Manav salve tins' },
    ],
  },
  {
    slug: 'surya-sunscreen',
    name: 'Surya Sunscreen',
    price: 25,
    kind: 'Aftercare',
    blurb: 'Named for the sun deity. An all-natural sunscreen stick, made in Maine, to keep healed tattoos bright for years.',
    details: ['All-natural ingredients', 'Made in Maine'],
    images: [
      { src: '/images/shop/surya-1.webp', alt: 'Surya sunscreen stick in a black tube' },
      { src: '/images/shop/surya-2.webp', alt: 'Surya sunscreen next to an open tin of salve' },
    ],
  },
];

export const process = [
  {
    n: '01',
    title: 'Set an intention',
    sanskrit: 'Sankalpa',
    text: 'Share what you hope the tattoo will hold: a release, a threshold, a protection, a prayer. The Journey form is simply a place to start.',
  },
  {
    n: '02',
    title: 'Co-create the design',
    sanskrit: 'Darshan',
    text: 'In consultation we listen for the image together, refining symbol, size and placement until it feels unmistakably yours.',
  },
  {
    n: '03',
    title: 'Ceremony & tattooing',
    sanskrit: 'Puja',
    text: 'Sessions open with grounding and intention. The studio is calm, clean and unhurried, and you are cared for through every break.',
  },
  {
    n: '04',
    title: 'Empowerment & healing',
    sanskrit: 'Prana Pratishta',
    text: 'The finished work is empowered through yogic ritual, then supported with aftercare and optional purification practices.',
  },
];

// Long-form teachings, edited for clarity. Shown as expandable panels.
export const teachings = [
  {
    id: 'intro',
    title: 'Intro to sacred tattooing',
    lead: 'Tattoos speak in pattern and natural form, calling us back to balance with ourselves and the world.',
    body: [
      'Across time, yogis and seers have embodied this voice. It pierces the veil of the everyday mind and expands how we see ourselves and one another, and from that wider view, real change follows.',
      'Sacred tattoo design grows out of this practice of realization, which goes far beyond the standards of the modern tattoo industry. Sat Manav Tattoos exists to keep this rare view of an ancient craft alive, for the benefit of all beings.',
    ],
  },
  {
    id: 'preparation',
    title: 'Preparing for your consultation',
    lead: 'Before we meet, make a little room to listen inward.',
    body: [
      'Set aside time to reflect or meditate on your life and on your intentions going forward. Notice any unusual thoughts, insights or synchronicities that arise; they are often part of the design.',
      'For your consultation and for every session, leave some space afterwards. Try not to rush straight back into work or family demands, so you can stay with your inner experience.',
    ],
  },
  {
    id: 'purification',
    title: 'Purification & aftercare',
    lead: 'Tattooing is itself a purification, and the healing window afterwards deserves care.',
    body: [
      'The skin is our largest organ and the sheath between inner and outer worlds. When it is opened, the body becomes more sensitive to its surroundings. The immune response it triggers is often used to release old impurities, physical and emotional.',
      'To support that release, you can choose additional practices: personal instruction in meditation, pranayama or yoga asana; consultations with Sat Manav’s natural healers; bodywork and spinal alignment; or a personal retreat at Sat Manav Yoga Ashram. How deeply you engage is entirely up to you.',
    ],
  },
  {
    id: 'times',
    title: 'Tattooing in our times',
    lead: 'In days past, tattoos marked new chapters. They still can.',
    body: [
      'Many cultures understood the power of controlled pain to release trauma and loosen the limits of the past. Once released, new patterns could take shape, and the tattoo marked that new chapter with hope and confidence.',
      'A tattoo made with clear intention becomes a living talisman on your path. Some traditions held that ancestors would recognise us by our markings. In a disconnected world, sacred marks can still re-establish connection to our shared values: compassion for all beings and care for the planet.',
    ],
  },
  {
    id: 'empowering',
    title: 'Empowering your tattoo',
    lead: 'Form infused with intention and charged with life force.',
    body: [
      'Spiritual traditions have long held that prana, the life force, can be transferred into an object such as a sacred stone or statue, charging it with intention. This practice, prana pratishta, also lives in sacred tattoo traditions like Thai Sak Yant.',
      'Drawing on in-depth training in yogic ritual, Shug completes each tattoo journey with an empowerment ceremony that binds the beginning, middle and end of the work into one living whole.',
    ],
  },
];

export type Testimonial = { name: string; quote: string; more?: string };

export const testimonials: Testimonial[] = [
  {
    name: 'Audrey',
    quote: 'The piece feels like a collaborative one in the best way, and absolutely pure.',
    more: 'Shug held space for the full intention of my tattoo. We spent time mixing colors together, we laughed, we shared stories.',
  },
  {
    name: 'Love',
    quote: 'Absolutely walked away from the experience with much more than just a tattoo.',
    more: 'Atmosphere was 10/10, from the relaxing music to the gentle scents of palo santo.',
  },
  {
    name: 'Otto',
    quote: 'I spent 3 years looking for the right artist and just as I gave up on my search Shug came into my life.',
    more: 'Receiving a tattoo from Shug is a spiritual endeavor all in itself.',
  },
  {
    name: 'Justin',
    quote: 'This is the first time that I’ve ever had a tattoo artist be so intentional and thoughtful of what my next tattoo was going to be.',
  },
  {
    name: 'Jess',
    quote: 'There is genuine power behind the art that will benefit the wearer.',
    more: 'His line work, coloring, and shading skills are top notch. I felt comfortable throughout a 6 hour session.',
  },
  {
    name: 'Farrah',
    quote: 'I am absolutely in love with my tattoo and I smile every time I look at it.',
    more: 'He provided a beautiful grounding and intention ritual. I felt contained and held in the space he has created.',
  },
  {
    name: 'Jen',
    quote: 'The inclusion of the ceremonies made the finished tattoo that much more meaningful.',
    more: 'This piece came out more perfectly than I could have ever imagined.',
  },
  {
    name: 'Ciaran',
    quote: 'His belief in the power of tattoo guides all aspects of the process.',
  },
  {
    name: 'Meg',
    quote: 'I have received 2 tattoos so far and plan on adding to them. Love them and this place!',
  },
];

export const offerings = [
  {
    title: 'Yantras & sacred geometry',
    icon: 'yantra',
    text: 'Initiated in the sacred art of yantra creation, Shug paints energetic geometric talismans, regularly commissioned for homes and practice spaces.',
  },
  {
    title: 'Tattoo retreats',
    icon: 'retreat',
    text: 'A focused, immersive tattoo journey at Sat Manav Ashram, shaped around your piece, your intention and your pace.',
  },
  {
    title: 'Woodworking & carpentry',
    icon: 'wood',
    text: 'Custom building, natural construction, carving and furniture that reflect the beauty and simplicity of yogic life.',
  },
  {
    title: 'Kirtan with Shiva Lila',
    icon: 'kirtan',
    text: 'The yogi trio of Sat Manav Ashram. Call-and-response Sanskrit chant (Nada Yoga, union with sacred sound) celebrating life itself.',
  },
];
