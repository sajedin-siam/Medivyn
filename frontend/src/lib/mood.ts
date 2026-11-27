import { Annoyed, Frown, Laugh, Meh, Smile, type LucideIcon } from 'lucide-react'

const MOODS = ['', 'Very low', 'Low', 'Okay', 'Good', 'Very good']
// line icons instead of emoji: they render the same on every device and follow the text colour
export const MOOD_ICONS: LucideIcon[] = [Meh, Frown, Annoyed, Meh, Smile, Laugh]
export const moodLabel = (m: number) => MOODS[m] ?? ''
