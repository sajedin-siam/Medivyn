const MOODS = ['', 'Very low', 'Low', 'Okay', 'Good', 'Very good']
const MOOD_EMOJI = ['', '😞', '🙁', '😐', '🙂', '😄']
export const moodLabel = (m: number) => `${MOOD_EMOJI[m]} ${MOODS[m]}`
