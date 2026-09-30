export type Category = 'Music & arts' | 'Technology' | 'Sports' | 'Workshops' | 'Community'
export type CampusEvent = {
  id: string; title: string; category: Category; date: string; time: string; duration: number;
  venue: string; organizer: string; description: string; image: string; price: number;
  capacity: number; attendees: number; featured?: boolean; owned?: boolean;
}
export type Registration = { id: string; eventId: string; name: string; email: string; course: string; registeredAt: string }
export type Profile = { name: string; email: string; course: string; campus: string }
export const categories: Category[] = ['Music & arts', 'Technology', 'Sports', 'Workshops', 'Community']
export const seedEvents: CampusEvent[] = [
  { id: 'prism-26', title: "Prism '26: The Cultural Fest", category: 'Music & arts', date: '2026-10-16', time: '16:00', duration: 360, venue: 'Central Grounds', organizer: 'The Cultural Collective', description: 'Three days. A thousand memories. Our biggest campus celebration returns with live bands, independent artists, food pop-ups, and a campus full of possibility. Bring your people, discover your new favorite artist, and stay for the golden-hour headline set. Your pass covers the opening day; entry to all stages and the creative market is included.', image: '/images/festival.jpg', price: 0, capacity: 1200, attendees: 846, featured: true },
  { id: 'hack-the-future', title: 'Hack the Future 2026', category: 'Technology', date: '2026-10-03', time: '09:00', duration: 480, venue: 'Innovation Hub, Block B', organizer: 'Developer Student Club', description: 'Big ideas start with a little curiosity. Team up with makers, designers, and developers for an all-day hackathon. Build something that makes campus life better, get guidance from industry mentors, and pitch your prototype. Beginners are welcome, teams can form on the day, and snacks and Wi-Fi are on us. Bring your laptop and charger.', image: '/images/hackathon.jpg', price: 0, capacity: 200, attendees: 128 },
  { id: 'unplugged', title: 'Unplugged: Under the Stars', category: 'Music & arts', date: '2026-10-05', time: '18:30', duration: 180, venue: 'The Amphitheatre', organizer: 'The Music Society', description: 'A little acoustic music, a sky full of stars, and your favorite people. Settle in for an intimate evening of campus bands, soulful covers, and original songs. Bring a picnic blanket, grab a bite from the food stalls, and enjoy an evening worth putting your phone away for. Limited open-mic spots are available at the venue.', image: '/images/music.jpg', price: 149, capacity: 300, attendees: 214 },
  { id: 'hoop-hustle', title: 'Hoop & Hustle: 3×3 Basketball', category: 'Sports', date: '2026-10-07', time: '15:00', duration: 180, venue: 'Outdoor Basketball Courts', organizer: 'Campus Sports Council', description: 'Your court. Your crew. Join our friendly 3-on-3 basketball tournament with mixed-skill brackets, a free-throw challenge, and plenty of sideline energy. Sign up individually and we will help you find a team. Wear sports shoes, bring a water bottle, and be ready to play. Spectators are always welcome.', image: '/images/basketball.jpg', price: 0, capacity: 90, attendees: 62 },
  { id: 'design-jam', title: 'The Design Playground', category: 'Workshops', date: '2026-10-09', time: '11:00', duration: 150, venue: 'Creative Studio, Arts Block', organizer: 'Design & Innovation Club', description: 'Turn your what-ifs into something real. Explore visual storytelling, try a hands-on design challenge, and learn the basics of Figma with student designers. No experience needed. Bring a laptop if you have one; shared workstations and all workshop resources will be provided.', image: '/images/workshop.jpg', price: 99, capacity: 60, attendees: 42 },
  { id: 'color-outside', title: 'Color Outside the Lines', category: 'Music & arts', date: '2026-10-11', time: '14:00', duration: 120, venue: 'Art Courtyard', organizer: 'The Cultural Collective', description: 'Take an afternoon off and make a little mess. Paint, sketch, and experiment at our outdoor art social. All materials are provided, from canvas and brushes to a very good playlist. Come on your own or bring a friend. You will leave with your own piece of art and a few new connections.', image: '/images/art.jpg', price: 199, capacity: 80, attendees: 56 },
  { id: 'campus-connect', title: 'Good People, Great Conversations', category: 'Community', date: '2026-10-13', time: '17:00', duration: 120, venue: 'Student Commons', organizer: 'Campus Connect', description: 'New to campus or just ready to meet someone new? Join a relaxed evening of board games, conversation starters, and shared stories. There is no agenda and no pressure. Drop in, find a seat, and make a connection over complimentary coffee and snacks.', image: '/images/community.jpg', price: 0, capacity: 120, attendees: 83 },
]
export const clubs = [
  { id: 'dev', name: 'Developer Student Club', short: 'DS', category: 'Technology', color: 'lavender', members: 342, description: 'Build cool things. Break things. Learn together. Your home for code, hackathons, and big ideas.' },
  { id: 'music', name: 'The Music Society', short: 'MS', category: 'Music & arts', color: 'peach', members: 218, description: 'From first chords to headline sets. Find your sound and the people who get it.' },
  { id: 'sports', name: 'Campus Sports Council', short: 'SC', category: 'Sports', color: 'green', members: 486, description: 'A team for every player and a game for every day. Let’s get moving.' },
  { id: 'design', name: 'Design & Innovation Club', short: 'DI', category: 'Workshops', color: 'pink', members: 156, description: 'Stay curious. Make something unexpected. A space for every kind of creative.' },
  { id: 'culture', name: 'The Cultural Collective', short: 'CC', category: 'Music & arts', color: 'yellow', members: 374, description: 'Art, culture, and the moments that bring a whole campus together.' },
  { id: 'connect', name: 'Campus Connect', short: 'CO', category: 'Community', color: 'blue', members: 291, description: 'Small conversations, big friendships. Helping everyone find their people.' },
]
export function dateLabel(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Date(date + 'T12:00:00').toLocaleDateString('en-US', options || { month: 'short', day: 'numeric' })
}
export function timeLabel(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`
}
export const priceLabel = (price: number) => price ? `₹${price}` : 'Free'
export const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()
