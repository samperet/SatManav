// All site content lives here. Copy is taken from the original satmanavyogitattoos.com.

export const site = {
  name: 'Sat Manav Tattoos',
  tagline: 'Tattoos & Talismans',
  description:
    'Sat Manav Tattoos are pathways to transformation, a connection to ancient wisdom, and an exploration of your inner self.',
  url: 'https://satmanavyogitattoos.com',
  mantra: 'Om Narbhavi Swaha',
  contact: {
    street: '186 Main St. Suite #3',
    city: 'Farmington',
    region: 'ME',
    postal: '04938',
    phone: '(207) 542-6606',
    phoneHref: 'tel:+12075426606',
    email: 'satmanavyogi@gmail.com',
  },
  social: {
    instagram: 'https://www.instagram.com/satmanavyogi_tattoo/',
    facebook: 'https://www.facebook.com/satmanavyogitattoos',
  },
  // Optional: set PUBLIC_FORM_ENDPOINT in Vercel (e.g. a Formspree URL) to receive Journey
  // submissions directly. Without it, the form opens a pre-filled email instead.
  formEndpoint: import.meta.env.PUBLIC_FORM_ENDPOINT ?? '',
};

export const nav = [
  { href: '/gallery', label: 'Gallery' },
  { href: '/shop', label: 'Shop' },
];

export const intro = {
  title: 'More than just ink',
  text: 'Sat Manav Tattoos are pathways to transformation, a connection to ancient wisdom, and an exploration of your inner self. Merge art with spirituality, and create tattoos that inspire, empower, and transcend.',
};

export const artist = {
  name: 'Bhagavan Das Shyam',
  text: 'Bhagavan Das Shyam (Shug) is a devoted practitioner of Yoga and the artist behind Sat manav Tattoos. With over 25 years of intensive training and practice, Shug infuses each tattoo with purpose, healing, and blessings. Guided by his Guru and empowered by ancient wisdom.',
};

export type GalleryItem = { slug: string; alt: string; w: number; h: number };

export const gallery: GalleryItem[] = [
  { slug: 'tiger-chest', alt: 'Tiger chest piece', w: 956, h: 2048 },
  { slug: 'ganesha-back', alt: 'Ganesha back piece', w: 957, h: 2048 },
  { slug: 'peony-sleeve', alt: 'Peony sleeve', w: 1200, h: 1834 },
  { slug: 'guardian-back', alt: 'Guardian back piece', w: 946, h: 2048 },
  { slug: 'crown-head', alt: 'Head tattoo', w: 956, h: 2048 },
  { slug: 'tiger-back', alt: 'Tiger back piece', w: 956, h: 2048 },
  { slug: 'guardian-sleeve', alt: 'Black-and-grey sleeve', w: 957, h: 2048 },
  { slug: 'sanskrit-ribs', alt: 'Sanskrit script tattoo', w: 1105, h: 2048 },
  { slug: 'tiger-bodysuit', alt: 'Full colour side and sleeve', w: 1140, h: 2048 },
  { slug: 'serpent-sleeve', alt: 'Black-work sleeve', w: 956, h: 2048 },
];

export type Product = {
  slug: string;
  name: string;
  price: number;
  images: { src: string; alt: string }[];
  // Paste a Stripe / Square payment link here to enable instant checkout.
  checkoutUrl?: string;
};

export const products: Product[] = [
  { slug: 'saraswati-and-dragon-print', name: 'Saraswati and Dragon', price: 120, images: [{ src: '/images/shop/saraswati.webp', alt: 'Saraswati and Dragon print' }] },
  { slug: 'tiger-on-waterfall-print', name: 'Tiger on Waterfall – Print', price: 20, images: [{ src: '/images/shop/tiger-waterfall.webp', alt: 'Tiger on Waterfall print' }] },
  {
    slug: 'sat-manav-tattoo-salve', name: 'Sat Manav Tattoo Salve', price: 20,
    images: [
      { src: '/images/shop/salve-1.webp', alt: 'Sat Manav Tattoo Salve' },
      { src: '/images/shop/salve-2.webp', alt: 'Sat Manav Tattoo Salve, open tin' },
      { src: '/images/shop/salve-3.webp', alt: 'Sat Manav Tattoo Salve tins' },
    ],
  },
  {
    slug: 'surya-sunscreen', name: 'Surya Sunscreen', price: 25,
    images: [
      { src: '/images/shop/surya-1.webp', alt: 'Surya Sunscreen' },
      { src: '/images/shop/surya-2.webp', alt: 'Surya Sunscreen with salve' },
    ],
  },
];

export const teachings = [
  {
    title: 'Intro to Sacred Tattooing',
    body: [
      'Tattoos talk in patterns, organic and natural forms. They call us from within to return to our pure state of existence and awareness, to a life that works in balance with the world and contributes to the overall wellbeing of all. Yogis and seers across time have embodied this voice, which pierces the veil of the mundane mind. By expanding the view of themselves and those around them, they inspire great positive change. Sacred tattoo design comes through this practice of true realization—one that goes far beyond the standards of the modern tattoo industry. It is the goal and dedication of Sat Manav Tattoos to uphold and continue this rare and sacred view of this ancient craft for the benefit of all beings. OM NARBHAVI SWAHA',
    ],
  },
  {
    title: 'Preparation',
    body: [
      'To prepare for your initial consultation, you want to expand your awareness.',
      'Set aside some time for contemplation. Reflect and meditate on life and your intentions moving forward.',
      'Pay attention to unique thoughts, insights, and synchronicities that may arise through your contemplations,',
      'Both for your initial appointment and for each tattoo session, please try to plan ahead and make sure that you have some time and space after your appointments. Try not to rush straight back into family dynamics, work, etc. You want to focus as much as possible on your internal experience, with minimal distractions.',
    ],
  },
  {
    title: 'Purification',
    body: [
      'The process of tattooing is itself a purification. Once the tattoo is complete there is a period of vulnerability before the skin has healed over. The skin is our largest organ, which constantly moves and reacts to the internal and external environment. The skin is also our sheath between the inner and the outer world. Once that sheath is broken, the body (particularly the area of the tattoo) becomes more vulnerable to its environment. Intentionally breaking the skin barrier also stimulates the immune response. Often the body will use this opportunity to release impurities, which can cause pain and negative energy. These impurities come in many forms, and it’s important to be aware of them and help release them.',
      'For this reason, I suggest additional practices to support purification. The level at which you engage in them is entirely up to you. If you are interested, we can discuss a wide array of possibilities, such as: personal instruction in meditation, pranayama, yoga asanas; health consultations with Sat Manav’s skilled natural healers; bodywork/massage/spinal alignment; a personal retreat at Sat Manav Yoga Ashram.',
    ],
  },
  {
    title: 'Tattooing in our times',
    body: [
      'In days past, magic and innate power were the driving forces behind the sacred craft of tattooing. Across different times and places, various cultures expressed their own versions of this ancient spiritual craft, yet all of them recognized the power of stimulating the pain response in a controlled environment to allow for impurities and negative trauma be released, expanding beyond limitations of our past. Once this release could happen, new patterns and direction could take shape. Tattoos marked this new chapter, bringing hope and confidence into the wearers life for what may lie ahead.',
      'A tattoo created with specific intention gives you a living talisman that becomes a part of your life and path. Some cultures also believed that after death a person would be identified by their ancestors through the markings they wore. This idea, though somewhat lost within time, can still hold true for a modern person living in a disconnected world out of balance. Though we are living in a world that has oppressed the customs and ceremonial ways of the past, does this mean we should all submit and identify with shallow self-serving values? How do we look for opportunities to reestablish connection? Or looking to identify and express our innate values as a human species, unified in reality, defined by compassion for all beings, and seeking to defend the planet and benefit all.',
    ],
  },
  {
    title: 'Empowering your tattoo',
    body: [
      'Traditionally and spiritually speaking, the skin is a projection screen for the physical, emotional, and spiritual state of the individual. What happens when we manipulate the skin with permanent marks? A form has now been inscribed onto you, and can bring you powerful insight. What happens when living tissue is manipulated by an outside force? Trust that the end result and the means to get there will be worth the investment. The more we explore this process and focus in on its potential, the more tattooing becomes a magical possibility for divine transformation. Since ancient times, spiritual peoples have recognized that it is possible to transfer energy (prana) from something living into an inanimate object, like a sacred stone or statue. Once this transference has been made, the literal particles that compose the object become charged and infused with intention and energy. As many accounts attest, the object can even become animated and exhibit miraculous, lifelike signs. This process, known as prana pratishta, is also part of sacred tattooing traditions such as Thai Sak Yant and a few others.',
      'The idea that the tattoo becomes “activated” or empowered by this process is nothing new but is very much neglected in our times. Through my in-depth training in Yogic ritual, an empowerment process is used to finalize the tattoo work once we have completed the journey. This is a very powerful, life-altering aspect of the work that binds the beginning, middle, and end into a mystical union—form infused with intention and charged with lifeforce.',
    ],
  },
];

export type Testimonial = { name: string; paragraphs: string[] };

export const testimonials: Testimonial[] = [
  { name: 'Jen', paragraphs: ['When I was first shown Shug’s artwork I knew immediately he was the artist that was supposed to design a tattoo I’ve been wanting for several years. I have no doubt I made the right decision going to see him. This piece came out more perfectly than I could have ever imagined, I absolutely love it!! The degree of thoughtfulness that Shug puts into his artwork and the inclusion of the ceremonies made the finished tattoo that much more meaningful. The conscious connection created through ceremony to your soul spirit and attention to every last detail of his work is truly remarkable. The studio is inviting, clean, bright, easy to access and has plenty of parking. Shug’s artwork and process speaks for itself, is special beyond compare, and is well worth the journey; I highly recommend.'] },
  { name: 'Otto', paragraphs: ['Having a vision of an original tattoo idea, I knew It would be challenging to find an artist that could not only appreciate the intention, but be willing to co-create an original work. I spent 3 years looking for the right artist and just as I gave up on my search Shug came into my life.', 'From the initial design work, to the process, the intention, ritual, professionalism, and not to mention the experience of receiving a tattoo from Shug being a spiritual endeavor all in it’s self.', 'The respect and gratitude I have for this man’s work is immense. Simply could not recommend him more highly.'] },
  { name: 'Audrey Gidman', paragraphs: ['My experience was phenomenal. Shug held space for the full intention of my tattoo and spent a lot of time honing the design, bringing in influence from his own background and spirituality to meet mine. The piece feels like a collaborative one in the best way, and absolutely pure. I am so grateful. We were in full dialogue every step of the way—we spent time together mixing colors to create a truly unique piece, we laughed, we shared stories. It’s still in its peeling stage and I’ve already received so many warm compliments. I look forward to our next sitting and I would recommend anyone in search of a talisman, or a tattooing experience outside of the current realm of western ordinary, to seek him out. Ohm Shantih Shug, thank you.'] },
  { name: 'Justin', paragraphs: ['This is the first time that I’ve ever had a tattoo artist be so intentional and thoughtful of what my next tattoo was going to be. Shug is unlike any other tattoo artist I’ve ever met. He spends time to get to know who you are and what it is your looking for. He talks about the healing power that tattoos have and how the artist themselves must be in the right state of mind when tattooing a person, as the energy they emit flows from them into the tattoo as well.', 'During our sessions we talked about life, how each of us is truly doing and there is a real connection when that takes place. I look forward to all of the work that will take place with Shug in the future.'] },
  { name: 'Jess', paragraphs: ['I have nothing but great things to say about this tattoo studio, and the artist, Shug. He gives his clients 100% of his focus, right from the start during the consultation, through to the completion of the artwork, and even weeks afterward. Most importantly, he adds an ethereal element to the experience, by ensuring that he has captured his client’s intention in life, whether it be to work through barriers, inspire motivation, release, grief, and any intention you can think of in between. This intention is at the core of each art piece, and he infuses this into the art during the tattoo process. It is a very spiritual, energetic process, that makes the tattoo much more than just a decorative piece. There is genuine power behind the art that will benefit the wearer.', 'Additionally, his line work, coloring, and shading skills are top notch. His studio is clean, comfortable, well-ventilated, and well-lit. I felt comfortable throughout a 6 hour session, with great communication to make sure I had enough breaks, water, etc. I highly recommend this tattoo shop.'] },
  { name: 'Ciaran O’Donnell', paragraphs: ['Shug is a creative and skilled artist that puts great care into his work. His belief in the power of tattoo guides all aspects of the process and makes for a very positive and complete experience. I highly recommend his services.'] },
  { name: 'Love', paragraphs: ['Awesome experience thru the entire process, from design ideas to execution. the artist is genuinely interested in creating a unique, intentional bond between you and the tattoo and works to help you strengthen that connection. atmosphere was 10/10, from the relaxing music to the gentle scents of palo santo. in casual conversation I ended up learning a lot about tattoos, their history and place in human culture+spirituality. absolutely walked away from the experience with much more than just a tattoo.'] },
  { name: 'Farrah', paragraphs: ['My experience with Shug was amazing. It was essential to me that the person who created art on my body was both artistically competent and spiritually connected to the process. Shug took time to understand the choice and meaning about what I was seeking and was supportive of my exploration until I felt in alignment with the image, size and placement. He provided a beautiful grounding and intention ritual. I felt contained and held in the space he has created. I am absolutely in love with my tattoo and I smile every time I look at it – exactly it’s intention.'] },
  { name: 'Meg Reategui', paragraphs: ['Beautiful and spiritually designed and developed together with Shug.', 'I have received 2 tattoos so far and plan on adding to them. Love them and this place!'] },
];

export const offerings = [
  { title: 'Yantras & Sacred Geometry', text: ['I am inspired by Yoga’s incredible use of art, specifically yantras, energetic geometric patterns, and visual talismans. I have trained extensively and received initiation into the sacred art of Yantra creation. I’m an experienced Yantra painter and am regularly commissioned to bring the power of Yantras into peoples’ homes.'] },
  { title: 'Woodworking & Carpentry', text: ['As a craftsman, I love to create custom building and carpentry projects that reflect the naturalness and beauty of Yogic life. I have extensive experience in natural construction, carving, and custom furniture making.'] },
  { title: 'Tattoo Retreats — Immersion Experience', text: ['Retreats at sat manav ashram are your opportunity to create a very focused and immersive tattoo experience. These can be customized to fit the needs of your tattoo journey and are created specific for each person.'] },
  { title: 'Kirtan — The Music of Yoga', text: ['I am a member of Shiva Lila, the Yogi trio of Sat Manav Yoga Ashram. We play to expand our experience of reality though sound. Sanskrit chants create frequencies of fulfillment and enlightenment, known as Nada Yoga—“union with sacred sound.”', 'Sung in a call-and-response format, Kirtan is a true concert, an opportunity to come together, celebrating our most precious possession: Life!'] },
];
